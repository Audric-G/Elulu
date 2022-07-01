// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/1/2022
// DESCRIPTION: Test!
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbed = require(`${require('process').cwd()}/utilities/embed`).create;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test')
        .setDefaultPermission(false),
    async execute(interaction){
        const embed = createEmbed('Supposedly Restricted Command Test, may or may not be working.');
        interaction.reply({ embeds: [embed] });
    },
    permissionType: "admin",
}
