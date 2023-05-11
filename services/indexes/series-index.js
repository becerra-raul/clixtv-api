let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const seriesService = require('../series-service');

const SeriesIndexModel = require('./models/series-index-model');
const BrandListIndexModel = require('./models/brand-list-index-model');
const EpisodeListIndexModel = require('./models/episode-list-index-model');
const CharityListIndexModel = require('./models/charity-list-index-model');
const OfferListIndexModel = require('./models/offer-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(series, { brands, episodes, charities, offers }) {
    const model = {
        ...{

        },
        ...series
    };

    const seriesBrands = (series.brand || []).map(id => brands[id]).filter(brand => !!brand);
    const seriesCharities = zypeUtils.getSortedIdsList(series.charity_id || [])
        .map(id => charities[id]);

    const seriesEpisodes = Object.values(episodes).filter(episode => {
        return episode.series_id === series._id
    });

    model.brands = new BrandListIndexModel(seriesBrands.length, seriesBrands.map(brand => {
        if (!brand) {
            return {};
        }
        const brandOffers = (brand.offer || []).map(id => offers[id]);
        brand.offers = new OfferListIndexModel(brandOffers.length, brandOffers);
        return brand;
    }));

    model.episodes = new EpisodeListIndexModel(seriesEpisodes.length, seriesEpisodes);
    model.charities = new CharityListIndexModel(seriesCharities.length, seriesCharities);

    return new SeriesIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllBrands(),
            zypeService.getAllEpisodes(),
            zypeService.getAllCharities(),
            zypeService.getAllOffers()
        ]
    );

    return {
        brands: zypeUtils.getMapFromZObjects(data[0]),
        episodes: zypeUtils.getMapFromZObjects(data[1]),
        charities: zypeUtils.getMapFromZObjects(data[2]),
        offers: zypeUtils.getMapFromZObjects(data[3])
    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getSeriesById(id),
            getExtraData()
        ]
    );
    const series = data[0];
    const extraData = data[1];

    return this.searchService.createDocument('series', new Model(series, extraData));
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllSeries(),
            getExtraData()
        ]
    );

    const series = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const seriesMap = zypeUtils.getMapFromZObjects(series);
    const existingSeries = await seriesService.getSeries(0, 9999);
    existingSeries.series.forEach(({ id }) => {
        const existingSeries = seriesMap[id];
        if (existingSeries === undefined || !existingSeries.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(id);
        }
    });

    // const saveSeries = series.filter(({ charity, charity_id }) => (!charity_id || charity_id.length === 0) && charity);
    // await Promise.all(
    //     saveSeries.map(series => {
    //         series.custom = {
    //             charity_id: series.charity
    //         };
    //         return zypeService.updateSeriesById(series._id, series);
    //     })
    // );

    try {
        await Promise.all(
            series.map(series => this.searchService.createDocument('series', new Model(series, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('series', id))
        )
    } catch (e) {
        console.log('Error indexing series', e);
    }
    return { success: true };
};

module.exports = new Index();