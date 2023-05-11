const CharityIndexModel = require('./charity-index-model');

function CharityListIndexModel(total = 0, charities = []) {
    this.total = total;
    this.charities = charities.map(charity => new CharityIndexModel(charity));
}

module.exports = CharityListIndexModel;