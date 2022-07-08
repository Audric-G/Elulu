// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Joins or leaves voice channel.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('Joins or leaves your voice channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Joins your voice channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leaves your voice channel')),
    async execute(interaction) {
        return new Promise(async (resolve, reject) => {
            if (interaction.options.getSubcommand() === 'join') {
                const clientChannel = getVoiceConnection(interaction.guild.id);
                const memberChannel = interaction.member.voice.channel;
                let isAlone = false;

                

                //check if member is in vc
                if (!memberChannel) { return reject(`You're not in a VC I'm not going to listen to you!`)}

                //check if already in vc
                if (clientChannel) {
                    let clientsGuildChannel = await interaction.guild.channels.fetch(clientChannel.joinConfig.channelId);

                    if (clientsGuildChannel.members.size < 2) {
                        isAlone = true;
                    } else {
                        return reject(clientChannel.joinConfig.channelId === memberChannel.id ? `I'm already here!` : `Nope, I'm staying here with my friends :)`);
                    }
                }
                
                joinVoiceChannel({
                    channelId: memberChannel.id,
                    guildId: memberChannel.guild.id,
                    adapterCreator: memberChannel.guild.voiceAdapterCreator,
                });

                return resolve(isAlone ? `I guess I'll join you, since I'm all alone in here anyway`: `Joined vc`);
            }

            //check if Elulu is in a vc
            if (!getVoiceConnection(interaction.guild.id)) { return reject(`I'm not even in a vc to leave!`)}
            
            //check if member is in a vc
            if (!interaction.member.voice.channel) { return reject(`You're not even in a vc, you can't tell me what to do!`) }
            
            //check if member is in the same vc as Elulu
            if (getVoiceConnection(interaction.guild.id).joinConfig.channelId !== interaction.member.voice.channel.id) { return reject(`You're not in the same vc as me so I'm not gonna listen to you!`) }
            
            //leave vc
            getVoiceConnection(interaction.guild.id).destroy();
            return resolve('Left vc');
        });
    }
}