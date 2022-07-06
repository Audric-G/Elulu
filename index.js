// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/1/2022
// DESCRIPTION: Runs on startup.
// Version: 2.0.2
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// TO-DO: -ADD FUNCTIONALITY BACK
//        -IMPLEMENT DATABASE... AGAIN

const fs = require("fs");
const { Client, Collection, Intents } = require('discord.js');
const { token } =  require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

//READ EVENT FILES AND CONNECT TO DISCORD API
fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(file => {
  const event = require(`./events/${file}`);
  if (event.once){
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

//READ PUBLIC COMMANDS AND CACHE TO CLIENT.COMMANDS
fs.readdirSync('./commands/public').filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(`./commands/public/${file}`);
  client.commands.set(command.data.name, command);
});

//READ ADMIN COMMANDS AND CACHE TO CLIENT.COMMANDS
fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(`./commands/admin/${file}`);
  client.commands.set(command.data.name, command);
});

// Login bot
client.login(token);