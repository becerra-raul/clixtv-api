let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getCharities = function(offset, limit) {
    return this.executeQuery(
        'SELECT * FROM charities WHERE enabled = 1 ORDER BY `order` ASC, name ASC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    );
};

Dao.prototype.getCharitiesByIds = function(ids) {
    return this.executeQuery(
        'SELECT * FROM charities WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getCharityBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM charities WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};

Dao.prototype.getCharityById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM charities WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getTotalCharities = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM charities WHERE enabled = 1'
    );
    return data[0].total;
};

Dao.prototype.getCharitiesBySeriesIds = async function(ids) {
    return await this.executeQuery(
        'SELECT c.*, scm.series FROM charities c, series_charities_map scm WHERE scm.charity = c.id AND scm.series IN (?) AND c.enabled = 1',
        [
            ids
        ]
    )
};

module.exports = new Dao();