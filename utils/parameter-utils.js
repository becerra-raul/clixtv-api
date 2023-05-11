function Util() {}

Util.prototype.getFormattedParameters = function(parameters) {

};

Util.prototype.isBoolean = function (value) {
    return [true, false, 'true', 'false', 0, 1].includes(value)
}

Util.prototype.getBoolean = function (value) {
    if ([1, true, 'true'].includes(value)) return true
    else return false
}

module.exports = new Util();