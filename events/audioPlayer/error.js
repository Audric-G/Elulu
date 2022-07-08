// AUTHOR: GIEVEN#8031
// LAST UPDATED: 7/8/2022
// DESCRIPTION: Handles error event for audioPlayer
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    name: 'error',
    async execute(error) {
        console.error(`Error with track: ${error.resource.metadata.title}\n\n${error.message}`);
    }
}