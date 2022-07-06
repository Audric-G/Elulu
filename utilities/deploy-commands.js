// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/6/2022
// DESCRIPTION: Deploy Guild Commands
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

async function SetPermissions(client, guildId) { return new Promise(async (resolve, reject) => {
    resolve();
});
}

module.exports = {
    DeployCommands: (client, guildId, commands) => { return new Promise(async (resolve, reject) => {
        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v9');
        const { token } = require('../config.json');

        //Kinda nasty, should refactor later
        let commandsData = [];
        commands.forEach(command => commandsData.push(command.data));

        const rest = new REST({ version: 9 }).setToken(token);
        
        //Register commands on guild's application commands
        await rest.put(Routes.applicationGuildCommands(client.application.id, guildId), { body: commandsData });

        //Set specific permissions if extra customization is needed [WIP]
        await SetPermissions(client, guildId)
            .then(resolve(`ID: ${guildId}\n\t-Successfully Updated Guild Commands.`));
    })},
}

