const EpisodeIndexModel = require('./episode-index-model');

function EpisodeListIndexModel(total = 0, episodes = []) {
    this.total = total;
    this.episodes = episodes.map((episode) => new EpisodeIndexModel(episode));
}

module.exports = EpisodeListIndexModel;