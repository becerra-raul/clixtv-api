const util = require('util');

function ValidationError(msg) {
    this.message = msg;
    this.name = this.constructor.name;
}

util.inherits(ValidationError, Error);

module.exports = ValidationError;