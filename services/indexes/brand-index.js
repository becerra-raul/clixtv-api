let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const brandsService = require('../brand-service');

const BrandIndexModel = require('./models/brand-index-model');
const OfferListIndexModel = require('./models/offer-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(brand, { offers, video = {} }) {
    const model = {
        ...{
            offer: []
        },
        ...brand
    };

    const brandOffers = (model.offer || []).map(offerId => offers[offerId]).filter(offer => !!offer);
    model.offers = new OfferListIndexModel(brandOffers.length, brandOffers);

    const { thumbnails = [] } = video;
    if (thumbnails.length) {
        model.videoThumbnailPhoto = thumbnails[0].url;
    }

    return new BrandIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllOffers()
        ]
    );

    return {
        offers: zypeUtils.getMapFromZObjects(data[0])
    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getBrandById(id),
            getExtraData()
        ]
    );
    const brand = data[0];
    const extraData = data[1];

    const { video_ids: videoIds = [] } = brand || {};
    const videos = await Promise.all(videoIds.map(id => zypeService.getVideoById(id)));
    extraData.video = videos[0];

    return this.searchService.createDocument('brand', new Model(brand, extraData));
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllBrands(),
            getExtraData()
        ]
    );

    const brands = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const brandsMap = zypeUtils.getMapFromZObjects(brands);
    const existingBrands = await brandsService.getBrands(0, 9999);
    existingBrands.brands.forEach(({ id }) => {
        const existingBrand = brandsMap[id];
        if (existingBrand === undefined || !existingBrand.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(id);
        }
    });

    try {
        await Promise.all(
            brands.map(brand => this.searchService.createDocument('brand', new Model(brand, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('brand', id))
        )
    } catch (e) {
        console.log('Error indexing brands', e);
    }
    return { success: true };
};

module.exports = new Index();