//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/10/2021
//DESCRIPTION: Handles the 'ready' event once. Checks if necessary folders exist
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    name: 'ready',
    once: true,
    execute(client){
        console.log(`||Logged in as ${client.user.tag}||\n>Did nothing unsuccessfully!\n`);
        const fs = require('fs');
        const workingDir = require('process').cwd();
        const DataManager = require(`${workingDir}/utilities/DataManager`);

        if (!fs.existsSync(`${workingDir}/data/guilds`)){
            fs.mkdirSync(`${workingDir}/data/guilds`, {recursive:true}, (err) => console.error(err));
        }
    
        if (!fs.existsSync(`${workingDir}/data/users`)){
            fs.mkdirSync(`${workingDir}/data/users`, {recursive:true}, (err) => console.error(err));
        }

        DataManager.CheckClientGuildMap(client.guilds.cache);
    },
};