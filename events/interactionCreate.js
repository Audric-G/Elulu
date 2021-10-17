//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/10/2021
//DESCRIPTION: Handles the 'interactionCreate' event.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction){
        if (!interaction.isCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if(!command){
            await interaction.reply('You speak funny words, magic man.');
            return;
        } 

        try{
            await command.execute(interaction);
        } catch (err){
            console.error(err);
            await interaction.reply('Ruh Roh, something went very fucky wucky.');
        }
    }
}