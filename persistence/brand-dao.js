let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getBrands = function(offset, limit) {
    return this.executeQuery(
        'SELECT * FROM brands WHERE enabled = 1 ORDER BY `order` ASC, name ASC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    );
};

Dao.prototype.getBrandsByIds = function(ids) {
    return this.executeQuery(
        'SELECT * FROM brands WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getBrandBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM brands WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};

Dao.prototype.getBrandById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM brands WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getTotalBrands = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM brands WHERE enabled = 1'
    );
    return data[0].total;
};

Dao.prototype.getBrandsBySeriesIds = async function(ids) {
    return await this.executeQuery(
        'SELECT b.*, sbm.series FROM brands b, series_brands_map sbm WHERE sbm.brand = b.id AND sbm.series IN (?) AND b.enabled = 1 ORDER BY sbm.order',
        [
            ids
        ]
    )
};

module.exports = new Dao();