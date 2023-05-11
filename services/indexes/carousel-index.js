let util = require('util'),
    BaseIndex = require('./base-index');

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');

const CarouselIndexModel = require('./models/carousel-index-model');
const EpisodeListIndexModel = require('./models/episode-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(carousel, { episodes }) {
    const model = { ...carousel };

    const carouselEpisodes = zypeUtils.getSortedIdsList(carousel.episode || []).map(id => episodes[id]);
    model.episodes = new EpisodeListIndexModel(carouselEpisodes.length, carouselEpisodes.map(episode => {
        if (episode.category) {
            episode.categoryIds = episode.category;
        }
        return episode;
    }));
    return new CarouselIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getEpisodes()
        ]
    );

    return {
        episodes: zypeUtils.getMapFromZObjects(data[0])
    };
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getCarousels(),
            getExtraData()
        ]
    );

    const carousels = data[0];
    const extraData = data[1];

    try {
        await Promise.all(
            carousels.map(carousel => this.searchService.createDocument('carousel', new Model(carousel, extraData)))
        );
    } catch (e) {
        console.log('Error indexing carousels', e);
    }
    return { success: true };
};

module.exports = new Index();