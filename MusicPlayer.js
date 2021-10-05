//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/1/2021
//DESCRIPTION: Youtube player functionality.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
const fs = require('fs-extra')
const GuildManagement = require('./GuildManagement')
const Message = require('./Message')

class Song {
    constructor(input){
        this.link = input.params[1]
        this.member = input.member
        this.channel = input.channel
        this.info
    }
}

async function MakeEmbed(song){
    let guild = GuildManagement.GetGuild(song.channel.guild.id)
    let info

    try{
        info = await ytdl.getInfo(song.link)
    }catch(error){
        Message.Send(`Sorry but there was an error getting the meta data from this link`, song.channel)
        return
    }

    info = info.videoDetails

    guild.Queue[guild.Queue.length - 1].info = info

    let seconds = 0;
    let minutes = 0;
    let hours = 0;
  
    seconds = info.lengthSeconds % 60;
    minutes = Math.trunc(info.lengthSeconds / 60);
  
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
    .setTitle(`Now Playing: ${info.title}`)
    .setURL(song.link)
    .setAuthor(`Queued by: ${song.member.displayName}`, song.member.user.avatarURL())
    .setDescription(`uploaded by: ${info.author.name}\nlength: ${time}`)
    .setTimestamp()
    .setFooter(`Likes: ${info.likes} || Dislikes: ${info.dislikes}`);
  
    Message.Send(embed, song.channel)
}

const functions = module.exports = {
    Play: async function(song){
        try{
            stream = await ytdl(song.link, {quality: 'highestaudio', filter: 'audioonly'})
        }catch(error){
            await Message.Send(`Sorry but there was an issue getting the stream.`, song.channel)
            Cleanup(GuildManagement.GetGuild(song.channel.guild.id).Queue[0])
            return
        }

        await stream.pipe(fs.createWriteStream(`./tmp_audio/${song.channel.guild.id}.mp4`))
        
        //Start playing after 1 second buffer
        setTimeout(function(){
            var guild = GuildManagement.GetGuild(song.channel.guild.id)
            MakeEmbed(guild.Queue[0])
            
            guild.VoiceConnection.dispatcher = guild.VoiceConnection.play(fs.createReadStream(`./tmp_audio/${song.channel.guild.id}.mp4`)).on('finish', async () => {
                Cleanup(song)
              }).on('error', async err => {
                await Message.Send(`Sorry but an error occured during playback, logging error.`, song.channel)
                console.error(err);
                Cleanup(song)
              })
        },2000)
    },

    Pause: function(input){
        let guild = GuildManagement.GetGuild(input.channel.guild.id)

        if (guild.VoiceConnection.dispatcher === null){
            Message.Send(`Nothing is being played. What do you want me to do, pause time?`, input.channel)
        }else{
            guild.VoiceConnection.dispatcher.pause()    
        }
    },

    Resume: function(input){
        let guild = GuildManagement.GetGuild(input.channel.guild.id)

        if (guild.VoiceConnection.dispatcher === null){
            Message.Send(`No I'm not gonna resume nothing.`, input.channel)
        }else{
            guild.VoiceConnection.dispatcher.resume()
        }
    },

    Skip: function(input){
        let guild = GuildManagement.GetGuild(input.channel.guild.id)

        if (guild.VoiceConnection.dispatcher === null){
            Message.Send(`I'm not even playing anything I can't skip nothing.`, input.channel)
        }else{
            guild.VoiceConnection.dispatcher.end()
        }
    },

    Search: async function(input){
        let search = ''

        for (i = 1; input.params.length; i++){
            if (typeof input.params[i] === 'undefined'){
                break
            }
            search = search + `${input.params[i]} `
        }
        
        searchResult = await ytsr(search, {limit: 1})
        input.params[1] = searchResult.items[0].url

        this.AddQueue(input)
    },

    ShowQueue: async function(input){
        let guild = GuildManagement.GetGuild(input.channel.guild.id)
        let queue = guild.Queue
        let queueString = ''

        if (typeof guild.Queue[0] === 'undefined'){
            Message.Send(`I'm not playing anything right now you dope.`, input.channel)
            return
        }

        for (var i=1; i < queue.length; i++){
            if (typeof queue[i] === 'undefined'){
              break;
            }

            let info
            try{
                info = await ytdl.getInfo(queue[i].link)
                queueString = queueString + `Queued by: ${queue[i].member.displayName} | ${info.videoDetails.title}\n\n`
            }catch(error){
                queue.splice(i--, 1)
                queueString = queueString + 'Removed due to metadata error.\n\n'
            }
        }

        Message.Send(`currently playing: ${queue[0].info.title}\n\n queue entries: (total ${queue.length - 1})\n${queueString}`, input.channel);
    },

    AddQueue: function(input){
        console.log('Adding song to queue.')
        let guild = GuildManagement.GetGuild(input.channel.guild.id)

        guild.Queue[guild.Queue.length] = new Song(input)

        if(guild.Queue.length == 1){
            this.Play(guild.Queue[0])
        }else{
            Message.Send(`Adding song to queue, total songs in queue: ${guild.Queue.length - 1}`, input.channel)
        }
    }
}

async function Cleanup(song){
    let guild = GuildManagement.GetGuild(song.channel.guild.id)

    guild.Queue.splice(0, 1)
    await fs.remove(`./tmp_audio/${song.channel.guild.id}.mp4`)
        .then(() => console.log(`Successfully removed audio file.`))
        .catch((error) => console.error(`File Remove error. \n\n${error}`))

    if (guild.Queue.length > 0){
        functions.Play(guild.Queue[0])
    }else{
        Message.Send(`The queue is empty, you can tell me to play something any time you want.`, song.channel)
    }
}