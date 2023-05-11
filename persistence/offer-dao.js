let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getTotalOffers = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM offers WHERE enabled = 1'
    );
    return data[0].total;
};

Dao.prototype.getOffers = function(offset, limit) {
    return this.executeQuery(
        'SELECT o.* FROM offers o, brands b WHERE o.enabled = 1 AND o.brand = b.id ORDER BY o.`order` ASC, b.name ASC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    );
};

Dao.prototype.getOffersByIds = function(ids) {
    return this.executeQuery(
        'SELECT * FROM offers WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getOfferBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM offers WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};

Dao.prototype.getOfferById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM offers WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getTotalOffersByBrandIds = async function(ids) {
    return await this.executeQuery(
        'SELECT brand, COUNT(*) AS total FROM offers WHERE brand IN (?) GROUP BY brand',
        [
            ids
        ]
    );
};

Dao.prototype.getOffersByBrandIds = async function(ids) {
    return await this.executeQuery(
        'SELECT * FROM offers WHERE brand IN (?) AND enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getOffersByBrandId = async function(id, offset, limit) {
    return this.executeQuery(
        'SELECT * FROM offers WHERE brand = ? AND enabled = 1 ORDER BY `order` ASC, name ASC LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    );
};

Dao.prototype.getTotalOffersByBrandId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM offers WHERE brand = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0].total;
};

module.exports = new Dao();