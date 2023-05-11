let AdListResponseModel = require("../models/response/Sirqul/ad-list-response-model"),
    EpisodeListResponseModel = require('../models/response/episode-list-response-model'),
    StarListResponseModel = require("../models/response/star-list-response-model"),
    OfferListResponseModel = require('../models/response/offer-list-response-model'),
    BrandListResponseModel = require("../models/response/brand-list-response-model"),
    CharityListResponseModel = require("../models/response/charity-list-response-model"),
    SearchResponseModel = require("../models/response/search-response-model"),
    CategoryListResponseModel = require("../models/response/category-list-response-model"),
    ApiResponseModel = require("../models/api-response-model"),
    AlbumResponseModel = require("../models/response/album-response-model");
let CacheBase = require('cache-base');

const request = require("request-promise-native");
const apiUtils = require("../utils/api-utils");
const sirqulAnalyticConfigs = apiUtils.getSirqulAnlyticConfig();
const sirqulProdConfigs = apiUtils.getSirqulProdConfig();

const app = new CacheBase();

function Service() {}

Service.prototype.makePostRequest = async function (path, formData, requireAppKey = false, requireAccountId = false) {
    // TODO: use only 1 config when Clix have their own stack and point there
    // ads and migrated data is currently on prod
    const config = ( path.includes("analytics/usage") ) ? sirqulAnalyticConfigs : sirqulProdConfigs;

    if(requireAppKey)
        formData.appKey = config.appKey;

    const url = `${config.host}/api/${config.apiVersion}/${path}`;
    const options = {
        method: 'POST',
        uri: url,
        form: formData,
        headers: {
            'Application-Key': config.appKey,
            'Application-Rest-Key': config.restKey,
        },
    };

    const response = await request(options);
    return JSON.parse(response);
};

Service.prototype.makePostRequestPromise = async function(path, formData, requireAppKey = false, requireAccountId = false, extraData = null){
    // TODO: use only 1 config when Clix have their own stack and point there
    // ads and migrated data is currently on prod
    const config = ( path.includes("analytics/usage") ) ? sirqulAnalyticConfigs : sirqulProdConfigs;

    if(requireAppKey)
        formData.appKey = config.appKey;

    if(requireAccountId && !formData.accountId)
        formData.accountId = config.accountId || 1;

    const url = `${config.host}/api/${config.apiVersion}/${path}`;
    const options = {
        method: 'POST',
        uri: url,
        form: formData,
        headers: {
            'Application-Key': config.appKey,
            'Application-Rest-Key': config.restKey,
        },
    };

    return request(options)
        .then((data)=>{
            let result = JSON.parse(data);
            if(extraData){
                Object.assign(result, extraData);
            }
            return result;
        });
}

Service.prototype.findAds = async function(params){
    // if(!sirqulProdConfigs.missionId || sirqulProdConfigs.missionId <= 0)
    //     return new AdListResponseModel({});
    // Object.assign(params, {
    //     'targetedAdsOnly': 'false',
    //     'missionIds': sirqulProdConfigs.missionId,
    // });
    let ads = await this.makePostRequest('ads/find', params, true);
    return new AdListResponseModel(ads);
}

