// AUTHOR: GIEVEN#8031
// LAST UPDATED: 10/10/2021
// DESCRIPTION: Returns the input given as an embed object. No there's no point to it I just like how embeds look.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const Discord = require('discord.js');

module.exports = {
    create: function(input){
        const embed = new Discord.MessageEmbed()
            .setColor('#0066FF')
            .setDescription(input)
    
        return embed;
    }
}