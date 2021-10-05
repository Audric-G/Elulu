//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/15/2021
//DESCRIPTION: General bot.
//Version: 1.1.1
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//#region [VARIABLES]
//[[ REQUIRES ]]
const Discord = require('discord.js');

const auth = require('./Auth.json');
const GuildManagement = require('./GuildManagement');
const Message = require('./Message');
const Functions = require('./Functions');
const GuildInitialize = require('./GuildInitialize');

//[[ CONSTANTS ]]
const client = new Discord.Client()
//const PREFIX = '>'

//#endregion

//#region [EVENTS]
client.on('ready', async () => {
  const EluluID = client.user.id

  console.info('Did nothing unsuccesfully!')
  console.info(`Logged in as ${client.user.tag}!`)
  client.user.setStatus('online')
  
  GuildManagement.Initialize(client);

  setTimeout(() => {
    client.channels.cache.each(channel => {
      if (channel.type == 'voice') {
        if (channel.members.has(EluluID)) {
          var guild = GuildManagement.GetGuild(channel.guild.id);
          console.log(`Automatically joining vc ${channel.name} in ${channel.guild.name}`)
          channel.join().then(connection => guild.VoiceConnection = connection)
        }
      }
    })
  }, 1000)
});

client.on('guildCreate', guild => {
  GuildManagement.AddGuild(guild, false)
});

client.on('guildDelete', guild => {
  GuildManagement.DeleteGuild(guild)
});

client.on('typingStart', (channel, user) => {
  //Return if message is from DM
  if(typeof channel.guild === 'undefined') {return;}

  //Return if guild is not in the database yet
  if(typeof GuildManagement.GetGuild(channel.guild.id) === 'undefined') {return;}

  let number = Functions.Roll(100);

  if (number == 5) {
    Message.Send(`Stop typing ${user.username}, you're annoying.`, channel);
  }
})

client.on('guildMemberAdd', member => {
  let guild = GuildManagement.GetGuild(member.guild.id)

  if (guild.AutoRoleEnabled === true){
    member.roles.add(guild.AutoRole).then(console.log('Auto added role')).catch(console.error)
  }
})

client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
  let guild = GuildManagement.GetGuild(oldVoiceState.channel === null ? newVoiceState.channel.guild.id : oldVoiceState.channel.guild.id)
  
  //Return if guild is not in the database yet
  if (typeof guild === 'undefined'){return;}

  //If the bot is manually removed, disconnect voice connection and reset queue
  if (newVoiceState.member.user.bot === true && newVoiceState.channel === null && guild.VoiceConnection !== null) { 
    guild.VoiceConnection.disconnect()
    guild.VoiceConnection = null
    guild.Queue = []
    return
  }

  //Don't run if the user is leaving the vc or if the member is a bot
  if (newVoiceState.channel !== null && newVoiceState.member.user.bot !== true) {
    let member = GuildManagement.GetMember(newVoiceState.member)

    if (member.InTimeout){
      newVoiceState.member.voice.setChannel(guild.TimeoutChannel)
    }
  }
})

client.on('message', async msg => {
    if (msg.member === null) { return; }  //Return if message is from DM
    if (msg.member.user.bot) { return; }  //Return if member is a bot

    if(typeof GuildManagement.GetGuild(msg.guild.id) === 'undefined'){
      
      if (msg.content.toLowerCase() === 'initialize' && msg.author.id === client.guilds.cache.get(msg.guild.id).ownerID) {
        if(msg.member.user.dmChannel){
          msg.member.user.send(`Hey we already got a session going on here!`);
          return;
        }
        let user = await msg.guild.members.fetch(client.guilds.cache.get(msg.guild.id).ownerID)
        GuildInitialize.Initialize(msg.guild, user, async guildOBJ => {
          GuildManagement.AddGuild(guildOBJ.Guild, true, guildOBJ);
        });
      }
      return;
    }
    let guild = GuildManagement.GetGuild(msg.guild.id)


    if (String(msg).toLowerCase().indexOf(guild.CommandPrefix.toLowerCase()) == 0) {
        Functions.RunCommand(msg)
    }
  });
//#endregion

