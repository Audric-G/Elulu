// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/6/2022
// DESCRIPTION: Pong!
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbed = require('../../utilities/embed').create;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pongs the user.'),
    async execute(interaction){
        const embed = createEmbed('Pong!')
        interaction.reply({ embeds: [embed] });
    }
}