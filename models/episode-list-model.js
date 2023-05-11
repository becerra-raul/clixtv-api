let EpisodeModel = require('./episode-model');

function EpisodeListModel(total, episodes) {
    if (total !== undefined) {
        this.total = total;
    }
    if (episodes) {
        this.episodes = episodes.map(function(episode) {
            return new EpisodeModel(episode);
        });
    }
}

module.exports = EpisodeListModel;