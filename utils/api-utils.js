let config = require('config');

function ApiUtils() {}

ApiUtils.prototype.getPaths = function() {
    return config.get('paths');
};

ApiUtils.prototype.getImagePath = function() {
    return config.get('paths.image');
};

ApiUtils.prototype.getVideoPath = function() {
    return config.get('paths.video');
};

ApiUtils.prototype.getSendGridConfig = function() {
    return config.get('services.sendgrid');
};

ApiUtils.prototype.getUnivtecConfig = function() {
    return config.get('services.univtec');
};

ApiUtils.prototype.getMySqlConfig = function() {
    return config.get('services.mysql');
};

ApiUtils.prototype.getEnvironment = function() {
    return config.get('environment');
};

ApiUtils.prototype.getJWTConfig = function() {
    return config.get('jwt');
};

ApiUtils.prototype.getAWSConfig = function() {
    return config.get('services.aws');
};

ApiUtils.prototype.getFacebookConfig = function() {
    return config.get('services.facebook');
};

ApiUtils.prototype.getGoogleConfig = function() {
    return config.get('services.google');
};

ApiUtils.prototype.getZypeConfig = function() {
    return config.get('services.zype');
};

ApiUtils.prototype.getSirqulAnlyticConfig = function() {
    return config.get('services.sirqulAnalytic');
};

ApiUtils.prototype.getSirqulProdConfig = function() {
    return config.get('services.sirqulProd');
};

ApiUtils.prototype.getSirqulProdMysqlSessionConfig = function() {
    return config.get('services.sirqulProd.mysqlSessionConfig');
};

ApiUtils.prototype.getTwitterConfig = function() {
    return config.get('services.twitter');
};

ApiUtils.prototype.getAmbassadorConfig = function () {
    return config.get('services.ambassador');
};

module.exports = new ApiUtils();