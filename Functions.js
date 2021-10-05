//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/15/2021
//DESCRIPTION: All the main functionality of the bot
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const GuildManagement = require('./GuildManagement')
const Message = require('./Message')
const MusicPlayer = require('./MusicPlayer')

var commands = []
var timeouts = []

class Command{
    constructor(data, functionality){
        this.root = data.root
        this.accessLevel = data.accessLevel
        this.parameters = data.parameters
        this.description = data.description
        this.examples = data.examples
        this.Run = functionality

        commands[data.root] = this
    }
}

class Timeout{
    constructor(memberObj, duration, channel){
        this.member = memberObj
        this.homeChannel = memberObj.member.voice.channelID
        this.timeoutChannel = GuildManagement.GetGuild(memberObj.member.guild.id).TimeoutChannel
        this.duration = duration
        this.channel = channel
    }

    StartTimer(){
        timeouts[this.member.member.user.id] = this

        BadBoiTimeout(this.member, this.duration, this.channel)

        var object = this
        setTimeout(function() {
            console.log(`timeout for ${object.member.member.user.username} has ended`)
            object.member.inTimeout = false
            FixBadBoi(object.member.member, object.homeChannel)
            timeouts[object.member.member.user.id] = undefined
        }, this.duration*1000)
    }
}

new Command(
    {
        root:"vc",
        accessLevel:1,
        parameters:["summon/join", "leave"],
        description:"Make the bot join or leave your voice channel.",
        examples:[">vc join", ">vc summon", ">vc leave"]
    }, 
    (input, Err) => {
        if (input.params[0] === "summon" || input.params[0] === "join"){
            VCSummon(true, input)
        }else if(input.params[0] === "leave"){
            VCSummon(false, input)
        }else{
            Err('There was a syntax error with that command', input.channel)
        }
})

new Command(
    {
        root:"help",
        accessLevel:1,
        parameters:["any command"],
        description:"Displays all commands or specific information about a command given as a parameter",
        examples:[">help", ">help music"]
    },
    (input) => {
        if (typeof input.params[0] === 'undefined') {
            for (i = 0; i < commands.length; i++){
                
            }
        }else{
            //Loop through command aliases, if one can't be found default to sending help table
        }
    }
)

new Command(
    {
        root:"say",
        accessLevel:1,
        parameters:["anything except @mentions"],
        description:"Repeats whatever you type after 'say'",
        examples:[">say Elulu is the best bot in the world!"]
    },
    (input) => {
        Say(input)
    }
)

new Command(
    {
        root:"show",
        accessLevel:1,
        parameters:["access/level", "@mention", "status"],
        description:"Access/level tells you your or someone else's access level to the bot. Status will show the bot's status",
        examples:[">show access", ">show access @Gieven", ">show status"]
    },
    (input, Err) => {
        if (input.params[0].toLowerCase() === 'access' || input.params[0].toLowerCase() === 'level'){
            if(typeof input.mentions[0] === 'undefined'){
                let name = input.member.nickname === null ? input.member.user.username : input.member.nickname
                let accessLevel

                if (input.mentions.size > 0){
                    let member = input.mentions.values().next().value
                    accessLevel = GetAccessLevel(member)
                    name = member.nickname === null ? member.user.username : member.nickname
                }else{
                    accessLevel = GetAccessLevel(input.member)
                }
                
                let message = `${name}, Access level: ${accessLevel}\n\n`

                if (accessLevel >= 2) {
                    message = message + 'You have access to elevated and standard level commands.';
                } else if (accessLevel == 1) {
                    message = message + 'You do not have access to elevated commands, however you do have access to standard level commands.';
                } else {
                    message = message + 'You do not have access to use this bot.';
                }

                Message.Send(message, input.channel);
            }else{
                console.log(input.mentions[0])
            }
        }else if(input.params[0].toLowerCase() === 'status'){
            ShowStatus(input.channel)
        }else{
            Err('You need to provide the proper parameters', input.channel)
        }
    }
)