//#region [FUNCTIONS]
/*//////////////////////////////////////////////////////////////////
*MAIN FUNCTION
*///////////////////////////////////////////////////////////////////
/*async function Main(msg){
  return
  if (commandType == 'standard' && guild.BotOn) {
    switch(commandArray[0]) {//-----------------------------------------------------------------------------------V STANDARD LEVEL COMMANDS START V
      case 'vc':                                                                                          //COM[VC]: 
        if (commandArray[1] == 'summon' || commandArray[1] == 'join') {                                   //PARAMS(SUMMON/JOIN, LEAVE)
          VCSummon(true, msgInfo)
        } else if (commandArray[1] == 'leave') {
          VCSummon(false, msgInfo)
        }
        break//------------------------------------------------------------------------------------------
      case 'help':                                                                                        //COM[HELP]
        if (commandArray[1] != null) {
          GetHelpDescription(commandArray[1], commandType, msgInfo.channel)
          return
        }
        ShowHelp(msgInfo.channel, commandType)
        break//------------------------------------------------------------------------------------------
      case 'say':                                                                                         //COM[SAY]
        Say(commandArray, msgInfo.channel)
        msg.delete()
        break;//------------------------------------------------------------------------------------------
      case 'show':                                                                                        //COM[SHOW]
        if (commandArray[1] == 'access' || commandArray[1] == 'level') {                                  //PARAMS(ACCESS/LEVEL -> @USER, STATUS)
          if (typeof msg.mentions.members.first() != 'undefined' && commandArray[2] != null) {
            let member = msg.mentions.members.first()
            ShowAccess(member, msgInfo.channel)
          }else if (commandArray[2] != null) {
            Message.Send('SYNTAX ERROR: You need to mention a user. (ex: >show access @USER)', msgInfo.channel, true, 'error')
            return
          }else {
            ShowAccess(msgInfo.member, msgInfo.channel)
          }
        }
        break//------------------------------------------------------------------------------------------
      case 'roll':                                                                                        //COM[ROLL]
        if (commandArray[1] != null && Number(commandArray[1]) <= 1 || isNaN(Number(commandArray[1]))) {  //PARAMS(ROLL#)
          Message.Send('You entered an invalid roll number, please enter a **number** greater than 1.', msgInfo.channel, true, 'error')
          return
        } else {
          Message.Send(`Rolling a D${commandArray[1] != null ? commandArray[1] : '20'}...\n\nResult: ${Roll(commandArray[1])}`, msgInfo.channel)
        }
        break//------------------------------------------------------------------------------------------
      case 'music':                                                                                       //COM[MUSIC]
        if (commandArray[1] === 'play') {                                                                 //PARAMS(PLAY -> YOUTUBELINK, STOP/PAUSE, RESUME, SKIP/NEXT)
          if (commandArray[2] == null) {
            Message.Send('You need to provide a link or specify you want your playlist', msgInfo.channel, true, 'error')
            return
          }
          await YoutubePlay(msgInfo, commandArray[2])
          msg.delete()
        } else if (commandArray[1] === 'skip') {
          if (guild.VoiceConnection.dispatcher === null) {
            Message.Send(`I'm not even playing anything you dope`, msgInfo.channel)
          } else {
            MusicEnd(msgInfo, 'skip')
          }
        } else if (commandArray[1] === 'pause' || commandArray[1] === 'stop') {
          try {guild.VoiceConnection.dispatcher.pause();}
          catch {Message.Send(`I'm not even playing anything to pause.`, msgInfo.channel);}
        } else if (commandArray[1] === 'resume') {
          try {guild.VoiceConnection.dispatcher.resume();}
          catch {Message.Send(`I'm not even playing anything to resume.`, msgInfo.channel);}
        } else if (commandArray[1] === 'search') {
          if (commandArray[2] == null) {
            Message.Send('You need tell me what you want to search for');
            return;
          }
          let search = '';
          for (i = 2; commandArray.length; i++) {
            if (typeof commandArray[i] === 'undefined') {
              break;
            }
            search = search + `${commandArray[i]} `
          }
          console.log(`Youtube search: ${search}`);
          YoutubeSearch(msgInfo, search);
        } else if (commandArray[1] === 'queue') {
          ShowQueue(msgInfo.channel);
        }
        break;//------------------------------------------------------------------------------------------
      default:                                                                                            //DEFAULT: INVALID COMMAND
        Message.Send('That command does not exist, please type `>help` for a list of commands', msgInfo.channel, true, 'error');
        break;//------------------------------------------------------------------------------------------^ STANDARD LEVEL COMMANDS END ^
    }
  } else if (commandType == 'admin') {
    switch(commandArray[0]) {//-----------------------------------------------------------------------------------V ADMIN LEVEL COMMANDS START V
      case 'shutdown':                                                                                    //COM[SHUTDOWN]
        if (!guild.BotOn) {
          Message.Send('Shhhh... I\'m already off.', msgInfo.channel);
          return;
        }
        Shutdown(msgInfo.channel);
        break;//------------------------------------------------------------------------------------------
      case 'start':                                                                                       //COM[START]
        if (guild.BotOn) {
          Message.Send('I\'m already on you know.', msgInfo.channel);
          return;
        }

        guild.BotOn = true;
        Message.Send(`Version: ${version}\nStarting up...`, msgInfo.channel);

        client.user.setStatus('online');
        break;//------------------------------------------------------------------------------------------
      case 'help':                                                                                        //COM[HELP]
        if (commandArray[1] != null) {
          GetHelpDescription(commandArray[1], commandType, msgInfo.channel);
          return;
        }
        ShowHelp(msgInfo.channel, commandType);
        break;//------------------------------------------------------------------------------------------
      case 'set':                                                                                         //COM[SET]
        if (commandArray[1] == 'embedcolor' || commandArray[1] == 'color' && typeof commandArray[2] != 'undefined') {                //PARAMS(EMBEDCOLOR/COLOR, HEXACOLOR/DEFAULT/RESET)
          if (commandArray[2] == 'default' || commandArray[2] == 'reset') {
            guilds[msg.member.guild.id].GeneralBotColor = guilds[msg.member.guild.id].DefaultColor;
          } else {
            if (checkHex(commandArray[2])) {
              guilds[msg.member.guild.id].GeneralBotColor = commandArray[2];
            } else {
              Message.Send('SYNTAX ERROR: You entered an invalid hexadecimal color value. (ex: >set embedcolor #0099FF)', msgInfo.channel, true, 'error');
              return;
            }
          }
          Message.Send('Successfully changed chat color, do you like it? c:', msgInfo.channel);
        }
        break;//------------------------------------------------------------------------------------------
      case 'timeout':
        const defaultTimeout = 30;
        let timeoutTime;
        if (typeof msg.mentions.members.first() !== 'undefined') {
          if (!isNaN(commandArray[1]) && commandArray[1] !== null) {
            timeoutTime = commandArray[1];
          } else if (!isNaN(commandArray[2]) && commandArray[2] !== null) {
            timeoutTime = commandArray[2];
          } else {
            timeoutTime = defaultTimeout;
          }
        }
        BadBoiTimeout(msgInfo.channel, msg.mentions.members.first(), timeoutTime);
        break;//------------------------------------------------------------------------------------------
      default:                                                                                            //DEFAULT: INVALID ADMIN COMMAND
        Message.Send('That admin command does not exist, please type `admin>help` for a list of commands', msgInfo.channel, true, 'error');
        break;//------------------------------------------------------------------------------------------^ ADMIN LEVEL COMMANDS END ^
    }
  }
}

/*//////////////////////////////////////////////////////////////////
/*Put bad vc users in timeout
*///////////////////////////////////////////////////////////////////