Service.prototype.getAppConfig = async function(customVersion = null){

    let self = this;
    if(!customVersion)
        customVersion = sirqulProdConfigs.appConfigVersion;

    if(sirqulProdConfigs.devCacheMode){
        let devCacheId = self.getDevCacheId("appConfig" + customVersion, arguments);
        if(self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    }
    let params = {
        "configVersion" : customVersion
    };
    let appConfig = await this.makePostRequest('appconfig/getbyversion', params, true);
    if(appConfig && appConfig.item && appConfig.item.configJson){
        let result = JSON.parse(appConfig.item.configJson);
        try {
            if (Array.isArray(result.universalSectionOrder)) {
                result.sectionOrders = {};
                result.universalSectionOrder.forEach(section => {
                    result.sectionOrders[`${section.title}`] = section;
                });

                //shows page
                result.browseseries.categories = result.universalSectionOrder;

                //seasons page
                result.browseseasons.categories = result.universalSectionOrder;

                //categories page
                // result.browsecategories.categories = result.universalSectionOrder;

                //home page
                // result.homeview.categories = result.universalSectionOrder.map(category => {
                //     const clonedCategory = { ...category, albumTypes: ['episodes'] };
                //     if (category.albumId) {
                //         clonedCategory.albums = [category.albumId];
                //     }
                //     return clonedCategory;
                // });

                //star page
                result.browsestars.categories = result.universalSectionOrder.map(category => {
                    const clonedCategory = { ...category, albumTypes: ['star'] };
                    if (category.albumId) {
                        clonedCategory.albums = [category.albumId];
                    }
                    return clonedCategory;
                });
            }
        } catch (error) {
            console.error("appconfig parsing error::", error)
        }
        if(sirqulProdConfigs.devCacheMode){
            let devCacheId = self.getDevCacheId("appConfig" + customVersion, arguments);
            self.saveDevCache(devCacheId, result);
        }
        result.configVersion = appConfig.item.configVersion;
        return result;
    }
    return null;
}

/**
 * Different setting retrieved with json format, mainly used for api
 * @returns {Promise<void>}
 */
Service.prototype.getConfigSettings = async function(){
    return request({
        uri: sirqulProdConfigs.homeCategoriesUrl
    }).then((data)=>{
        return JSON.parse(data);
    })
}

Service.prototype.getCategorySettings = async function(){
    let customVersion = sirqulProdConfigs.appConfigVersion;
    return this.getAppConfig(customVersion)
        .then((data) => {
            //setting order as per universal section order
            // data.homeview.categories = data.homeview.categories.filter(category => {
            //     if (data.sectionOrders[category.title]) {
            //         data.sectionOrders[category.title] = category;
            //     }
            // })
            return data.homeview.categories.sort((a,b)=>(a.order-b.order));
        })
}

Service.prototype.analyticsUsage = async function(params) {
	if (!params.tag) {
		params.tag = 'test_tag';
	}
    params.appKey = sirqulAnalyticConfigs.appKey;
    return this.makePostRequest('analytics/usage', params, true);
};

Service.prototype.geolocation = async function(params) {
    // TODO: move this method into its own service and save the user:pass into configuration file
    if (!params.ip) {
        params.ip = 'me';
    }

    const url = `https://geolite.info/geoip/v2.1/city/${params.ip}`;
    const options = {
        method: 'GET',
        uri: url,
        headers: {
            'Authorization': 'Basic ' +  Buffer.from('621299:7pSS0xbW9OKhT0zl').toString('base64')
        },
    };

    const response = await request(options);
    return JSON.parse(response);
};

/**
 * Generic methods to retrieve Sirqul entities including star,brand,charity and categoy from a parent entity
 */
Service.prototype.getSubEntitiesByEntityPromise = async function(id, audienceIds, entityType, subEntityType, offset= 0, limit = 20, extraParameters = {}){
    let self = this;

    let devCacheId = self.getDevCacheId(entityType + "-SubEntitiesByEntity", arguments);
    if(sirqulProdConfigs.devCacheMode){
        if(self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    }

    // convert to sirqul's albumType
    subEntityType = self.toAlbumType(subEntityType);

    let params = {};
    params['albumType'] = subEntityType;
    params['audienceIds'] = audienceIds;
    params['start'] = offset;
    params['limit'] = limit;
    params['includeLiked'] = true;
    params['includeFavorited'] = true;
    params['searchMode'] = "CLOUDINDEX";
    params['includeRating'] = true;
    if(!extraParameters || !extraParameters['sortField']){
        params['sortField'] = "ALBUM_START_DATE";
        params['descending'] = "true";
    }
    params = {
        ...params,
        ...extraParameters
    }
    params.categoryFilterIds = parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined;
    return self.makePostRequestPromise(
        "album/search",
        params,
        true,
        true
    ).then((data)=>{
        if(data && data.items){
            let result = null;
            switch (subEntityType){
                case "episodes":
                    result = new EpisodeListResponseModel( data.countTotal, data.items, true);
                    break;
                case "star":
                    result = new StarListResponseModel( data.countTotal, data.items, true);
                    break;
                case "brand":
                    result = new BrandListResponseModel( data.countTotal, data.items, true);
                    break;
                case "charities":
                    result = new CharityListResponseModel( data.countTotal, data.items, true);
                    break;
                case "category":
                    result = new CategoryListResponseModel( data.countTotal, data.items, true);
                    break;
            }
            if(sirqulProdConfigs.devCacheMode){
                let devCacheId = self.getDevCacheId(entityType + "-SubEntitiesByEntity", arguments);
                self.saveDevCache(devCacheId, result);
            }
            return result;
        }
    });
}

Service.prototype.getAllOffersPromise = async function(offsetOffers, limitOffers){
    return this.getOffersByEntityPromise(null, null, offsetOffers, limitOffers);
}

Service.prototype.getOffersByEntityPromise = async function(retailerLocationId, entityType, offsetOffers= 0, limitOffers = 20, keyword=null, additionalQuery = {}){

    let self = this;

    if(sirqulProdConfigs.devCacheMode){
        let devCacheId = self.getDevCacheId(entityType + "-OffersByEntity", arguments);
        if(self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    }

    let params = {};
    params['offerTypes'] = "PRODUCT";
    if(retailerLocationId)
        params['retailerLocationIds'] = retailerLocationId;
    params['start'] = offsetOffers;
    params['limit'] = limitOffers;
    if(keyword)
        params['keyword'] = keyword;


    params['includeFavorited'] = true;
    //TODO replace with user location
    params['latitude'] = 0;
    params['longitude'] = 0;
    params['searchRange'] = 50000;
    if(sirqulProdConfigs.offerFilters)
        params['filters'] = sirqulProdConfigs.offerFilters;
    Object.assign(params, additionalQuery);    
    return self.makePostRequestPromise(
        "offer/lists",
        params,
        true,
        true
    ).then((data)=>{
        if(data && data.items){
            let result = new OfferListResponseModel( data.countTotal, data.items, true);
            if(sirqulProdConfigs.devCacheMode){
                let devCacheId = self.getDevCacheId(entityType + "-OffersByEntity", arguments);
                self.saveDevCache(devCacheId, result);
            }
            return result;
        }
    });
}

Service.prototype.getEntityBySlug = async function (entityType, slug, parameters) {
    let self = this;

    // if (sirqulProdConfigs.devCacheMode) {
    //     let devCacheId = self.getDevCacheId(entityType + "-Entity", arguments);
    //     if (self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    // }

    let params = {};
    if (parameters) {
        params['accountId'] = parameters.userId;
    }
    params['subType'] = slug;
    params['includeFavorited'] = true;
    params['includeLiked'] = true;
    params['includeRating'] = true;
    params['albumType'] = entityType;
    params['audiencePreviewSize'] = 100;
    params['notePreviewSize'] = 0;
    params['connectionPreviewSize'] = 0;
    params['searchMode'] = "CLOUDINDEX";
    params.categoryFilterIds = parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined;
    return self.makePostRequestPromise(
        "album/search",
        params,
        true,
        !params.accountId
    ).then((sirqulEntities)=>{
        if(sirqulEntities.valid && sirqulEntities.items && sirqulEntities.items.length){
            let result = self.processEntity(sirqulEntities.items[0], parameters);

            if(sirqulProdConfigs.devCacheMode){
                let devCacheId = self.getDevCacheId(entityType + "-Entity", arguments);
                self.saveDevCache(devCacheId, result)
            }

            return result;
        }
        return null;
    })
}

Service.prototype.getEntityById = async function(entityType, id, parameters){
    let self = this;

    if(sirqulProdConfigs.devCacheMode){
        let devCacheId = self.getDevCacheId(entityType + "-Entity", arguments);
        if(self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    }

    let params = {};
    if (parameters) {
        params['accountId'] = parameters.userId;
    }
    params['albumId'] = id;
    params['includeFavorited'] = true;
    params['includeLiked'] = true;
    params['includeRating'] = true;
    params['audiencePreviewSize'] = 10;
    params['notePreviewSize'] = 0;
    params['connectionPreviewSize'] = 0;

    return self.makePostRequestPromise(
        "album/get",
        params,
        true,
        !params.accountId
    ).then((sirqulEntity)=>{
        if(sirqulEntity.valid && sirqulEntity.albumId){
            let result = self.processEntity(sirqulEntity, parameters);

            if(sirqulProdConfigs.devCacheMode){
                let devCacheId = self.getDevCacheId(entityType + "-Entity", arguments);
                self.saveDevCache(devCacheId, result)
            }

            return result;
        }
        return null;
    })
}

Service.prototype.processEntity = async function(sirqulEntity, parameters){
    let self = this;
    if(sirqulEntity) {
        let metaData = JSON.parse(sirqulEntity.metaData);
        let entityType = sirqulEntity.albumType;
        let ps = [];
        // retrieve additional fields
        if(parameters.fields && parameters.fields.length){
            parameters.fields.forEach((field)=>{
                if(entityType === "star" && ["brand", "brands", "charity", "charities"].includes(field)){
                    // brands and charities is in star album's audiences
                    // which will be retrieved in star-reponse-model
                } else {
                    let extraParameter = {};
                    if(sirqulEntity.albumType === "category"){
                        if(metaData.random){
                            extraParameter = {
                                "sortField": "RANDOM"
                            }
                        } else {
                            extraParameter = {
                                "sortField": "ALBUM_START_DATE",
                                "orderAudienceId": metaData.sirqul_audience_id
                            }
                        }
                    }
                    if (parameters.keyword) extraParameter.keyword = parameters.keyword;
                    if (parameters.sortField) extraParameter.sortField = parameters.sortField;
                    if (parameters.orderAudienceId) {
                        metaData.sirqul_audience_id = parameters.orderAudienceId;
                    }
                    let p = self
                        .getSubEntitiesByEntityPromise(sirqulEntity.albumId, metaData.sirqul_audience_id, entityType, field, parameters.offsetEpisodes || 0, parameters.limitEpisodes || 20, extraParameter)
                        .then((data)=>{
                            if(data)
                                sirqulEntity[field] = data;
                            return sirqulEntity;
                        });
                    ps.push(p);
                }
            });
        }

        if(entityType === "brand" && metaData.sirqul_retailer_location_id){
            let p = self.getOffersByEntityPromise(metaData.sirqul_retailer_location_id, entityType, parameters.offsetOffers || 0, parameters.limitOffers || 20)
                .then((offers)=>{
                    sirqulEntity.offers = offers;
                });
            ps.push(p);
        }

        if(ps.length){
            return Promise
                .all(ps)
                .then((data)=>{
                    return sirqulEntity;
                });
        }
        return sirqulEntity;
    }
    return null;
}

Service.prototype.getEntitiesPromise = async function (entityType, offset = 0, limit = 20, parameters = {}, sortField = "ALBUM_START_DATE", descending = "true", extraParameters = {}) {
    let self = this;

    if(sirqulProdConfigs.devCacheMode){
        let devCacheId = self.getDevCacheId(entityType + "-Entities", arguments);
        if(self.isDevCached(devCacheId)) return self.getDevCache(devCacheId);
    }

    let params = {};
    if (parameters.userId) {
        params['accountId'] = parameters.userId;
    }
    params['includeFavorited'] = true;
    params['includeLiked'] = true;
    params['includeRating'] = true;
    params['albumType'] = self.toAlbumType(entityType);
    params['start'] = offset;
    params['limit'] = limit;
    params['searchMode'] = "CLOUDINDEX";

    if(sortField)
        params['sortField'] = sortField;
    if(descending)
        params['descending'] = descending;

    params = {
        ...params,
        ...parameters,
        ...extraParameters
    }
    params.categoryFilterIds = parseInt(sirqulProdConfigs.appConfigVersion || 0) || undefined;
    return self.makePostRequestPromise(
        "album/search",
        params,
        true,
        !params.accountId
    )
        .then((sirqulEntities)=> {
            if(sirqulEntities && sirqulEntities.items && sirqulEntities.items.length){
                let ps = [];
                sirqulEntities.items.forEach((entity)=>{
                    let metaData = JSON.parse(entity.metaData);
                    if(metaData && metaData.sirqul_audience_id){
                        // get episodes if requested
                        if(
                            parameters['fields'] &&
                            parameters['fields'].length &&
                            ( parameters['fields'].includes("episodes") || parameters['fields'].includes("episode") )
                        ){
                            let p = self.getSubEntitiesByEntityPromise(entity.albumId, metaData.sirqul_audience_id, entityType, "episodes", 0, 1)
                                .then((episodes)=>{
                                    entity.episodes = episodes;
                                });
                            ps.push(p);
                        }
                    }
                    if(entityType === "brand" && metaData.sirqul_retailer_location_id){
                        let p = self.getOffersByEntityPromise(metaData.sirqul_retailer_location_id, entityType, 0, 1)
                            .then((offers)=>{
                                entity.offers = offers;
                            });
                        ps.push(p);
                    }
                });
                return Promise
                    .all(ps)
                    .then((data)=>{
                        if(sirqulProdConfigs.devCacheMode){
                            let devCacheId = self.getDevCacheId(entityType + "-Entities", arguments);
                            self.saveDevCache(devCacheId, sirqulEntities)
                        }
                        return sirqulEntities;
                    });
            }
            return null;
        });
};

Service.prototype.searchUniversal = async function(term, entityTypes, offsetEach = 0, limitEach = 3){
    let self = this;
    if(!entityTypes){
        entityTypes = 'brand,star,charity,category,episode,offer,news,series';
    }
    let entityTypesArray = entityTypes.split(",");
    let extraParameters = {
      "keyword" : term
    };
    let promises = [];
    let total = 0;
    entityTypesArray.forEach((entityType)=>{
        if(entityType === "offer"){
            let p = self
                .getOffersByEntityPromise(null, null, null, null, term)
                .then((offerListResponse)=>{
                    console.log(offerListResponse);
                    let result = null;
                    if(offerListResponse && offerListResponse.offers){
                        result = {};
                        result._type = entityType;
                        result._source = offerListResponse.offers;
                    }
                    return result;
                });
            promises.push(p);
        } else {
            let p = self
                .getEntitiesPromise(entityType, offsetEach, limitEach, {}, "ALBUM_START_DATE", "true", extraParameters)
                .then((data)=>{
                    let result = null;

                    if(data && data.items){
                        total += data.items.length;
                        result = {};
                        result._type = entityType;
                        let response = null;

                         switch (entityType){
                            case "episode":
                            case "episodes":
                                response = new EpisodeListResponseModel( data.countTotal, data.items, true);
                                result._source = response.episodes;
                                break;
                            case "star":
                            case "stars":
                                response = new StarListResponseModel( data.countTotal, data.items, true);
                                result._source = response.stars;
                                break;
                            case "brand":
                            case "brands":
                                response = new BrandListResponseModel( data.countTotal, data.items, true);
                                result._source = response.brands;
                                break;
                            case "charities":
                            case "charity":
                                response = new CharityListResponseModel( data.countTotal, data.items, true);
                                result._source = response.charities;
                                break;
                            case "categories":
                            case "category":
                                response = new CategoryListResponseModel( data.countTotal, data.items, true);
                                result._source = response.categories;
                                 break;
                            case "news":
                            case "series":
                                response = new ApiResponseModel(data, AlbumResponseModel);
                                result._source = response.items;
                                break;
                        }
                    }
                    return result;
                });
            promises.push(p);
        }
    });
    return Promise
        .all(promises)
        .then((data)=>{
            data = data.filter((d)=> d && d._source);
            return new SearchResponseModel(total, data, true);
        });
}

Service.prototype.toAlbumType = function(entityType){
    switch (entityType){
        case "episode":
        case "episodes":
            entityType = "episodes";
            break;
        case "star":
        case "stars":
            entityType = "star";
            break;
        case "brand":
        case "brands":
            entityType = "brand";
            break;
        case "charities":
        case "charity":
            entityType = "charities";
            break;
        case "categories":
        case "category":
            entityType = "category";
            break;
        default:
            // return null;
    }
    return entityType;
}

Service.prototype.getDevCacheId = function(name, arguments){
    let cacheId = Buffer.from(name + JSON.stringify(arguments)).toString('base64');
    // console.log(cacheId);
    return cacheId;
}

Service.prototype.isDevCached = function(cacheId){
    return app.get(cacheId) ? true : false;
}

Service.prototype.getDevCache = async function(cacheId){
    if(app.get(cacheId)){
        // console.log("cached for " + Buffer.from(cacheId, 'base64').toString('binary'));
        return new Promise((resolve, reject)=>{
            resolve(app.get(cacheId));
        });
    }
    return null;
}

Service.prototype.saveDevCache = async function(cacheId, data){
    app.set(cacheId, data);
}

Service.prototype.uploadFile = async function (path, formData, requireAppKey = false, requireAccountId = false, extraData = null) {
    // TODO: use only 1 config when Clix have their own stack and point there
    // ads and migrated data is currently on prod
    const config = ( path.includes("analytics/usage") ) ? sirqulAnalyticConfigs : sirqulProdConfigs;

    if(requireAppKey)
        formData.appKey = config.appKey;

    const url = `${config.host}/api/${config.apiVersion}/${path}`;
    const options = {
        method: 'POST',
        uri: url,
        headers: {
            'Application-Key': config.appKey,
            'Application-Rest-Key': config.restKey,
        },
    };

    const apiCall = request(options);
    const apiCallForm = apiCall.form();
    Object.keys(formData).forEach(key => {
        apiCallForm.append(key, formData[key])
    })
    const response = await apiCall
    return JSON.parse(response);
}

Service.prototype.getApplication = async function () {
    let appDetail = await this.getDevCache("APP_DETAIL");
    if (!appDetail) {
        appDetail = await this.makePostRequestPromise("/application/get", {}, true);
        this.saveDevCache("APP_DETAIL", appDetail);
    }
    return appDetail;
}


module.exports = new Service();