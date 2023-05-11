let favoriteDao = require('../persistence/favorite-dao'),
    entityTypeEnum = require('../models/enum/entity-type-enum');

function Service() {}

Service.prototype.getUserPopulatedEpisodes = async function(userId, episodes) {
    if (!episodes || episodes.length === 0) {
        return [];
    }

    // 1. Gather up the required entity IDs
    let episodeIds = [],
        starIds = [];

    episodes.forEach((episode) => {
        if (episodeIds.indexOf(episode.id) === -1) {
            episodeIds.push(episode.id);
        }
        if (episode.star && episode.star.id) {
            if (starIds.indexOf(episode.star.id) === -1) {
                starIds.push(episode.star.id);
            }
        }
    });

    // 2. Fetch the favorites data
    let favorites = await Promise.all(
        [
            favoriteDao.getUserFavoritesByIdsAndType(userId, episodeIds, entityTypeEnum.types.EPISODE),
            (starIds.length > 0) ? favoriteDao.getUserFavoritesByIdsAndType(userId, starIds, entityTypeEnum.types.STAR) : undefined
        ]
    );

    // 3. Populate the entities
    let episodeFavorites = favorites[0] || [],
        starFavorites = favorites[1] || [];

    episodes = episodes.map((episode) => {
        episode.isFavorite = episodeFavorites.filter((favorite) => {
            return favorite.entity_id === episode.id;
        }).length > 0;
        if (episode.star && episode.star.id) {
            episode.star.isFavorite = starFavorites.filter((favorite) => {
                return favorite.entity_id === episode.star.id;
            }).length > 0;
        }
        return episode;
    });

    // 4. Profit
    return episodes;
};

Service.prototype.getUserPopulatedStars = async function(userId, stars) {
    if (!stars || stars.length === 0) {
        return [];
    }

    let starIds = [],
        episodes = {},
        brands = {},
        charities = {},
        offers = {};

    stars.forEach((star) => {
        if (starIds.indexOf(star.id) === -1) {
            starIds.push(star.id);
        }
        if (star.episodes && star.episodes.episodes.length > 0) {
            star.episodes.episodes.forEach((episode) => {
                episodes[episode.id] = episode;
            })
        }
        if (star.series && star.series.series.length > 0) {
            star.series.series.forEach((series) => {
                if (series.episodes && series.episodes.episodes.length > 0) {
                    series.episodes.episodes.forEach((episode) => {
                        episodes[episode.id] = episode;
                    })
                }
                if (series.brands && series.brands.brands.length > 0) {
                    series.brands.brands.forEach((brand) => {
                        brands[brand.id] = brand;
                    })
                }
                if (series.charities && series.charities.charities.length > 0) {
                    series.charities.charities.forEach((charity) => {
                        charities[charity.id] = charity;
                    })
                }
            })
        }
        if (star.brands && star.brands.brands.length > 0) {
            star.brands.brands.forEach((brand) => {
                brands[brand.id] = brand;
            })
        }
        if (star.charities && star.charities.charities.length > 0) {
            star.charities.charities.forEach((charity) => {
                charities[charity.id] = charity;
            })
        }
        if (star.offers && star.offers.offers.length > 0) {
            star.offers.offers.forEach((offer) => {
                offers[offer.id] = offer;
            })
        }
    });

    let favorites = await Promise.all(
        [
            favoriteDao.getUserFavoritesByIdsAndType(userId, starIds, entityTypeEnum.types.STAR),
            this.getUserPopulatedEpisodes(userId, Object.values(episodes)),
            this.getUserPopulatedBrands(userId, Object.values(brands)),
            this.getUserPopulatedCharities(userId, Object.values(charities)),
            this.getUserPopulatedOffers(userId, Object.values(offers))
        ]
    );

    return stars.map((star) => {
        star.isFavorite = favorites[0].filter((favorite) => {
            return favorite.entity_id === star.id;
        }).length > 0;
        if (star.episodes && star.episodes.episodes.length > 0) {
            star.episodes.episodes = star.episodes.episodes.map((episode) => {
                return favorites[1].filter((favorite) => {
                    return favorite.id === episode.id;
                })[0];
            });
        }
        if (star.series && star.series.series.length > 0) {
            star.series.series.forEach((series) => {
                if (series.episodes && series.episodes.episodes.length > 0) {
                    series.episodes.episodes = series.episodes.episodes.map((episode) => {
                        return favorites[1].filter((favorite) => {
                            return favorite.id === episode.id;
                        })[0];
                    });
                }
                if (series.brands && series.brands.brands.length > 0) {
                    series.brands.brands = series.brands.brands.map((brand) => {
                        return favorites[2].filter((favorite) => {
                            return favorite.id === brand.id;
                        })[0];
                    });
                }
                if (series.charity) {
                    series.charity = favorites[3].filter((favorite) => {
                        return favorite.id === series.charity.id;
                    })[0];
                }
            })
        }
        if (star.brands && star.brands.brands.length > 0) {
            star.brands.brands = star.brands.brands.map((brand) => {
                return favorites[2].filter((favorite) => {
                    return favorite.id === brand.id;
                })[0];
            });
        }
        if (star.charities && star.charities.charities.length > 0) {
            star.charities.charities = star.charities.charities.map((charity) => {
                return favorites[3].filter((favorite) => {
                    return favorite.id === charity.id;
                })[0];
            });
        }
        if (star.offers && star.offers.offers.length > 0) {
            star.offers.offers = star.offers.offers.map((offer) => {
                return favorites[4].filter((favorite) => {
                    return favorite.id === offer.id;
                })[0];
            });
        }
        return star;
    });
};