new Command(
    {
        root:"roll",
        accessLevel:1,
        parameters:["any whole number > 1"],
        description:"Rolls a number between 0 (exclusive) and the passed number (inclusive). Defaults to 20",
        examples:[">roll", ">roll 100"]
    },
    (input, Err) => {
        if (typeof input.params[0] === 'undefined'){
            let result = Roll()
            Message.Send(`${input.member.nickname === null ? input.member.user.username : input.member.nickname} rolled a ${result} out of ${20}`, input.channel)
        }else if (!isNaN(input.params[0])){
            let result = Roll(input.params[0])
            Message.Send(`${input.member.nickname === null ? input.member.user.username : input.member.nickname} rolled a ${result} out of ${input.params[0]}`, input.channel)
        }else{
            Err(`If you're going to add anything else it has to be a number`, input.channel)
        }
    }
)

new Command(
    {
        root:"music",
        accessLevel:1,
        parameters:["play", "skip", "pause", "resume", "search", "queue", "Youtube Link/Given Search"],
        description:"Controls for the music functionality of Elulu. Play requires the full youtube link of the desired video. You can type anything after search and it will search for a video as if you did on youtube itself. Queue shows the current music queue of the guild",
        examples:[">music play https://www.youtube.com/watch?v=dQw4w9WgXcQ", ">music search Welcome to the Cum Zone", ">music pause", ">music resume", "music skip", "music queue"]
    },
    (input, Err) => {
        switch(input.params[0].toLowerCase()){
            case 'play':{
                if(typeof input.params[1] === 'undefined'){
                    Err("You need to provide a youtube link to use play.", input.channel)
                    return
                }
                input.channel.bulkDelete(1)
                MusicPlayer.AddQueue(input)
                break;
            }
            case 'skip':{
                MusicPlayer.Skip(input)
                break;
            }
            case 'pause':{
                MusicPlayer.Pause(input)
                break;
            }
            case 'resume':{
                MusicPlayer.Resume(input)
                break;
            }
            case 'search':{
                if(typeof input.params[1] === 'undefined'){
                    Err("You need to give me something to search for.", input.channel)
                    return
                }
                input.channel.bulkDelete(1)
                MusicPlayer.Search(input)
                break;
            }
            case 'queue':{
                MusicPlayer.ShowQueue(input)
                break;
            }
            default:{
                Message.Send("Hey buddy, you blow in from stupid town?", input.channel)
            }
        }
    }
)

new Command(
    {
        root:"disable",
        accessLevel:2,
        parameters:["Commands"],
        description:"Disables access to the standard level commands. Also can disable specific standard commands",
        examples:[">disable", ">disable help \(You monster\)"]
    },
    (input) => {
        Message.Send('Disabling standard commands...', input.channel)
        GuildManagement.GetGuild(input.channel.guild.id).BotOn = false
    }
)

new Command(
    {
        root:"enable",
        accessLevel:2,
        parameters:null,
        description:"Enables access to the standard level commands",
        examples:[">enable"]
    },
    (input) => {
        Message.Send('Enabling standard commands...', input.channel)
        GuildManagement.GetGuild(input.channel.guild.id).BotOn = true
    }
)

new Command(
    {
        root:"set",
        accessLevel:2,
        parameters:["embedcolor/embed/color", "HexRGB#"],
        description:"Allows you to set guild variables.",
        examples:[">set embed 009900"]
    },
    (input) => {
        //set stuff
    }
)

new Command(
    {
        root:"timeout",
        accessLevel:2,
        parameters:["@mention", "time (seconds)"],
        description:"Puts someone in the guilds timeout voice channel. To use this command you must enabled it in the guilds variables. Default time is 30",
        examples:[">timeout @Gieven", ">timeout @Gieven 10"]
    },
    (input, Err) => {
        let defaultDuration = 30
        if (input.member.voice.channel === null){
            Err("Please don't try to put someone in timeout when they're not even in a voice channel", input.channel)
            return
        }

        if (isNaN(input.params[0])){
            Err("Invalid duration given, using default value (30)", input.channel)
        }

        input.mentions.forEach((member) => {
            let duration = isNaN(input.params[0]) ? defaultDuration : input.params[0]
            let timeout = new Timeout(GuildManagement.GetMember(member), duration, input.channel)
            timeout.StartTimer()
        })
    }
)

