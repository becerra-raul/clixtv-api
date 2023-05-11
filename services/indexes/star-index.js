let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const episodeService = require('../episode-service');
const starService = require('../star-service');
const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');

const StarIndexModel = require('./models/star-index-model');
const EpisodeListIndexModel = require('./models/episode-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(star, { series, episodes: { episodes } }) {
    const model = { ...star };

    const starEpisodes = episodes.filter(e => {
        return ((e.stars || {}).stars || []).some(s => s.id === star._id)
    });
    model.episodes = new EpisodeListIndexModel(starEpisodes.length, starEpisodes.slice(0, 5));

    return new StarIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function () {
    const data = await Promise.all(
        [
            zypeService.getAllSeries(),
            episodeService.getEpisodes(0, 9999)
        ]
    );
    return {
        series: zypeUtils.getMapFromZObjects(data[0]),
        episodes: data[1]
    };
};

Index.prototype.indexDataById = async function (id) {
    const data = await Promise.all(
        [
            zypeService.getStarById(id),
            getExtraData()
        ]
    );
    const star = data[0];
    const extraData = data[1];

    return this.searchService.createDocument('star', new Model(star, extraData));
};

Index.prototype.indexAllData = async function () {
    const data = await Promise.all(
        [
            zypeService.getAllStars(),
            getExtraData()
        ]
    );

    const stars = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const starsMap = zypeUtils.getMapFromZObjects(stars);
    const existingStars = await starService.getStars(0, 9999);
    existingStars.stars.forEach((star) => {
        const existingStar = starsMap[star.id];
        if (existingStar === undefined || !existingStar.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(star.id);
        }
    });

    try {
        await Promise.all(
            stars.map(star => this.searchService.createDocument('star', new Model(star, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('star', id))
        )
    } catch (e) {
        console.log('Error indexing stars', e);
    }
    return { success: true };
};

module.exports = new Index();