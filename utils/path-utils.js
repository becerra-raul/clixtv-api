let apiUtils = require('./api-utils');

function Utils() {}

Utils.prototype.getImagePathForUrl = function(url) {
    url = (typeof url === 'string') ? url : url + '';
    let parts = url.split('/');
    return apiUtils.getImagePath() + parts[parts.length - 1];
};

module.exports = new Utils();