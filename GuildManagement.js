//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/15/2021
//DESCRIPTION: Manages all the connected guild and user objects
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const database = require('./Database');
const GuildInitialize = require('./GuildInitialize');

class Guild {
    constructor(guildParams, fromDatabase){
        console.log(`Compiling guild data for ${guildParams.Guild.name}`);

        this.id = guildParams.id;
        this.Guild = guildParams.Guild;
        this.Members = !guildParams.Members ? [] : guildParams.Members;
        this.CommandPrefix = guildParams.CommandPrefix;
        this.DisabledCommands = guildParams.DisabledCommands;

        this.NSFWEnabled = guildParams.NSFWEnabled;
        this.NSFWBlacklist = guildParams.NSFWBlacklist;

        this.GeneralBotColor = guildParams.GeneralBotColor;
        this.ErrorColor = guildParams.ErrorColor;
    
        this.VoiceConnection = null;
        this.Queue = [];

        this.AdminRoles = guildParams.AdminRoles;
        this.StandardRoles = guildParams.StandardRoles;
        this.BotOn = false;
        this.BotEnforcementEnabled = guildParams.BotEnforcementEnabled;
        this.TimeoutChannel = guildParams.TimeoutChannel;
        this.BadBoiRole = guildParams.BadBoiRole;
        this.AutoRoleEnabled = guildParams.AutoRoleEnabled;
        this.AutoRole = guildParams.AutoRole;

        guilds[this.Guild.id] = this;

        if (fromDatabase === false){
          database.AddGuild(this);
        }
    }
}

class Member {
  constructor(guildMember){
    console.log(`Creating member object for ${guildMember.user.username}.`)

    this.member = guildMember
    this.experience = 0
    this.monies = 0
    this.inTimeout = false

    guilds[this.member.guild.id].Members[this.member.id] = this
  }
}

class User {
  constructor(user, fromDatabase, info){
    console.log(`Compiling user data for: ${user.username}`)
  if(fromDatabase === true){
      this.Playlist = info.playlist === null ? [] : info.playlist.split(' ')
      this.NSFWBlacklist = info.nsfwBlacklist === null? [] : info.nsfwBlacklist.split(' ')
    } else {
      this.Playlist = []
      this.NSFWBlacklist = []
      database.AddUser(this)
    }

    users[this.User.id] = this
  }
}

var guilds = []
var users = []

function GetGuilds(client){
  console.log('\n----------[[Getting Guild Data]]----------')
  for(let [id] of client.guilds.cache.entries()){
    database.GetGuild(id, async function(error, results){
      let guild = client.guilds.cache.get(id);
  
      if(!!error){
        console.log(error);
      }else{
        if (results[0]) {
          new Guild(JSON.parse(results[0].guild), true, guild);
        }
      }
    })
  }
}

function MakeUserObject(id, Callback){
  console.log('>Creating new user object.')

  database.GetUser(id, function(error, results){
    if (!!error){
      Callback(error)
    }else{
      var fromDatabase = results[0] === 'undefined' ? false : true
      client.users.fetch(id).then(user => {
        new User(user, fromDatabase, results[0])
        Callback()
      }).catch(console.log)
    }
  })
}

module.exports = {
  Initialize: function(client){
    GetGuilds(client)
  },
  
  GetGuild: function(id){
    return guilds[id]
  },

  GetUser: function(id){
    if (typeof users[id] === 'undefined'){
      MakeUserObject(id, (error) => {
        if (!!error){
          console.log(error)
          return
        }else{
          setTimeout(function Wait(){
            if (typeof users[id] === 'undefined'){
              Wait
            }else{
              return users[id]
            }
          }, 100)
        }
      })
    }else{
      return users[id]
    }
  },

  GetMember: function(member){
    if (typeof guilds[member.guild.id].Members[member.id] === 'undefined') {
      return new Member(member)
    }else{
      return guilds[member.guild.id].Members[member.id]
    }
  },

  AddGuild: function(guild, initialized, guildParams){
    if(initialized === false){
      GuildInitialize.Initialize(guild);
    }else{
      new Guild(guildParams, false);
    }
  },

  AddUser: async function(member){
    new User(member.user, false)

    //If guild has set an auto role, automatically adds the role for the member
    if (guilds[member.guild.id].AutoRoleEnabled === true) {
      let hasRole = false

      while (hasRole === false) {
        await member.roles.add(guilds[member.guild.id].autoRole).then(member => {
          if (member.roles.cache.has(guilds[member.guild.id].autoRole)) {
            hasRole = true
            console.log(`The auto role has been added to ${member.user.username}`)
          } else{
            console.error(`There was an issue adding the auto role to ${member.user.username}. Trying again.`)
          }
        })
      }
    }
  },

  DeleteGuild: function(guild){
    database.RemoveGuild(guild.id, function(error, result){
      if(!!error){
        console.error(`Error being removed from ${guild.name}\n${error}`)
      }else{
        console.log(`I was successfully removed from ${guild.name}`)
      }
    })
    guilds.splice(guild.id, 1)
  },

  DeleteUser: function(user){
    database.RemoveUser(user.id, function(error, result){
      if(!!error){
        console.error(`Error removing ${user.username}\n${error}`)
      }else{
        console.log(`I successfully removed ${user.username} from the database`)
      }
    })
    users.splice(user.id, 1)
  }
}