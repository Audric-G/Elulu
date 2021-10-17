//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/17/2021
//DESCRIPTION: Pong!
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pongs the user.'),
    async execute(interaction){
        interaction.reply('Pong!');
    }
}