/*//////////////////////////////////////////////////////////////////
*Revoke bad boi status from vc users
*///////////////////////////////////////////////////////////////////


/*//////////////////////////////////////////////////////////////////
*Play audio from youtube
*///////////////////////////////////////////////////////////////////
/*
async function YoutubePlay(msgInfo, link) {
  var guild = guilds[msgInfo.member.guild.id];
  var queue = guild.queue;
  var error = false;
  var embed;

  //If the first entry of the queue is undefined, sets the link.
  if (typeof queue[0] == 'undefined') {
    queue[0] = {link: link, member: msgInfo.member, info: null};
  };

  //Only play music from people in the same vc as the bot
  if (typeof msgInfo.member.voice.channel === 'undefined' || msgInfo.member.voice.channel === null) {
    Message.Send('You need to be in a VC for me to play music', msgInfo.channel, true, 'error');
    return;
  } else if (guild.VoiceConnection === null) {
    Message.Send('You need to add me into a voice channel before I can play music.', msgInfo.channel, true, 'error');
    return;
  }
  if (guild.VoiceConnection.channel != msgInfo.member.voice.channel) {
    Message.Send('You need to be in the same voice channel as me to tell me to play music', msgInfo.channel, true, 'error');
    return;
  }

  //Adds music to queue if there's already something playing
  if (guild.musicPlaying === true) {
    AddQueue(msgInfo, link);
    return;
  }
  guild.musicPlaying = true;

  //Get stream from link
  stream = await ytdl(link, {quality: 'highestaudio', filter: 'audioonly'}).on('error', (reason) => {
    console.error(reason);
    Message.Send('Sorry but there was an issue with that link', msgInfo.channel, true, 'error');
    MusicEnd(msgInfo, 'error');
    error = true;
    return;
  });

  if (error === true) {
    return;
  }

  //Get video info if it hasn't already been gotten
  if (queue[0].info === null) {
    error = await ytdl.getBasicInfo(link, (error, info) => {
      if (!!error) {
        console.error(error);
        Message.Send(`There was an error getting video info, aborting playback`, msgInfo.channel, true, 'error');
        MusicEnd(msgInfo, 'error');
        return true;
      }
  
      queue[0].info = info;
      return false;
    });
  }
  
  //If there was an error getting video info don't continue.
  if (error === true) {
    return;
  } 
  
  embed = GetSongEmbed(queue[0])

  //Create writestream
  await stream.pipe(fs.createWriteStream(`./tmp_audio/${msgInfo.channel.guild.id}.mp4`));

  //Play audio after 5 seconds creating a buffer
  console.log('loading audio');
  Message.Send('Loading audio...', msgInfo.channel);
  setTimeout(function() {
    console.log('playing audio');
    Message.Send(embed, msgInfo.channel);
    guild.VoiceConnection.dispatcher = guild.VoiceConnection.play(fs.createReadStream(`./tmp_audio/${msgInfo.channel.guild.id}.mp4`)).on('finish', () => {
      MusicEnd(msgInfo, 'end');
    }).on('error', reason => {
      MusicEnd(msgInfo, 'dispatcher error');
      console.log(reason);
    });
  },5000);
}

/*//////////////////////////////////////////////////////////////////
/*Show the currently playing song
*///////////////////////////////////////////////////////////////////
/*
function GetSongEmbed(queueObj) {
  info = queueObj.info

  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  seconds = info.length_seconds % 60;
  minutes = Math.trunc(info.length_seconds / 60);

  if (minutes > 59) {
    hours = (Math.trunc(minutes / 60));
    minutes = minutes % 60;
  }

  seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  hours = hours < 10 ? `0${hours}` : `${hours}`;
    
  let time = hours == '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;

  const embed = new Discord.MessageEmbed()
  .setColor(guild.GeneralBotColor)
  .setTitle(`Playing: ${info.title}`)
  .setURL(queueObj.link)
  .setAuthor(`Queued by: ${queueObj.member.displayName}`, queueObj.member.user.avatarURL())
  .setDescription(`uploaded by: ${info.author.name}\nlength: ${time}`)
  .setTimestamp()
  .setFooter(`Likes: ${info.likes} || Dislikes: ${info.dislikes}`);

  return embed;
}

/*//////////////////////////////////////////////////////////////////
/*Properly define end of music, finds action to do next
*///////////////////////////////////////////////////////////////////
/*
function MusicEnd(msgInfo, reason){
  let guild = guilds[msgInfo.channel.guild.id]
  let queue = guild.queue

  //If dispatcher is running stop it
  if (guild.VoiceConnection.dispatcher !== null) {
    guild.VoiceConnection.dispatcher.end();
    guild.VoiceConnection.dispatcher = null;
    return;
  }
  
  guild.musicPlaying = false;

  console.log(`Song ended because ${reason}`);

  //Delete used file and then decide if the queue is empty or not
  function RemoveFile(callback) {
    fs.remove(`./tmp_audio/${msgInfo.channel.guild.id}.mp4`)
      .then(() => console.log('successfully removed file'))
      .catch(err => console.error(err))
      .finally(() => callback())
  }

  RemoveFile(() => {
    //Delete first entry in queue and move to next
    queue.splice(0,1);

    //Checks if queue is empty, if not play next song in queue
    if (queue.length === 0){
      Message.Send(`The queue is empty, tell me to play a song when you want.`, msgInfo.channel);
      queue = []; 
    } else {
      Message.Send(`Moving to next song in queue...\n\nSongs left in queue: ${queue.length-1}`, msgInfo.channel);
      YoutubePlay(msgInfo, queue[0].link);
    }
  });
}

/*//////////////////////////////////////////////////////////////////
/*Search and play audio from youtube
*///////////////////////////////////////////////////////////////////
/*
function YoutubeSearch(msgInfo, search){
  ytsr.getFilters(search, function(err, filters) {
    if (!!err) {
      console.error('There was an error with a youtube search: ' + err);
      Message.Send('Sowwy but there was an error while searching for results :(', msgInfo.channel);
      return;
    }

    filter = filters.get('Type').find(o => o.name === 'Video');
    let options = {safeSearch: false, limit: 1, nextpageRef: filter.ref}
    ytsr(null, options, function(err, searchResult) {
      if(!!err) {
        console.error('There was an error with a youtube search: ' + err);
        Message.Send('Sowwy but there was an error while searching for results :(', msgInfo.channel);
        return;
      }
      YoutubePlay(msgInfo, searchResult.items[0].link);
      return;
    })
  })
}

/*//////////////////////////////////////////////////////////////////
/*Send the queue to the channel that requested it
*///////////////////////////////////////////////////////////////////
/*
async function ShowQueue(channel) {
  let queue = guilds[channel.guild.id].queue
  let queueString = '';

  if (typeof queue[0] === 'undefined'){
    Message.Send(`I'm not playing anything right now you dope.`, channel);
    return;
  }

  for (var i=1; i < queue.length; i++){
    if (typeof queue[i] === 'undefined'){
      break;
    }

    queueString = queueString + `Queued by: ${queue[i].member.displayName} | ${queue[i].info.title}\n\n`
  }
  Message.Send(`currently playing: ${queue[0].info.title}\n\n queue entries: (total ${queue.length - 1})\n${queueString}`, channel);
}

/*//////////////////////////////////////////////////////////////////
/*Add a link to the queue
*///////////////////////////////////////////////////////////////////
/*
async function AddQueue(msgInfo, link) {
  let queue = guilds[msgInfo.channel.guild.id].queue
  await ytdl.getBasicInfo(link, (error, info) => {
    if (!!error){
      Message.Send('There was an error with a link, I\'m not adding that to the queue!', msgInfo.channel, true, 'error');
      return;
    }

    queue[queue.length] = {link: info.video_url, member: msgInfo.member, info: info}
    Message.Send(`Adding song to queue: ${info.title}\n\nTotal entries in queue: ${queue.length - 1}`, msgInfo.channel);
  });
}

/*//////////////////////////////////////////////////////////////////
/*Repeat user message
*///////////////////////////////////////////////////////////////////
/*

/*//////////////////////////////////////////////////////////////////
/*Show help description for commands
*///////////////////////////////////////////////////////////////////
/*
function GetHelpDescription(sentCommand, commandType, channel) {
  let command;
  let description;

  if (commandType == 'standard') {
    switch (sentCommand) {
      case 'help':
        command = 'help';
        description = 'Decription: Help can be used to give more detailed information of commands, an example use would be ```>help music```';
        break;
      case 'vc':
        command = 'vc';
        description = `Subcommands: join/summon, leave\n
          Examples:\n\`${PREFIX}vc join\`,\t\`${PREFIX}vc leave\`\n
          Description: Allows bot to leave or join your voice channel.`;
        break;
      case 'say':
        command = 'say';
        description = `Subcommands: <text>\n
          Examples:\n\`${PREFIX}say ${client.user.name} is awesome!\`\n
          Description: Repeats whatever you type after \`${PREFIX}say\`.`;
        break;
      case 'show':
        command = 'show';
        description = `Subcommands: status, access/level -> <@user>\n
          Examples:\n\`${PREFIX}show access @${client.user.username}\`,\t\`${PREFIX}show status\`\n
          Description: access/level will show yours or someone elses access level to the bot, status will return the on status of the bot.`;
        break;
      case 'roll':
        command = 'roll'
        description = `Subcommands: <integerValue>\n
          Examples:\n\`${PREFIX}roll 6\`\n
          Description: Rolls a specified number sided die, if no number is given I will roll a D20.`;
        break;
      case 'music':
        command = 'music'
        description = `Subcommands: play -> <youtubeLink>, play -> playlist, stop/pause, resume, skip/next\n
          Examples:\n\`${PREFIX}music play https://www.youtube.com/watch?v=dQw4w9WgXcQ\`,\t\`${PREFIX}music play playlist\`,\t\`${PREFIX}music stop/pause\`,\t\`${PREFIX}music resume\`,\t\`${PREFIX}music skip\`\n
          Description: Allows you and your friends to listen to your banger youtube music. play -> <youtubeLink> will play the specified video's audio, play -> playlist will play your saved playlist, I'm sure you can guess the other options.`;
        break;
      default:
        command = 'Command not found'
        description = `You must give a valid command such as \`${PREFIX}help music\`.`;
        break;
    }
  }else if (commandType == 'admin') {
    switch (sentCommand) {
      case 'help':
        command = 'help';
        description = 'Really....';
        break;
      case 'start':
        command = 'start'
        description = `Subcommands: N/A\n
          Examples:\n\`${ADMINPREFIX}start\`\n
          Description: Starts the bot up, I\`m ready to roll!`;
        break;
      case 'shutdown':
        command = 'shutdown'
        description = `Subcommands: N/A\n
          Examples:\n\`${ADMINPREFIX}shutdown\`\n
          Description: Shuts the bot down, I\`m feeling a bit sleepy...`;
        break;
      case 'set':
        command = 'set'
        description = `Subcommands: embedcolor/color -> <hexValue>\n
        Examples:\n\`${ADMINPREFIX}set embedcolor #A8F28B\`\n
        Description: Sets the embed color of the bot, let's change things up!`;
        break;
      default:
        command = 'Command not found'
        description = `You must give a valid command such as \`${ADMINPREFIX}help set\`.`;
        break;
    }
  }
  let embed = new Discord.MessageEmbed()
  .setTitle(String(commandType).toUpperCase() + ` HELP: ` + String(command).toUpperCase())
  .setDescription(`Command information:`)
  .addField(`\`${commandType == 'standard' ? PREFIX : ADMINPREFIX}${command}\``, description);
  
  Message.Send(embed, channel);
}

/*//////////////////////////////////////////////////////////////////
/*Summon or remove bot from vc
*///////////////////////////////////////////////////////////////////


  


