let util = require('util'),
    BaseIndex = require('./base-index');

const apiUtils = require('../../utils/api-utils');
const elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch;

const zypeService = require('../zype-service');
const zypeUtils = require('../../utils/zype-utils');
const categoryService = require('../category-service');

const CategoryIndexModel = require('./models/category-index-model');
const EpisodeListIndexModel = require('./models/episode-list-index-model');

function Index() {
    BaseIndex.call(this);
}

function Model(category, { episodes }) {
    const model = {
        ...{
            episodes: []
        },
        ...category
    };

    const categoryEpisodes = Object.values(episodes).filter((e) => {
        return e.category && e.category.includes(category._id);
    });
    model.episodes = new EpisodeListIndexModel(categoryEpisodes.length, categoryEpisodes);

    return new CategoryIndexModel(model);
}

util.inherits(Index, BaseIndex);

const getExtraData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllEpisodes()
        ]
    );

    return {
        episodes: zypeUtils.getMapFromZObjects(data[0])
    };
};

Index.prototype.indexDataById = async function(id) {
    const data = await Promise.all(
        [
            zypeService.getCategoryById(id),
            getExtraData()
        ]
    );
    const category = data[0];
    const extraData = data[1];

    return this.searchService.createDocument('category', new Model(category, extraData));
};

Index.prototype.indexAllData = async function() {
    const data = await Promise.all(
        [
            zypeService.getAllCategories(),
            getExtraData()
        ]
    );

    const categories = data[0];
    const extraData = data[1];

    const disabledIds = [];
    const categoriesMap = zypeUtils.getMapFromZObjects(categories);
    const existingCategories = await categoryService.getCategories(0, 9999);
    existingCategories.categories.forEach(({ id }) => {
        const existingCategory = categoriesMap[id];
        if (existingCategory === undefined || !existingCategory.environment.includes(elasticsearchConfigs.index)) {
            disabledIds.push(id);
        }
    });

    try {
        await Promise.all(
            categories.map(category => this.searchService.createDocument('category', new Model(category, extraData)))
        );
        await Promise.all(
            disabledIds.map(id => this.searchService.deleteDocument('category', id))
        )
    } catch (e) {
        console.log('Error indexing categories', e);
    }
    return { success: true };
};

module.exports = new Index();