let BrandModel = require('./brand-model');

function BrandListModel(total, brands) {
    if (total) {
        this.total = total;
    }
    this.brands = brands.map(function(brand) {
        return new BrandModel(brand);
    });
}

module.exports = BrandListModel;