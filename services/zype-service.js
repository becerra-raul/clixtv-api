const request = require("request-promise-native");
const apiUtils = require("../utils/api-utils");
const zypeConfigs = apiUtils.getZypeConfig();
const environment = apiUtils.getEnvironment();

const BASE_URL = "https://api.zype.com";
const BASE_ANALYTICS_URL = "https://analytics.zype.com";
const READ_ONLY_AUTH = `api_key=${zypeConfigs.readOnly}`;
const ADMIN_AUTH = `api_key=${zypeConfigs.admin}`;

const filterResultsByEnvironment = (data) =>
    data.filter(({ environment: env }) => (env || []).includes(environment));

function Service() {}

Service.prototype.makeGetRequest = async function (path, options = {}) {
    const url = `${options.baseUrl || BASE_URL}${path}${
        path.indexOf("?") === -1 ? "?" : "&"
        }${options.auth || READ_ONLY_AUTH}`;
    const response = await request({
        method: "GET",
        url,
    });
    return JSON.parse(response);
};

Service.prototype.makePutRequest = async function (path, body, options = {}) {
    const url = `${options.baseUrl || BASE_URL}${path}${
        path.indexOf("?") === -1 ? "?" : "&"
        }${ADMIN_AUTH}`;
    const response = await request({
        method: "PUT",
        url,
        body,
        json: true,
    });
    return JSON.parse(response);
};

Service.prototype.getAllCategories = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=category`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllCategories(list.concat(response), page + 1);
};

Service.prototype.getCategories = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=category`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getCategoryById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=category`
    );
    return response;
};

Service.prototype.getAllStars = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=star`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllStars(list.concat(response), page + 1);
};

Service.prototype.getStars = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=star`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getStarById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=star`
    );
    return response;
};

Service.prototype.getAllBrands = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=brand`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllBrands(list.concat(response), page + 1);
};

Service.prototype.getBrands = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=brand`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getBrandById = async function (id) {
    const { response = [] } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=brand`
    );
    return response[0];
};

Service.prototype.getAllCharities = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=charities`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllCharities(list.concat(response), page + 1);
};

Service.prototype.getCharities = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=charities`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getCharityById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=charities`
    );
    return response;
};

Service.prototype.getAllSeries = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=series`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllSeries(list.concat(response), page + 1);
};

Service.prototype.getSeries = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=series`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getSeriesById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=series`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.updateSeriesById = async function (id, series) {
    const { response } = await this.makePutRequest(`/zobjects/${id}`, {
        zobject_type: "series",
        zobject: series,
    });
    return response;
};

Service.prototype.getAllEpisodes = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=episodes`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllEpisodes(list.concat(response), page + 1);
};

Service.prototype.getEpisodes = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=episodes`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getEpisodeById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=episodes`
    );
    return response;
};

Service.prototype.updateEpisodeById = async function (id, episode) {
    const { response } = await this.makePutRequest(`/zobjects/${id}`, {
        zobject_type: "episodes",
        zobject: episode,
    });
    return response;
};

Service.prototype.getPlaylistById = async function (id = "") {
    return this.makeGetRequest(`/playlists/${id}`);
};

Service.prototype.getVideoById = async function (id = "") {
    const { response } = await this.makeGetRequest(`/videos/${id}`);
    return response;
};

Service.prototype.getVideoBySlug = async function (slug = "") {
    const { response = {} } = await this.makeGetRequest(
        `/videos/?friendly_title=${slug}`
    );
    return response[0];
};

Service.prototype.getVideosByPlaylistId = async function (id = "") {
    return this.makeGetRequest(`/videos?playlist_id.inclusive=${id}`);
};

Service.prototype.getVideos = async function (offset = 0, limit = 500) {
    return this.makeGetRequest(`/videos?page=${offset}&per_page=${limit}`);
};

Service.prototype.getAllVideoSources = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/video_sources?page=${page}&per_page=500`
    );
    if (!response.length) {
        return list;
    }
    return this.getAllVideoSources(list.concat(response), page + 1);
};

Service.prototype.getVideoSources = async function (offset = 0, limit = 500) {
    const { response } = this.makeGetRequest(
        `/video_sources?page=${offset}&per_page=${limit}`
    );
    return response;
};

Service.prototype.getAllOffers = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=offer`
    );
    if (!response.length) {
        return filterResultsByEnvironment(list);
    }
    return this.getAllOffers(list.concat(response), page + 1);
};

Service.prototype.getOffers = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=offer`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getOfferById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=offer`
    );
    return response;
};

Service.prototype.getCarousels = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=carousels`
    );
    return filterResultsByEnvironment(response);
};

Service.prototype.getCarouselById = async function (id) {
    const { response } = await this.makeGetRequest(
        `/zobjects?id=${id}&zobject_type=carousels`
    );
    return response;
};

Service.prototype.getAnalyticsByVideoId = async function (id, startDate = '2020-09-01') {
    const { data = [] } = await this.makeGetRequest(
        `/v2/engagement?group_by%5B%5D=video_id&group_by%5B%5D=video_title&sums%5B%5D=time_watched_seconds&sums%5B%5D=plays&filters%5Bvideo_id_eq%5D=${id}&filters%5Bstart_date_gte%5D=${startDate}`,
        {
            baseUrl: BASE_ANALYTICS_URL,
            auth: ADMIN_AUTH,
        }
    );
    return data[0];
};

Service.prototype.getAllAffiliates = async function (list = [], page = 1) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=500&zobject_type=affiliate`
    );
    if (!response.length) {
        return list;
    }
    return this.getAllAffiliates(list.concat(response), page + 1);
};

Service.prototype.getAffiliates = async function (page = 1, limit = 500) {
    const { response } = await this.makeGetRequest(
        `/zobjects?page=${page}&per_page=${limit}&zobject_type=affiliate`
    );
    return response;
};

Service.prototype.updateAffiliateById = async function (id, affiliate) {
    const { response } = await this.makePutRequest(`/zobjects/${id}`, {
        zobject_type: "affiliate",
        zobject: affiliate,
    });
    return response;
};

module.exports = new Service();
