let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const episodeService = require('../episode-service');

const StarIndexModel = require('./models/star-index-model');
const StarListIndexModel = require('./models/star-list-index-model');
const SeriesIndexModel = require('./models/series-index-model');
const BrandListIndexModel = require('./models/brand-list-index-model');
const CharityListIndexModel = require('./models/charity-list-index-model');
const CharityIndexModel = require('./models/charity-index-model');
const EpisodeIndexModel = require('./models/episode-index-model');
const CategoryListIndexModel = require('./models/category-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(episode, { stars, brands, charities, series, videos }) {
    
    const model = { ...episode };
    if (episode.series_id) {
        const episodeSeries = series[episode.series_id];
        if (episodeSeries) {
            const {
                brand: brandIds = [],
                charity: charityId = '',
                charity_id: charityIds = []
            } = episodeSeries;

            model.series = new SeriesIndexModel(episodeSeries);
            model.brands = new BrandListIndexModel(brandIds.length, brandIds.map((id) => {
                return brands[id];
            }));
            model.charity = new CharityIndexModel(charities[charityId]);
            model.charities = new CharityListIndexModel(charityIds.length, zypeUtils.getSortedIdsList(charityIds).map((id) => {
                return charities[id];
            }));
        }
    }
    if (episode.star_id) {
        const episodeStar = stars[episode.star_id];
        if (episodeStar) {
            model.star = new StarIndexModel(episodeStar);
        }
    }

    if (episode.star) {
        const episodeStars = zypeUtils.getSortedIdsList(episode.star || []).map(id => stars[id]);
        model.stars = new StarListIndexModel(episodeStars.length, episodeStars);
    }

    if (episode.category) {
        model.categoryIds = episode.category;
    }

    if (episode.external_link) {
        model.externalLink = episode.external_link;
    }

    return new EpisodeIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllStars(),
            zypeService.getAllBrands(),
            zypeService.getAllCharities(),
            zypeService.getAllSeries(),
            zypeService.getAllCategories(),
            zypeService.getAllVideoSources()
        ]
    );

    return {
        stars: zypeUtils.getMapFromZObjects(data[0]),
        brands: zypeUtils.getMapFromZObjects(data[1]),
        charities: zypeUtils.getMapFromZObjects(data[2]),
        series: zypeUtils.getMapFromZObjects(data[3]),
        categories: zypeUtils.getMapFromZObjects(data[4]),
        videos: zypeUtils.getMapFromZObjects(data[5])
    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getEpisodeById(id),
            getExtraData()
        ]
    );
    const episode = data[0];
    const extraData = data[1];

    return this.searchService.createDocument('episode', new Model(episode, extraData));
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllEpisodes(),
            getExtraData()
        ]
    );

    const episodes = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const episodesMap = zypeUtils.getMapFromZObjects(episodes);
    const existingEpisodes = await episodeService.getEpisodes(0, 9999);
    existingEpisodes.episodes.forEach(({id}) => {
        const existingEpisode = episodesMap[id];
        if (existingEpisode === undefined || !existingEpisode.environment.includes(elasticsearchConfigs.index)) {
            console.log("REMOVE ID", existingEpisode)
            console.log("ES Index ", elasticsearchConfigs.index)
            disabledIds.push(id);
        }
    });

    // const saveEpisodes = episodes.filter(({ star, star_id }) => (!star || star.length === 0) && star_id);
    // console.log(saveEpisodes.length);
    // await Promise.all(
    //     saveEpisodes.map(episode => {
    //         episode.custom = {
    //             star: episode.star_id
    //         };
    //         return zypeService.updateEpisodeById(episode._id, episode);
    //     })
    // );

    try {

        console.log(`Reindexing ${episodes.length} episodes`);

        for (let i = 0; i < episodes.length; i++) {
            await this.searchService.createDocument('episode', new Model(episodes[i], extraData));
        }

        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('episode', id))
        )
    } catch (e) {
        console.log('Error indexing episodes', e);
    }
    return { success: true };
};

module.exports = new Index();