new Command(
    {
        root:"mute",
        accessLevel:2,
        parameters:['N/A'],
        description:"Mutes everyone else in the voice channel.",
        examples:[">mute"]
    },
    (input, Err) => {
        if (input.member.voice.channel === null){
            Err("Mute is a command meant only for when you're in a voice channel with other people.", input.channel)
            return
        }

        input.member.voice.channel.members.forEach(member => {
            if (member !== input.member){
                member.voice.setMute(true)
            }else{
                member.voice.setMute(false)
            }
        })
    }
)

new Command(
    {
        root:"unmute",
        accessLevel:2,
        parameters:['N/A'],
        description:"Unmutes everyone else in the voice channel.",
        examples:[">unmute"]
    },
    (input, Err) => {
        if (input.member.voice.channel === null){
            Err("Mute is a command meant only for when you're in a voice channel with other people.", input.channel)
            return
        }

        input.member.voice.channel.members.forEach(member => {
            member.voice.setMute(false)
        })
    }
)

new Command(
    {
        root:"purge",
        accessLevel:2,
        parameters:['Number'],
        description:"Deletes the given number of messages.",
        examples:[">unmute"]
    },
    (input) => {
        if (!isNaN(input.params[0])) {
            input.channel.bulkDelete(input.params[0]).then( messages => {
                console.log(`Bulk deleted ${messages.size} in ${input.channel.name}`)
            }).catch(console.error)
        }
    }
)

function Roll(maxNum){
    if (maxNum == null) {
        maxNum = 20; //Default roll number.
    }
    return Math.floor(Math.random() * (maxNum)) + 1
}

function CheckHex(input){
    return /^#([A-Fa-f0-9]{3}$)|([A-Fa-f0-9]{6}$)/.test(input)
}

function ParseCommand(command, Callback){
    //Get command string in an array
    var commandArray = String(command).split(" ")
    //Remove empty indexes and remove the mentions from the array and gets rid of the command prefix
    for (i = 0; i < commandArray.length; i++) {
        if (commandArray[i].length == 0) {
            commandArray.splice(i--, 1)
        } else if(commandArray[i].startsWith('@')){
            commandArray.splice(i--, 1)
        } else if(i == 0){
            commandArray[0] = commandArray[0].replace('>', '')//USE GUILD VARIABLES USE GUILD VARIABLES USE GUILD VARIABLES USE GUILD VARIABLES USE GUILD VARIABLES USE GUILD VARIABLES USE GUILD VARIABLES
            //commandArray[0] = commandArray[0].replace(GuildManagement.GetGuild(msgInfo.member.guild.id).CommandPrefix, '') <-^
        }
    }

    let root = commandArray[0].toLowerCase()
    commandArray.splice(0, 1)
    var input = {
        root:root,
        params:commandArray,
        mentions:command.mentions.members,
        member:command.member,
        channel:command.channel,
    }
    //Return input for actions.
    Callback(input)
}

function GetAccessLevel(member){
    let guild = GuildManagement.GetGuild(member.guild.id)
    const adminRole = guild.AdminRoles
    const standardRole = guild.StandardRoles
    let accessLevel = 0

    for (i = 0; i < standardRole.length; i++) {
        if (member.roles.cache.has(standardRole[i].id)) {
          accessLevel = 1
        }
    }

    for (i = 0; i < adminRole.length; i++) {
        if (member.roles.cache.has(adminRole[i].id)) {
          accessLevel = 2
        }
    }

    return accessLevel
}

function ShowStatus(channel) {
    if (GuildManagement.GetGuild(channel.guild.id).BotOn) {
      Message.Send('I\`m currently on and operational!', channel);
    } else {
      Message.Send('I\`m currently turned off, please ask an admin to activate me.', channel);
    }
}

