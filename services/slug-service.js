let slug = require('slug'),
    slugDao = require('../persistence/slug-dao');

slug.charmap['%'] = 'percent';

function Service() {
    this.typeKeys = {
        category: 'CATEGORY',
        brand: 'BRAND',
        charity: 'CHARITY',
        star: 'STAR',
        offer: 'OFFER',
        episode: 'EPISODE',
        series: 'SERIES'
    }
}

Service.prototype.getSlugByValue = function(value) {
    if (!value) {
        return '';
    }
    return slug(value, {
        lower: true
    });
};

Service.prototype.getMapBySlug = async function(slug, type) {
    return await slugDao.getBySlug(slug, type);
};

Service.prototype.addSlugMap = async function(slug, id, type) {
    return await slugDao.addSlugMap(slug, id, type);
};



module.exports = new Service();