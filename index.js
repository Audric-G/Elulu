// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Runs on startup.
// Version: 2.0.2
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// TO-DO: -ADD FUNCTIONALITY BACK
//        -IMPLEMENT DATABASE... AGAIN

const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { token } =  require('./config.json');
const { commandManager } = require('./utilities/CommandManager');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//Give the CommandManager singleton to client
client.CommandManager = commandManager;

//READ EVENT FILES AND CONNECT TO DISCORD API
fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(file => {
  const event = require(`./events/${file}`);
  if (event.once){
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

// Login bot
client.login(token);