async function BadBoiTimeout(member, duration, channel) {
    let timeoutChannel = GuildManagement.GetGuild(member.member.guild.id).TimeoutChannel.id;

    if (member.member.voice.channel !== null) {
      Message.Send(`${member.member.user.username} has been jailed for his crimes and sent away for ${duration} seconds.`, channel);
  
      member.inTimeout = true;
      member.member.voice.setChannel(timeoutChannel);
  
      //Add badboi role to user
      let hasRole = false;
  
      while (hasRole === false) {
        await member.member.roles.add(GuildManagement.GetGuild(member.member.guild.id).BadBoiRole.id).then(member => {
          if (member.roles.cache.has(GuildManagement.GetGuild(member.guild.id).BadBoiRole.id)) {
            hasRole = true;
            console.log(`The badboi role has been added to ${member.user.username}`);
          } else{
            console.log(`There was an issue adding the badboi role to ${member.user.username}. Trying again.`);
          }
        });
      }
    } else {
      Message.Send(`Please don't timeout people when they're not even in a VC`, channel);
      timeouts[member.member.user.id] = undefined
      member.inTimeout = false
    }
}

async function FixBadBoi(member, ogChannel) {
    var guild = GuildManagement.GetGuild(member.guild.id)

    if (member.roles.cache.has(guild.BadBoiRole.id)) {
      var hasRole = true;
  
      while (hasRole) {
        await member.roles.remove(guild.BadBoiRole.id).then(member => {
          if (member.roles.cache.has(guild.BadBoiRole.id)) {
            console.warn(`There was an issue removing a role from ${member.user.username}. Trying again`);
          } else {
            console.log(`The bad boi role was removed from ${member.user.username}.`);
            hasRole = false;
          }
        });
      }
      if (member.voice.channel !== null) {
        member.voice.setChannel(ogChannel);
      }
    }
}

function VCSummon(join, data) {
    let guild = GuildManagement.GetGuild(data.member.guild.id);
  
    if (data.member.voice.channel === null) {
      Message.Send(join ? 'You need to be in a VC for me to join' : 'You can\'t tell me to leave if you\'re not even in a VC, meanie.', data.channel, true);
      return;
    }

    //Checks if user is in another VC, only disconnects if bot is in the same VC sender is.
  if (guild.VoiceConnection != null) {
    if (!join && guild.VoiceConnection.channel == data.member.voice.channel) {
      Message.Send('Leaving VC', data.channel, true);
      guild.VoiceConnection.disconnect();
      guild.Queue = [];
      return;
    } else if (!join) {
      Message.Send('You can\'t tell me to leave if you\'re not even in my voice channel. *hmph*.', data.channel, true);
      return;
    }
  }

  if (!join) {
    Message.Send('I\'m not even in a voice chat ;-;', data.channel, true)
    return;
  }

  //Checks if a voice channel already exists.
  if (join && guild.VoiceConnection != null) {
    Message.Send(guild.VoiceConnection.channel == data.member.voice.channel ? 'I\'m already in your voice channel.' : 'Sorry, I\'m already in another voice chat. :c', data.channel, true)
  } else {
    Message.Send('Joining VC', data.channel, true)
    data.member.voice.channel.join().then(connection => guild.VoiceConnection = connection);
  }
}

function Say(input) {
    let message = input.params;
    let newMessage = '';
  
    for (i = 0; i < message.length; i++) {
      newMessage = newMessage + message[i] + ' ';
    }
  
    if (typeof message[0] === 'undefined'){
      newMessage = '. . .';
    }
    Message.Send(newMessage, input.channel);
  }

module.exports = {
    RunCommand: function(command){
        var accessLevel = GetAccessLevel(command.member)

        //Check if member is authorized to use the bot
        if (accessLevel == 0) {
            Message.Send('You are not authorized to use this bot. Probably didn\'t even give a valid command, baaaka.', command.channel)
            return
        }

        ParseCommand(command, (input) => {
            if(typeof commands[input.root] !== 'undefined'){
                if (accessLevel < commands[input.root].accessLevel){
                    Message.Send('You are not authorized to use this command', input.channel)
                }else if (GuildManagement.GetGuild(command.channel.guild.id).BotOn === false && commands[input.root].accessLevel <= 1){
                    Message.Send("Standard commands are currently disabled, please tell an admin to turn them on.", input.channel)
                }else{
                    commands[input.root].Run(input, (error, channel) => {
                        Message.Send(error, channel, true, 'error')
                    })
                }
            }else{
                Message.Send('That command does not exist. You can type ```>help``` for a list of valid commands.', input.channel)
            }
        })
    },

    Roll:Roll,

    GetParamEmbed: function(guildParms){
        
    }
}