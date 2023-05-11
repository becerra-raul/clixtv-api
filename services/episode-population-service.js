let starDao = require('../persistence/star-dao'),
    seriesDao = require('../persistence/series-dao'),
    brandDao = require('../persistence/brand-dao'),
    charityDao = require('../persistence/charity-dao'),
    favoriteDao = require('../persistence/favorite-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum'),
    StarResponseModel = require('../models/response/star-response-model'),
    SeriesResponseModel = require('../models/response/series-response-model'),
    BrandListReponseModel = require('../models/response/brand-list-response-model'),
    CharityResponseModel = require('../models/response/charity-response-model');

function Service() {}

Service.prototype.getPopulatedEpisodes = async function(episodes, userId) {

    let episodeIds = [],
        seriesIds = [],
        starIds = [];

    let favoriteEpisodes = [],
        favoriteStars = [];

    episodes.forEach((episode) => {
        episodeIds.push(episode.id);
        seriesIds.push(episode.series);
        starIds.push(episode.star);
    });

    let data = await Promise.all(
        [
            starDao.getStarsBySeriesIds(seriesIds),
            seriesDao.getSeriesByEpisodeIds(episodeIds),
            brandDao.getBrandsBySeriesIds(seriesIds),
            charityDao.getCharitiesBySeriesIds(seriesIds)
        ]
    );

    if (userId) {
        let favoritesData = await Promise.all(
            [
                favoriteDao.getUserFavoritesByIdsAndType(userId, episodeIds, entityTypeEnum.types.EPISODE),
                favoriteDao.getUserFavoritesByIdsAndType(userId, data[0].map((star) => star.id), entityTypeEnum.types.STAR)
            ]
        );
        favoriteEpisodes = favoritesData[0];
        favoriteStars = favoritesData[1];
    }

    let populatedEpisodes = [];

    episodes.forEach((episode) => {
        let populatedEpisode = Object.assign({}, episode);

        // Star
        let star = data[0].filter((s) => {
            return s.series === episode.series;
        })[0];

        if (star) {
            let episodeStar = Object.assign({}, star);
            delete episodeStar.series;
            if (userId) {
                episodeStar.isFavorite = (favoriteStars.filter((favorite) => (favorite.entity_id + '') === (episodeStar.id + '')).length > 0);
            }
            populatedEpisode.star = new StarResponseModel(episodeStar);
        }

        // Series
        let series = data[1].filter((series) => {
            return series.id === populatedEpisode.series;
        })[0];
        if (series) {
            populatedEpisode.series = new SeriesResponseModel(series);
        }

        // Brands
        let brands = data[2].filter((brand) => {
            return brand.series === populatedEpisode.series.id;
        });
        populatedEpisode.brands = new BrandListReponseModel(brands.length, brands);

        // Charity
        let charity = data[3].filter((charity) => {
            return charity.series === populatedEpisode.series.id;
        })[0];
        if (charity) {
            populatedEpisode.charity = new CharityResponseModel(charity);
        }
        if (userId) {
            populatedEpisode.isFavorite = (favoriteEpisodes.filter((favorite) => (favorite.entity_id + '') === (populatedEpisode.id + '')).length > 0);
        }

        populatedEpisodes.push(populatedEpisode);
    });

    return populatedEpisodes;
};

module.exports = new Service();