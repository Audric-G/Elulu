// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Handles stateChange event for audioPlayer
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    name: 'stateChange',
    async execute(oldState, newState) {
        if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
            // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
            // The queue is then processed to start playing the next track, if one is available.
            oldState.resource.metadata.onFinish();
            void this.processQueue();
        } else if (newState.status === AudioPlayerStatus.Playing) {
            // If the Playing state has been entered, then a new track has started playback.
            newState.resource.metadata.onStart();
        }
    }
}