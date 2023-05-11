const util = require('util');

function UnAuthorizedError(msg = '') {
    this.message = msg || 'Unauthorized access!';
    this.name = this.constructor.name
}

util.inherits(UnAuthorizedError, Error);

module.exports = UnAuthorizedError;