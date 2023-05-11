let CharityModel = require('./charity-model');

function CharityListModel(total, charities) {
    if (total) {
        this.total = total;
    }
    this.charities = charities.map(function(charity) {
        return new CharityModel(charity);
    });
}

module.exports = CharityListModel;