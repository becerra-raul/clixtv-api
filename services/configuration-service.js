let configurationDao = require('../persistence/configuration-dao'),
    ConfigurationListResponseModel = require('../models/response/configuration-list-response-model');

function Service() {}

async function _adConfiguration(key, value, type) {
    return await configurationDao.addConfiguration(key, value, type, new Date());
}

async function _getConfigurations(type) {
    let configurations = await configurationDao.getConfigurations(type);
    return new ConfigurationListResponseModel(configurations);
}

Service.prototype.addMobileConfiguration = async function(key, value) {
    return await _adConfiguration(key, value, 'MOBILE');
};

Service.prototype.getMobileConfigurations = async function() {
    return await _getConfigurations('MOBILE');
};

Service.prototype.addSiteConfiguration = async function(key, value) {
    return await _adConfiguration(key, value, 'SITE');
};

Service.prototype.getSiteConfigurations = async function() {
    return await _getConfigurations('SITE');
};

module.exports = new Service();