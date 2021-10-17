//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/17/2021
//DESCRIPTION: Repeats whatever the user says.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbed = require(`${require('process').cwd()}/utilities/embed`).create;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Repeats what the user says')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Input given by user.')
                .setRequired(true)),
    async execute(interaction){
        const embed = createEmbed(interaction.options.getString('input'));
        interaction.reply({ embeds: [embed] });
    }
}