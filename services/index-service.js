let elasticSearchService = require('./elasticsearch-service'),
    SearchResponseModel = require('../models/response/search-response-model');

const apiUtils = require('../utils/api-utils');
const environment = apiUtils.getEnvironment();

function Service() {}

function _getIndexByType(type) {
    let index;
    switch(type) {
        case 'brand':
        case 'brands':
            index = require('./indexes/brand-index');
            break;
        case 'star':
        case 'stars':
            index = require('./indexes/star-index');
            break;
        case 'charity':
        case 'charities':
            index = require('./indexes/charity-index');
            break;
        case 'category':
        case 'categories':
            index = require('./indexes/category-index');
            break;
        case 'offer':
        case 'offers':
            index = require('./indexes/offer-index');
            break;
        case 'episode':
        case 'episodes':
            index = require('./indexes/episode-index');
            break;
        case 'series':
            index = require('./indexes/series-index');
            break;
        case 'affiliate':
        case 'affiliates':
            index = require('./indexes/affiliate-index');
            break;
        case 'carousel':
        case 'carousels':
            index = require('./indexes/carousel-index');
            break;
        default:
            break;
    }
    return index;
}

async function _indexAllData() {
    const episodeIndex = require('./indexes/episode-index');
    const offerIndex = require('./indexes/offer-index');
    const categoryIndex = require('./indexes/category-index');
    const charityIndex = require('./indexes/charity-index');
    const starIndex = require('./indexes/star-index');
    const brandIndex = require('./indexes/brand-index');
    const seriesIndex = require('./indexes/series-index');

    await offerIndex.indexAllData();
    await brandIndex.indexAllData();
    await charityIndex.indexAllData();
    await episodeIndex.indexAllData();
    await starIndex.indexAllData();
    await categoryIndex.indexAllData();
    await seriesIndex.indexAllData();
    return { success: true };
}

Service.prototype.searchData = async function(term, filters, offset, limit, sort = []) {
    let query = {
        from: offset || 0,
        size: limit || 10,
        sort,
        query: {
            bool: {
                should: [],
                must: []
            }
        }
    };

    filters = filters || {};

    if (term) {
        query.query.bool.should.push({
            "query_string": {
                "fields": ["name", "title"],
                "query": term.replace(/\s/g, '* AND *').replace('$', '') + '*'
            }
        });
    }
    if (filters.filters) {
        filters.filters.forEach(({ fields, query: filterQuery }) => {
            query.query.bool.should.push({
                "query_string": {
                    "fields": fields,
                    "query": filterQuery
                }
            });
        });
    }
    if (filters.exists) {
        query.query.bool.must.push({
            exists: filters.exists
        });
    }

    let data = await elasticSearchService.search(filters.types || 'brand,star,charity,category,offer,episode', query);
    return new SearchResponseModel(data.hits.total, data.hits.hits);
};

Service.prototype.indexData = async function(type, id) {
    if (type === 'all') {

        // Some data relies on others not yet in the index, so run it twice...
        await _indexAllData();
        return _indexAllData();
    }
    let index = _getIndexByType(type);
    if (!index) {
        throw new Error('Invalid index type: ' + type);
    }
    if (id) {
        return index.indexDataById(id);
    } else {
        return index.indexAllData();
    }
};

Service.prototype.deleteIndexData = async function(type, id) {

};

module.exports = new Service();