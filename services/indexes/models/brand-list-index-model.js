const BrandIndexModel = require('./brand-index-model');

function BrandListIndexModel(total, brands) {
    brands = (brands instanceof Array) ? brands : [];
    this.total = (isNaN(total)) ? 0 : total;
    this.brands = brands.map((brand) => {
        return new BrandIndexModel(brand);
    })
}

module.exports = BrandListIndexModel;