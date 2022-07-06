// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/6/2022
// DESCRIPTION: Handles the 'ready' event on login.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
const { DeployCommands } = require('../utilities/deploy-commands.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client){
        //Outputs to console that bot has logged in
        console.log(`>Logged in as ${client.user.tag}\n>Did nothing unsuccessfully!\n`);
        
        // Check if the client application is loaded, if not fetch it.
        if (!client.application?.owner) await client.application?.fetch();

        // Deploy commands for each guild, sending a COPY of the client commands in an array.
        DeployCommands(client, '650500852515209236', client.commands)
            .then(val => {
                console.log(val);
            });
    }
};

