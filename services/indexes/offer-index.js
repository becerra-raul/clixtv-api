let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const offerService = require('../offer-service');

const OfferIndexModel = require('./models/offer-index-model');
const BrandIndexModel = require('./models/brand-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(offer, { brands }) {
    const model = {
        ...offer
    };

    const brand = Object.values(brands).find((brand) => {
        return brand.offer && brand.offer.includes(offer._id);
    });
    if (brand) {
        model.brand = new BrandIndexModel(brand);
    }

    return new OfferIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllBrands()
        ]
    );

    return {
        brands: zypeUtils.getMapFromZObjects(data[0])
    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getOfferById(id),
            getExtraData()
        ]
    );
    const offer = data[0];
    const extraData = data[1];
    const model = new Model(offer, extraData);
    if (!model.brand) {
        return;
    }
    return this.searchService.createDocument('offer', model);
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllOffers(),
            getExtraData()
        ]
    );

    const offers = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const offersMap = zypeUtils.getMapFromZObjects(offers);
    const existingOffers = await offerService.getOffers(0, 9999);

    existingOffers.offers.forEach(({ id, brand }) => {
        const existingOffer = offersMap[id];
        if (existingOffer === undefined || !brand || !existingOffer.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(id);
        }
    });

    try {
        await Promise.all(
            offers.map(offer => {
                const model = new Model(offer, extraData);
                if (!model.brand) {
                    return;
                }
                return this.searchService.createDocument('offer', model)
            })
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('offer', id))
        )
    } catch (e) {
        console.log('Error indexing offers', e);
    }
    return { success: true };
};

module.exports = new Index();