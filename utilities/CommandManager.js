// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Command Manager singleton that deals with commands and deployment
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { Collection } = require("discord.js");
const fs = require("fs");
const PUBLIC_COMMANDS_FOLDER = `${process.cwd()}\\commands\\public`;
const ADMIN_COMMANDS_FOLDER = `${process.cwd()}\\commands\\admin`;

//Define and create singleton CommandManager
class CommandManager {
    constructor() {
        this.RefreshCommands();
    }

    //Private method. Reads all commands from given file and returns the array
    #ReadCommandsFromFile(filePath) {
        return fs.readdirSync(filePath).filter(file => file.endsWith('.js'));
    }

    //Refreshes the commands variable and re-fills it with the contents of the public/admin command files.
    RefreshCommands() {
        return new Promise((resolve, reject) => {
            //Resets commands to fresh Collection
            this.commands = new Collection();

            //Read public commands and set to commands collection
            this.#ReadCommandsFromFile(PUBLIC_COMMANDS_FOLDER).forEach(file => {
                const command = require(`${PUBLIC_COMMANDS_FOLDER}/${file}`);
                this.commands.set(command.data.name, command);
            });

            //Read private commands and set to command collection
            this.#ReadCommandsFromFile(ADMIN_COMMANDS_FOLDER).forEach(file => {
                const command = require(`${ADMIN_COMMANDS_FOLDER}/${file}`);
                this.commands.set(command.data.name, command);
            });

            resolve(`Successfully refreshed commands on client.`);
        });
    }

    SetGuildPermissions(guild) {
        return new Promise((resolve, reject) => {
            resolve('SetGuildPermissions not yet implemented.');
        })
    }

    //Deploys to specified guild, destructures client to only give client.application.id aliased as applicationId.
    DeployToGuild({ application: { id: applicationId } } = client, guild) {
        return new Promise(async (resolve, reject) => {
            const { REST } = require('@discordjs/rest');
            const { Routes } = require('discord-api-types/v9');
            const { token } = require('../config.json');

            const rest = new REST({ version: 9 }).setToken(token);

            //Upload commands to guild application then set customized guild permissions if available
            await rest.put(Routes.applicationGuildCommands(applicationId, guild.id), { body: this.commands.map(command => command.data) }).then(() => {
                return this.SetGuildPermissions(guild);
            }).then(message => {
                resolve(`ID: ${guild.id}\n\t-${message}\n\t-Successfully Updated Guild Commands.`);
            });
        });
    }

    DeployToGlobal() {
        return new Promise((resolve, reject) => {
            resolve('DeployToGlobal is not yet implemented, please use DeployToGuild instead.');
        });
    }
}

//The only instance of CommandManager that should ever be instantiated.
const commandManager = new CommandManager();

module.exports = {
    commandManager
}

