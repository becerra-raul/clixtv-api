const searchService = require('./elasticsearch-service');
const indexService = require('./index-service');
const NotFoundErrorModel = require('../models/not-found-error-model');
const CarouselResponseModel = require('../models/response/carousel-response-model');
const EpisodeListResponseModel = require('../models/response/episode-list-response-model');
const CategoryListResponseModel = require('../models/response/category-list-response-model');

function Service() {}

Service.prototype.getCarouselBySlug = async function(slug) {
    const { hits: { hits } } = await searchService.search('carousel', {
        query: { match_phrase: { slug } }
    });
    const { _source: source } = hits[0] || {};

    if (!source) {
        throw new NotFoundErrorModel(`No carousel found matching slug ${slug}`);
    }

    const { total, episodes } = source.episodes;

    const categoryIds = [];
    episodes.forEach(({ categoryIds: ids }) => {
        ids.forEach((id) => {
            if (!categoryIds.includes(id)) {
                categoryIds.push(id);
            }
        })
    });

    const { categories } = await indexService.searchData(
        undefined,
        {
            types: ['category'],
            filters: [
                {
                    fields: ['id'],
                    query: categoryIds.join(' OR ')
                }
            ]
        }
    );

    const categoryMap = categories.reduce((list, item) => {
        list[item.id] = item;
        return list;
    }, {});

    source.episodes = new EpisodeListResponseModel(total, episodes.map(episode => {
        episode.categories = new CategoryListResponseModel(episode.categoryIds.length, episode.categoryIds.map(id => {
            const category = categoryMap[id];
            delete category.episodes;
            return category;
        }));
        return episode;
    }));
    return new CarouselResponseModel(source);
};

module.exports = new Service();