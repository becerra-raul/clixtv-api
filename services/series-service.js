let slugService = require('./slug-service'),
    proxyService = require('./proxy-service'),
    mediaService = require('./media-service'),
    episodeService = require('./episode-service'),
    sirqulService = require('./sirqul-service'),
    favoritesPopulationService = require('./favorites-population-service'),
    SeriesListResponseModel = require('../models/response/series-list-response-model'),
    SeriesResponseModel = require('../models/response/series-response-model'),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model'),
    NotFoundErrorModel = require('../models/not-found-error-model');

const indexService = require('./index-service');
const entityType = "series";

function Service() {}

Service.prototype.getSeries = async function(offset = 0, limit = 20, parameters = {}) {
    const { total = 0, series = [] } = await indexService.searchData('*', {
        types: ['series']
    }, offset, limit);
    return new SeriesListResponseModel(total, series);
};

Service.prototype.getSeriesById = async function(id) {

};

Service.prototype.getSeriesBySlug = async function(slug, parameters) {

};

Service.prototype.getEpisodesBySeriesSlug = async function(slug, parameters) {
    const { total = 0, series: seriesList = [] } = await indexService.searchData(null, {
        types: ['series'],
        filters: [
            {
                fields: ['slug'],
                query: slug
            }
        ]
    });
    if (total === 0) {
        throw new NotFoundErrorModel(`No series found matching slug ${slug}`);
    }
    const series = seriesList[0];
    const { episodes: { episodes } } = series;

    return episodeService.getEpisodesByIds(episodes.map(({id}) => id), parameters);
};

Service.prototype.getEpisodesBySeriesSlugSirqul = async function(slug, parameters) {
    if(!parameters.fields) parameters.fields = [];
    if(!parameters.fields.includes("episodes")){
        parameters.fields = ["episodes"];
        // get all episodes at the moment
        parameters.offsetEpisodes = 0;
        parameters.limitEpisodes = 9999;
    }
    return sirqulService
        .getEntityBySlug(entityType, slug, parameters)
        .then((data)=>{
            if(data.episodes)
                return data.episodes;
            return null;
        })
};

module.exports = new Service();