// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Handles the stateChange event for voiceConnection. Deals with reconnection on the event of a sudden disconnect. 100% copied from discord.js GitHub music bot example
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const { entersState } = require('@discordjs/voice');

module.exports = {
    name: 'stateChange',
    async execute(oldState, newState) {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                /**
                 * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
                 * but there is a chance the connection will recover itself if the reason of the disconnect was due to
                 * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
                 * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
                 * the voice connection.
                 */
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
                    // Probably moved voice channel
                } catch {
                    this.voiceConnection.destroy();
                    // Probably removed from voice channel
                }
            } else if (this.voiceConnection.rejoinAttempts < 5) {
                /**
                 * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                 */
                await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
                this.voiceConnection.rejoin();
            } else {
                /**
                 * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                 */
                this.voiceConnection.destroy();
            }
        } else if (newState.status === VoiceConnectionStatus.Destroyed) {
            /**
             * Once destroyed, stop the subscription.
             */
            this.stop();
        } else if (
            !this.readyLock &&
            (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
        ) {
            /**
             * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
             * before destroying the voice connection. This stops the voice connection permanently existing in one of these
             * states.
             */
            this.readyLock = true;
            try {
                await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
            } catch {
                if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
            } finally {
                this.readyLock = false;
            }
        }
    }
}