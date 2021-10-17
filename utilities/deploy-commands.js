//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/10/2021
//DESCRIPTION: Globally deploy commands
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./auth.json');


function GetCommands(){
    const commands = [];
    const workingDir = require('process').cwd();
    const generalCommands = fs.readdirSync(`${workingDir}/commands/general`).filter(file => file.endsWith('.js'));
    const adminCommands = fs.readdirSync(`${workingDir}/commands/admin`).filter(file => file.endsWith('.js'));
    
    for (const file of generalCommands){
        const command = require(`${workingDir}/commands/general/${file}`);
        commands.push(command.data.toJSON());
    }
    
    for (const file of adminCommands){
        const command = require(`${workingDir}/commands/admin/${file}`);
        commands.push(command.data.toJSON());
    }

    return commands
}

module.exports = {
    Global: function(){
        const commands = GetCommands();
        
        const rest = new REST({ version: 9 }).setToken(token);
        
        rest.put(Routes.applicationCommands(clientId), { body: commands },)
            .then(console.log('(client)deploy-commands: Updated Global Commands'))
            .catch(console.error);
    },

    Local: function(id){
        const commands = GetCommands();
        
        const rest = new REST({ version: 9 }).setToken(token);
        
        rest.put(Routes.applicationGuildCommands(clientId, id), { body: commands },)
            .then(console.log(`(${id})deploy-commands: Updated Local Commands`))
            .catch(console.error);
    }
}