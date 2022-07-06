// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/6/2022
// DESCRIPTION: Handles data storage and fetching.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

//TEMP TESTING """""""DATABASE"""""""
//mapped by guild id.
let guilds = {
    "650500852515209236": {
        id: "650500852515209236",               //Id of guild
        name: "Nutlandia",                      //Name of guild
        nsfwEnabled: false,                     //Enables or disables nsfw commands
        adminRole: "651197737655730216",        //Specifies admin role for access to admin level commands
        publicRole: "",                         //Specifies public role for access to public commands in restricted mode
        restrictedRole: "",                     //Specifies restricted role for denying access to commands to specific members
        defaultRestrictPublicCommands: false,   //Enables or disables restricted mode by default
    }
}

module.exports = {
    GetGuild: function(guildId){ return new Promise((resolve, reject) => {
        resolve(guilds[guildId]);
    })
    },
}