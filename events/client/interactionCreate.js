//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/10/2021
//DESCRIPTION: Handles the 'interactionCreate' event.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const createEmbed = require('../../utilities/embed').create;

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction){
        if (!interaction.isCommand()) return;
        const command = interaction.client.CommandManager.commands.get(interaction.commandName);

        if(!command){
            await interaction.reply('You speak funny words, magic man.');
            return;
        }

        let embed;

        command.execute(interaction).then(message => {
            embed = createEmbed(message);
        }).catch(err => {
            embed = createEmbed(err);
        }).finally(() => {
            interaction.reply({ embeds: [embed]});
        });
    }
}