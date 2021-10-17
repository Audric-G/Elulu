//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/17/2021
//DESCRIPTION: Handles data storage and fetching.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const workingDir = require('process').cwd();

class Guild {
    constructor(guild){
        this.id = guild.id;
        this.nsfwEnabled = false;
        this.nsfwBlacklist = ['loli', 'shota', 'cub'];
        this.owner = guild.owner;
        this.adminRoles = [];
        this.standardRoles = [];
        this.initialized = false;

        StoreJSON(this);
    }
}

class Member {
    constructor(member) {
        this.id = member.user.id;
        this.guild = member.guild;
        this.monies = 0;
        this.exp = 0;
        this.items = {};

        StoreJSON(this);
        new User(member.user);
    }
}

class User {
    constructor(user) {
        this.id = user.id;
        this.playlist = {};
        this.nsfwBlacklist = [];

        StoreJSON(this);
    }
}

function StoreJSON(object){
    var error = false;

    console.log(`DataManager: Creating JSON object for storage - (${object instanceof Guild ? "Guild":object instanceof Member ?"Member":"User"})id: ${object.id}`);
    if (object instanceof Guild){
        fs.mkdirSync(`${workingDir}/data/guilds/${object.id}/members`, { recursive: true }, (err) => console.error(err));
        fs.writeFileSync(`${workingDir}/data/guilds/${object.id}/guild.json`, JSON.stringify(object, null, 4), (err) => {
            console.error(err);
            error = true;
        });
    } else if (object instanceof Member) {
        fs.writeFileSync(`${workingDir}/data/guilds/${object.guild.id}/members/${object.id}.json`, JSON.stringify(object, null, 4), (err) => {
            console.error(err);
            error = true;
        });
    } else {
        fs.writeFileSync(`${workingDir}/data/users/${object.id}.json`, JSON.stringify(object, null, 4), (err) => {
            console.error(err);
            error = true;
        });
    }

    if (error){
        console.error(`DataManager: Failed to store JSON object - id: ${object.id}`);
    } else{
        console.log(`DataManager: Successfully stored JSON object - id: ${object.id}`);
    }
}

module.exports = {
    CheckClientGuildMap: function(guildCache){
        guildCache.map((guild) => {
            if (!fs.existsSync(`${workingDir}/data/guilds/${guild.id}/guild.json`)){
                this.AddGuild(guild);
            }
        });
    },

    AddGuild: function(guild){
        new Guild(guild);
    },

    RemoveGuild: function(id){
        fs.unlinkSync(`${workingDir}/data/guilds/${id}/guild.json`, (err) => {
            console.error(`DataManager: Encountered an error while trying to remove a guild\n`);
            console.error(err);
        });
    },

    GetGuildData: function(id){
        return JSON.parse(fs.readFileSync(`${workingDir}/data/guilds/${id}/guild.json`)); 
    },

    AddMember: function(member){
        new Member(member);
    },

    RemoveMember: function(member){
        fs.unlinkSync(`${workingDir}/data/guilds/${member.guild.id}/members/${member.id}.json`, (err) => {
            console.error(`DataManager: Encountered an error while trying to remove a guild\n`);
            console.error(err);
        });
    },

    GetMemberData: function(member){
        return JSON.parse(fs.readFileSync(`${workingDir}/data/guilds/${member.guild.id}/members/${member.id}.json`))
    },

    RemoveUser: function(id){
        fs.unlinkSync(`${workingDir}/data/users/${id}.json`);
    },

    GetUserData: function(id){
        return JSON.parse(fs.readFileSync(`${workingDir}/data/users/${id}.json`))
    }
}