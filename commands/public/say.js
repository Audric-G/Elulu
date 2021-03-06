// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/6/2022
// DESCRIPTION: Repeats whatever the user says.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbed = require('../../utilities/embed').create;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Repeats what the user says')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Input given by user.')
                .setRequired(true)),
    async execute(interaction){
        return new Promise((resolve, reject) => {
            resolve(interaction.options.getString('input'));
        });
    }
}