// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/1/2022
// DESCRIPTION: Handles data storage and fetching.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// TO-DO: IMPLEMENT DATABASE, CURRENTLY HARD CODING AN OBJECT FOR TESTING

const fs = require('fs');

const GUILDS = {
    "650500852515209236": {
        id: "650500852515209236",
        name: "Nutlandia",
        nsfwEnabled: false,
        adminRole: "651197737655730216",
        publicRole: "651027205052301312",
        restrictPublic: false,
    }
}

module.exports = {
    GetGuild: function(guildID){
        return GUILDS[guildID];
    },
}