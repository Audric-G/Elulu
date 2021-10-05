//AUTHOR: GIEVEN#8031
//LAST UPDATED: 11/3/2020
//DESCRIPTION: Communication functionality for the bot
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//const GetGuild = require('./GuildManagement').GetGuild

module.exports = {
    Send: function(message, channel, useEmbed, messageType){
        const Discord = require('discord.js')
        const GetGuild = require('./GuildManagement').GetGuild

        let guild = GetGuild(channel.guild.id)
        let embedColor = guild.GeneralBotColor
  
        //Checks if message is an error, sets the embed color to the guild's error color
        if (String(messageType).toLowerCase() == 'error') {
            embedColor = guild.ErrorColor
        }

        //Checks if useEmbed is undefined and set it to true, this is so I don't have to explicitly state it's using an embed in every message
        if (typeof useEmbed === 'undefined') {
            useEmbed = true
        }
  
        //If message is an embed, sends that embed instead of the default one and returns
        if (typeof message === 'object') {
            channel.send(message)
            return
        }
  
        //Sends the message in an embed.
        if (useEmbed) {
            const embed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setDescription(message)
    
            channel.send(embed)
        } else {
            channel.send(`> ${message}`)
        }
    }
}