/*//////////////////////////////////////////////////////////////////
*Shutdown bot
*///////////////////////////////////////////////////////////////////
/*
function Shutdown(channel) {
  
}

/*//////////////////////////////////////////////////////////////////
/*DM a new server owner and initalize their server
*///////////////////////////////////////////////////////////////////
/*
async function InitializeServer(guild){
  guildParameters = {
    id:`${guild.id}`,
    nsfwEnabled:false,
    nsfwBlacklist:'',
    generalBotColor:'#009900',
    errorColor:'#E31230',
    adminRoles:undefined,
    standardRoles:undefined,
    botEnforcementEnabled:false,
    timeoutChannel:undefined,
    badBoiRole:undefined,
    autoRoleEnabled:false,
    autoRole:undefined
  }

  let user = guild.owner.user;
  //tallyTracker helps keep track of required parameters
  let tallyTracker = {
    basicRoles: false,
    enforcement: false,
    autoRole: false
  };
  let paramsReady = false;

  if (user.dmChannel == null) {
    guild.owner.user.createDM();
  }

  await user.send(`Hi! I'm Elulu, I'm here to help get myself set up in your server ${guild.name}. There's a few important variables that need to be set before I can join everyone.`);
  await user.send(`The syntax for setting a variable is \`\`\`Set VariableName Value\`\`\`\nIn the case of an array\`\`\`Set VariableName Value1 Value2 ect\`\`\`\nyou can always type \`\`\`show progress\`\`\`and I'll resend the list with the variables you have set so far.\n\nI'll tell you when you've set all the variables you need to and once you're done you can type \`\`\`done\`\`\` and I'll be ready to role in your server!\n\nI'll send the list of variables that need to be set.`);
  await user.send(returnServerVariables(guildParameters));
  await user.send(`Oh and when setting a variable be sure not to put any spaces in the variable name, for example \`\`\`General Bot Color\`\`\` would become \`\`\`GeneralBotColor\`\`\``);

  const collector = user.dmChannel.createMessageCollector(message => message.author.bot === false, { idle: 300000 });

  collector.on('collect', async message => {
    collector.resetTimer();
    messageArray = String(message).split(" ");

    if (messageArray[0].toLowerCase() === 'done' && paramsReady === true) {
      user.send('Everything\'s all set! Closing connection.');
      user.dmChannel.delete();
      new DiscordGuild(guildParameters);
      collector.stop();
      return;
    } else if (messageArray[0].toLowerCase() === 'done') {
      user.send('There are still variables that need to be set, you can type ```show progress``` to get the current list of variables');
      return;
    }

    if (messageArray[0].toLowerCase() === 'set') {
      if (typeof messageArray[1] === 'undefined') {
        user.send('You must type a variable to change.');
        return;
      }
      switch(messageArray[1].toLowerCase()) {
        case('nsfwenabled'):
        if (messageArray[2].toLowerCase() === 'true' || messageArray[2].toLowerCase() === 'false') {
          guildParameters.nsfwEnabled = messageArray[2].toLowerCase() == 'true' ? true : false;
          user.send('set');
        } else {
          user.send('You need to either state true or false to set this parameter');
        }
          break;
        case('generalbotcolor'):
          if (checkHex(messageArray[2])) {
            guildParameters.generalBotColor = messageArray[2];
            user.send('set');
          } else {
            user.send('There was an issue, please be sure to provide a valid HEX number');
          }
          break;
        case('errorcolor'):
          if (checkHex(messageArray[2])) {
             guildParameters.errorColor = messageArray[2];
            user.send('set');
          } else {
            user.send('There was an issue, please be sure to provide a valid HEX number');
          }
          break;
        case('adminroles'):
        guildParameters.adminRoles = '';
        for (i = 2; i < messageArray.length; ++i) {
          if (guild.roles.cache.has(messageArray[i])) {
            guildParameters.adminRoles = guildParameters.adminRoles + ` ${messageArray[i]} `;
            user.send('set');
          } else {
            user.send('That role doesn\'t seem to exist in your server');
          }
        }
          break;
        case('standardroles'):
        guildParameters.standardRoles = '';
          for (i = 2; i < messageArray.length; ++i) {
            if (guild.roles.cache.has(messageArray[i])) {
              guildParameters.standardRoles = guildParameters.standardRoles + ` ${messageArray[i]} `;
              user.send('set');
            } else {
              user.send('That role doesn\'t seem to exist in your server');
            }
          }
          break;
        case('botenforcement'):
          if (messageArray[2].toLowerCase() === 'true' || messageArray[2].toLowerCase() === 'false') {
            guildParameters.botEnforcementEnabled = messageArray[2].toLowerCase() == 'true' ? true : false;
            user.send('set');
          } else {
            user.send('You need to either state true or false to set this parameter');
          }
          
          break;
        case('timeoutchannel'):
          if (guild.channels.cache.has(messageArray[2])) {
            guildParameters.timeoutChannel = messageArray[2];
            user.send('set');
          } else {
            user.send('That channel doesn\'t seem to exist in your server');
          }
          break;
        case('badboirole'):
          if (guild.roles.cache.has(messageArray[2])) {
            guildParameters.badBoiRole = messageArray[2];
            user.send('set');
          } else {
            user.send('That role doesn\'t seem to exist in your server');
          }
          break;
        case('autoroleenabled'):
          if (messageArray[2].toLowerCase() === 'true' || messageArray[2].toLowerCase() === 'false') {
            guildParameters.autoRoleEnabled = messageArray[2].toLowerCase() == 'true' ? true : false;
            user.send('set');
          } else {
            user.send('You need to either state true or false to set this parameter');
          }
          break;
        case('autorole'):
          if (guild.roles.cache.has(messageArray[2])) {
            guildParameters.autoRole = messageArray[2];
            user.send('set');
          } else {
            user.send('That role doesn\'t seem to exist in your server');
          }
        break;
        default:
          user.send('There was a syntax error');
        break;
      }
    } else if (messageArray[0].toLowerCase() == "show") {
      user.send(returnServerVariables(guildParameters));
    } else {
      user.send('There was a syntax error');
    }

    if (typeof guildParameters.adminRoles !== 'undefined' && typeof guildParameters.standardRoles !== 'undefined') {
      tallyTracker.basicRoles = true;
    }

    if (guildParameters.botEnforcementEnabled == true && typeof guildParameters.timeoutChannel !== 'undefined' && typeof guildParameters.badBoiRole !== 'undefined') {
      tallyTracker.enforcement = true;
    } else if (guildParameters.botEnforcementEnabled == true) {
      paramsReady = false;
    }

    if (guildParameters.autoRoleEnabled == true && typeof guildParameters.autoRole !== 'undefined') {
      tallyTracker.autoRole = true;
    } else if (guildParameters.autoRoleEnabled == true) {
      paramsReady = false;
    }

    if (tallyTracker.basicRoles == true) {
      if (guildParameters.botEnforcementEnabled == false && guildParameters.autoRoleEnabled == false) {
        paramsReady = true;
      } else if (guildParameters.botEnforcementEnabled == true && guildParameters.autoRoleEnabled == false && tallyTracker.enforcement == true) {
        paramsReady = true;
      } else if (guildParameters.botEnforcementEnabled == false && guildParameters.autoRoleEnabled == true && tallyTracker.autoRole == true) {
        paramsReady = true;
      } else if (guildParameters.botEnforcementEnabled == true && guildParameters.autoRoleEnabled == true && tallyTracker.enforcement == true && tallyTracker.autoRole == true) {
        paramsReady = true;
      }
    }

    if (paramsReady == true) {
      user.send("There's enough parameters set for me to be set up in your sever. You can still change parameters just note that if you enable other features you will need to set their associated parameters.\n\nWhenever you're done just type ```done```");
    }
  });
  
  collector.on('end', () => {
    if (user.dmChannel !== null) {
      user.send('You\'ve been idle for too long, closing connection.');
      user.dmChannel.delete();
    }
  })
}

/*//////////////////////////////////////////////////////////////////
/*Creates an embed based on the guilds server variables
*///////////////////////////////////////////////////////////////////
/*
function returnServerVariables(guildParams) {
  const embed = new Discord.MessageEmbed()
  .setColor('#A8f28B')
  .setTitle('Server Variables:')
  .setDescription(`
  NSFW Enabled: ${guildParams.nsfwEnabled}\n
  General Bot Color: ${guildParams.generalBotColor}\n
  Error Color: ${guildParams.errorColor}\n
  Admin Roles: ${typeof guildParams.adminRoles == 'undefined' ? 'NOT SET ||\(Provide the ID of the role\(s\), To get the ID of a role or channel you must enable Developer Mode which can be found in settings under appearance at the bottom under Advanced. Once enabled you can right click the role in your server\'s settings and copy the ID.||' : guildParams.adminRoles}\n
  StandardRoles: ${typeof guildParams.standardRoles == 'undefined' ? 'NOT SET ||\(Provide the ID of the role\(s\)\)||' : guildParams.standardRoles}\n
  Bot Enforcement: ${guildParams.botEnforcementEnabled + " ||Bot Enforcement allows me to give someone a pre-defined role for a limited time, this role should not have access to join voice channels for the proper effect, and I'll move people to a pre-defined \"bad boi corner\". Sure just not letting them join a vc for the timeout duration would be easy but it\'s about sending a message.||"}\n
  Timeout Channel: ${typeof guildParams.timeoutChannel == 'undefined' ? 'NOT SET ||\(Provide the ID of the channel\) NOTE: this does not need to be set if \`\`Bot Enforcement\`\` is \`\`false\`\`||': guildParams.timeoutChannel}\n
  Bad Boi Role: ${typeof guildParams.badBoiRole == 'undefined' ? 'NOT SET ||\(Provide the ID of the channel\) NOTE: this does not need to be set if \`\`Bot Enforcement\`\` is \`\`false\`\`||': guildParams.badBoiRole}\n
  Auto Role Enabled: ${guildParams.autoRoleEnabled}\n
  Auto Role: ${typeof guildParams.autoRole == 'undefined' ? 'NOT SET ||\(Provide the ID of the role\) NOTE: this does not need to be set if \`\`Auto Role Enabled\`\` is \`\`false\`\`||' : guildParams.autoRole}\n\n`);

  return embed;
}


//#endregion
*/
client.login(auth.token);//Login bot