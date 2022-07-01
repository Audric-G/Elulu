// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/1/2022
// DESCRIPTION: Deploy Guild Commands
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = {
    Deploy: (guildId, commands) => { return new Promise(async (resolve, reject) => {
        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v9');
        const { clientId } = require('../config.json');
        const { token } = require('../config.json');
        const { GetGuild } = require('./database');

        const guild = GetGuild(guildId);

        const rest = new REST({ version: 9 }).setToken(token);

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
            .then(resolve("Successfully Updated Guild Commands."))
            .catch((error) => reject(error));
    })},
}

