// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Handles the 'ready' event on login.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    name: 'ready',
    once: true,
    async execute(client){
        //Outputs to console that bot has logged in
        console.log(`>Logged in as ${client.user.tag}\n>Did nothing unsuccessfully!\n`);
        
        // Check if the client application is loaded, if not fetch it.
        if (!client.application?.owner) await client.application?.fetch();

        // Deploy commands for each guild || CURRENTLY HARD-CODED SINGLE GUILD FOR TESTING ||
        client.CommandManager.DeployToGuild(client, await client.guilds.fetch('650500852515209236')).then(message => console.log(message));
    }
};

