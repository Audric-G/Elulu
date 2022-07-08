// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Deals with audio connection to the voiceConnection for streaming audio.
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} = require('@discordjs/voice');

class MusicSubscription {
    constructor(voiceConnection) {
        this.voiceConnection = voiceConnection;
        this.audioPlayer = createAudioPlayer();
        this.queue = [];
        this.queueLock = false;
        this.readyLock = false;

        //Connect voice events
        fs.readdirSync(`${process.cwd()}\\events\\voice`).filter(file => file.endsWith('.js')).forEach(file => {
            const event = require(`${process.cwd()}\\events\\voice\\${file}`);
            this.voiceConnection.on(event.name, (...args) => event.execute(...args));
        });

        //Connect audioPlayer events
        fs.readdirSync(`${process.cwd()}\\events\\voice`).filter(file => file.endsWith('.js')).forEach(file => {
            const event = require(`${process.cwd()}\\events\\voice\\${file}`);
            this.audioPlayer.on(event.name, (...args) => event.execute(...args));
        });
    }
}