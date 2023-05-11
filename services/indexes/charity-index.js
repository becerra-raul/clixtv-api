let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const charityService = require('../charity-service');

const CharityIndexModel = require('./models/charity-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(charity, { video = {} }) {
    const model = {
        ...charity
    };

    const { thumbnails = [] } = video;
    if (thumbnails.length) {
        model.videoThumbnailPhoto = thumbnails[0].url;
    }

    return new CharityIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [

        ]
    );

    return {

    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getCharityById(id),
            getExtraData()
        ]
    );
    const charity = data[0];
    const extraData = data[1];

    const { video_ids: videoIds = [] } = brand || {};
    const videos = await Promise.all(videoIds.map(id => zypeService.getVideoById(id)));
    extraData.video = videos[0];

    return this.searchService.createDocument('charity', new Model(charity, extraData));
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllCharities(),
            getExtraData()
        ]
    );

    const charities = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const charityMap = zypeUtils.getMapFromZObjects(charities);
    const existingCharities = await charityService.getCharities(0, 9999);
    existingCharities.charities.forEach(({ id }) => {
        const existingCharity = charityMap[id];
        if (existingCharity === undefined || !existingCharity.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(id);
        }
    });

    try {
        await Promise.all(
            charities.map(charity => this.searchService.createDocument('charity', new Model(charity, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('charity', id))
        )
    } catch (e) {
        console.log('Error indexing charities', e);
    }
    return { success: true };
};

module.exports = new Index();