Service.prototype.getUserPopulatedOffers = async function(userId, offers) {
    if (!offers || offers.length === 0) {
        return [];
    }

    let favorites = await favoriteDao.getUserFavoritesByIdsAndType(userId, offers.map((offer) => {
        return offer.id;
    }), entityTypeEnum.types.OFFER);

    return offers.map((offer) => {
        offer.isFavorite = favorites.filter((favorite) => {
            return favorite.entity_id === offer.id;
        }).length > 0;
        return offer;
    });
};

Service.prototype.getUserPopulatedBrands = async function(userId, brands) {
    if (!brands || brands.length === 0) {
        return [];
    }

    let brandIds = [],
        episodes = {},
        stars = {},
        offers = {};

    brands.forEach((brand) => {
        if (brandIds.indexOf(brand.id) === -1) {
            brandIds.push(brand.id);
        }
        if (brand.episodes && brand.episodes.episodes.length > 0) {
            brand.episodes.episodes.forEach((episode) => {
                episodes[episode.id] = episode;
            })
        }
        if (brand.stars && brand.stars.stars.length > 0) {
            brand.stars.stars.forEach((star) => {
                stars[star.id] = star;
            })
        }
        if (brand.offers && brand.offers.offers.length > 0) {
            brand.offers.offers.forEach((offer) => {
                offers[offer.id] = offer;
            })
        }
    });

    let favorites = await Promise.all(
        [
            favoriteDao.getUserFavoritesByIdsAndType(userId, brandIds, entityTypeEnum.types.BRAND),
            this.getUserPopulatedEpisodes(userId, Object.values(episodes)),
            this.getUserPopulatedStars(userId, Object.values(stars)),
            this.getUserPopulatedOffers(userId, Object.values(offers))
        ]
    );

    return brands.map((brand) => {
        brand.isFavorite = favorites[0].filter((favorite) => {
            return favorite.entity_id === brand.id;
        }).length > 0;
        if (brand.episodes && brand.episodes.episodes.length > 0) {
            brand.episodes.episodes = brand.episodes.episodes.map((episode) => {
                return favorites[1].filter((favorite) => {
                    return favorite.id === episode.id;
                })[0];
            });
        }
        if (brand.stars && brand.stars.stars.length > 0) {
            brand.stars.stars = brand.stars.stars.map((star) => {
                return favorites[2].filter((favorite) => {
                    return favorite.id === star.id;
                })[0];
            });
        }
        if (brand.offers && brand.offers.offers.length > 0) {
            brand.offers.offers = brand.offers.offers.map((offer) => {
                return favorites[3].filter((favorite) => {
                    return favorite.id === offer.id;
                })[0];
            });
        }
        return brand;
    });
};

Service.prototype.getUserPopulatedCharities = async function(userId, charities) {
    if (!charities || charities.length === 0) {
        return [];
    }

    let charityIds = [],
        episodes = {};

    charities.forEach((charity) => {
        if (charityIds.indexOf(charity.id) === -1) {
            charityIds.push(charity.id);
        }
        if (charity.episodes && charity.episodes.episodes.length > 0) {
            charity.episodes.episodes.forEach((episode) => {
                episodes[episode.id] = episode;
            })
        }
    });

    let favorites = await Promise.all(
        [
            favoriteDao.getUserFavoritesByIdsAndType(userId, charityIds, entityTypeEnum.types.CHARITY),
            this.getUserPopulatedEpisodes(userId, Object.values(episodes))
        ]
    );

    return charities.map((charity) => {
        charity.isFavorite = favorites[0].filter((favorite) => {
            return favorite.entity_id === charity.id;
        }).length > 0;
        if (charity.episodes && charity.episodes.episodes.length > 0) {
            charity.episodes.episodes = charity.episodes.episodes.map((episode) => {
                return favorites[1].filter((favorite) => {
                    return favorite.id === episode.id;
                })[0];
            });
        }
        return charity;
    });
};

module.exports = new Service();