let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');

const AffiliateIndexModel = require('./models/affiliate-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(affiliate, {  }) {
    const model = {
        ...{},
        ...affiliate
    };

    return new AffiliateIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    return {};
};

Index.prototype.indexAllData = async function() {

    const data = await Promise.all(
        [
            zypeService.getAllAffiliates(),
            getExtraData()
        ]
    );

    const affiliates = data[0];

    const extraData = data[1];

    const disabledIds = [];
    const affiliatesMap = zypeUtils.getMapFromZObjects(affiliates);
    const { hits: { hits: existingAffiliates } } = await this.searchService.search('affiliate', { from: 0, size: 9999 });

    existingAffiliates.forEach(({ _id: id }) => {
        const existingAffiliate = affiliatesMap[id];
        if (existingAffiliate === undefined) {
            disabledIds.push(id);
        }
    });

    try {
        await Promise.all(
            affiliates.map(affiliate => this.searchService.createDocument('affiliate', new Model(affiliate, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('affiliate', id))
        )
    } catch (e) {
        console.log('Error indexing affiliates', e);
    }
    return { success: true };
};

module.exports = new Index();