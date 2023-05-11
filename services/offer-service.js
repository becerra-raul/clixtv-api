let slugService = require("./slug-service"),
  proxyService = require("./proxy-service"),
  sirqulService = require('./sirqul-service'),
  favoriteDao = require("../persistence/favorite-dao"),
  brandDao = require("../persistence/brand-dao"),
  offerDao = require("../persistence/offer-dao"),
  entityTypeEnum = require("../models/enum/entity-type-enum"),
  parameterTypeEnum = require("../models/enum/parameter-type-enum"),
  NotFoundErrorModel = require("../models/not-found-error-model"),
  OfferResponseModel = require("../models/response/offer-response-model"),
  OfferListResponseModel = require("../models/response/offer-list-response-model"),
  BrandResponseModel = require("../models/response/brand-response-model");

const indexService = require("./index-service");

function Service() {}

/**
 * Returns the provided list of offers with their requested fields populated
 *
 * @private
 * @param {Object[]} offers List of offers to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object[]>}
 */
async function _getPopulatedOffers(offers, fields, parameters) {
  fields = fields || [];

  if (!offers || offers.length === 0) {
    return [];
  }

  return new Promise(async (resolve, reject) => {
    let offerIds = [],
      brandIds = [];

    let favoriteOffers = [],
      favoriteBrands = [];

    offers.forEach((offer) => {
      offerIds.push(offer.id);
      brandIds.push(offer.brand);
    });

    let brands = await brandDao.getBrandsByIds(brandIds);

    if (parameters[parameterTypeEnum.types.USERID.key]) {
      let favorites = await Promise.all([
        favoriteDao.getUserFavoritesByIdsAndType(
          parameters[parameterTypeEnum.types.USERID.key],
          offerIds,
          entityTypeEnum.types.OFFER
        ),
        favoriteDao.getUserFavoritesByIdsAndType(
          parameters[parameterTypeEnum.types.USERID.key],
          brandIds,
          entityTypeEnum.types.BRAND
        ),
      ]);
      favoriteOffers = favorites[0];
      favoriteBrands = favorites[1];
    }

    offers.forEach((offer) => {
      let brand = brands.filter((brand) => {
        return brand.id === offer.brand;
      })[0];

      if (parameters[parameterTypeEnum.types.USERID.key]) {
        offer.isFavorite =
          favoriteOffers.filter((favoriteOffer) => {
            return favoriteOffer.entity_id + "" === offer.id + "";
          }).length > 0;

        if (brand) {
          brand.isFavorite =
            favoriteBrands.filter((favoriteBrand) => {
              return favoriteBrand.entity_id + "" === brand.id + "";
            }).length > 0;
        }
      }

      if (brand) {
        offer.brand = new BrandResponseModel(brand);
      }
    });

    resolve(offers);
  });
}

/**
 * Returns the provided offer with its requested fields populated
 *
 * @private
 * @param {Object} offer Offer to populate
 * @param {String[]} [fields] Fields to populate
 * @param {Object} [parameters] Parameters used for population
 * @returns {Promise<Object>}
 */
async function _getPopulatedOffer(offer, fields, parameters) {
  let offers = await _getPopulatedOffers([offer], fields, parameters);
  return offers[0];
}

const getOfferByProperty = async (key, value, parameters) => {
  const { total, offers } = await indexService.searchData(null, {
    types: ["offer"],
    filters: [
      {
        fields: [key],
        query: value,
      },
    ],
  });
  if (total === 0) {
    throw new NotFoundErrorModel(`No offer found matching ${key} ${value}`);
  }
  const offer = offers[0];
  const populatedOffer = await _getPopulatedOffer(offer, [], {
    [parameterTypeEnum.types.USERID.key]: parameters.userId,
  });
  return new OfferResponseModel(populatedOffer);
};

/**
 * Returns the list of offers
 *
 * @public
 * @param {Number} [offset=0] Number to offset list of offers
 * @param {Number} [limit=20] Total number of offers to return
 * @param parameters
 * @returns {Promise.<OfferListResponseModel>}
 */
Service.prototype.getOffers = async function (
  offset = 0,
  limit = 20,
  parameters = {}
) {
  const { total, offers } = await indexService.searchData(
    "*",
    {
      types: ["offer"],
    },
    offset,
    limit,
    [
      { order: { order: "asc", missing: "_last", unmapped_type: "long" } },
      { "brand.slug.keyword": { order: "asc", missing: "_last", unmapped_type: "string" },  },
    ]
  );

  const populatedOffers = await _getPopulatedOffers(offers, [], {
    [parameterTypeEnum.types.USERID.key]: parameters.userId,
  });

  return new OfferListResponseModel(
    total,
    populatedOffers.map((offer) => {
      const model = { ...offer };
      if (model.brand) {
        model.brand = new BrandResponseModel(model.brand);
      }
      return model;
    })
  );
};


/**
 * Returns the offer matching the provided ID
 *
 * @public
 * @param {Number} id Offer ID
 * @param parameters
 * @returns {Promise.<OfferResponseModel>}
 * @throws NotFoundErrorModel if no offer was found
 */
Service.prototype.getOfferById = async function (id, parameters) {
  return getOfferByProperty("id", id, parameters);
};


/**
 * Returns the offer matching the provided slug
 *
 * @public
 * @param {String} slug Offer slug
 * @param parameters
 * @returns {Promise.<OfferResponseModel>}
 * @throws NotFoundErrorModel if no offer was found
 */
Service.prototype.getOfferBySlug = async function (slug, parameters) {
  return getOfferByProperty("slug", slug, parameters);
};

/**
 * Returns the offers matching the provided IDs
 *
 * @public
 * @param {Number[]} ids Offer IDs
 * @param parameters
 * @returns {Promise.<OfferListResponseModel>}
 */
Service.prototype.getOffersByIds = async function (ids, parameters = {}) {
  const { total, offers } = await indexService.searchData(undefined, {
    types: ["offer"],
    filters: [
      {
        fields: ["id"],
        query: ids.join(" OR "),
      },
    ],
  });

  const populatedOffers = await _getPopulatedOffers(offers, [], {
    [parameterTypeEnum.types.USERID.key]: parameters.userId,
  });

  return new OfferListResponseModel(total, populatedOffers);
};

Service.prototype.getOfferByIdSirqul = async function (id, parameters) {
  let params = {};
  params['offerId'] = id;
  params['includeOfferLocations'] = true;
  params['accountId'] = 1;

  return sirqulService.makePostRequestPromise(
      "offer/get",
      params,
      true,
      true
  ).then((data)=>{
    if(data && data.valid){
      let result = new OfferResponseModel(data, true);
      return result;
    }
    return null;
  })
};

Service.prototype.getOffersSirqul = async function (
    offset = 0,
    limit = 20,
    parameters = {}
) {
  return sirqulService.getOffersByEntityPromise(
      offset,
    limit,
    parameters
  );
};


module.exports = new Service();
