//AUTHOR: GIEVEN#8031
//LAST UPDATED: 10/10/2021
//DESCRIPTION: General bot.
//Version: 2.0.0
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js')
const { token } = require('./auth.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],});
client.commands = new Collection();
client.adminCommands = {};

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const generalCommands = fs.readdirSync('./commands/general').filter(file => file.endsWith('.js'));
const adminCommands = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));

for (const file of eventFiles){
  const event = require(`./events/${file}`);
  if (event.once){
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

for (const file of generalCommands){
  const command = require(`./commands/general/${file}`);
  client.commands.set(command.data.name, command); 
}

for (const file of adminCommands){
  const command = require(`./commands/admin/${file}`);
  client.commands.set(command.data.name, command);
  client.adminCommands[command.data.name] = command;
}

client.login(token);//Login bot