let crypto = require('crypto');

function Utils() {}

Utils.prototype.getRandomToken = function(length) {
    length = length || 32;
    return crypto.randomBytes(length).toString('hex');
};

module.exports = new Utils();