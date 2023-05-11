let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getStarsByIds = function(ids) {
    return this.executeQuery(
        'SELECT * FROM stars WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getStarsBySeriesIds = async function(ids) {
    return await this.executeQuery(
        'SELECT s.*, ssm.series FROM stars s, stars_series_map ssm WHERE s.id = ssm.star AND ssm.series IN (?) AND s.enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getTotalStarsByBrandId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(st.id) AS total FROM series_brands_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.brand = ? AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getStarsByBrandId = async function(id, offset, limit) {
    return await this.executeQuery(
        'SELECT st.* FROM series_brands_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.brand = ? AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    )
};

Dao.prototype.getStarsByBrandIds = async function(ids) {
    return await this.executeQuery(
        'SELECT st.* FROM series_brands_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.brand IN (?) AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series AND st.enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getTotalStarsByCharityId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(st.id) AS total FROM series_charities_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.charity = ? AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series AND st.enabled = 1',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getStarsByCharityIds = async function(ids) {
    return await this.executeQuery(
        'SELECT st.* FROM series_charities_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.charity IN (?) AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series AND st.enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getStarsByCharityId = async function(id, offset, limit) {
    return await this.executeQuery(
        'SELECT st.* FROM series_charities_map sbm, series s, stars_series_map ssm, stars st WHERE sbm.charity = ? AND sbm.series = s.id AND ssm.star = st.id AND ssm.series = sbm.series AND st.enabled = 1 LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    )
};

Dao.prototype.getStarBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM stars WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};


/**
 * Returns the list of stars
 *
 * @param {Number} offset Return offset
 * @param {Number} limit Return limit
 */
Dao.prototype.getStars = function(offset, limit) {
    return this.executeQuery(
        'SELECT * FROM stars WHERE enabled = 1 ORDER BY `order` ASC, name ASC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    );
};

/**
 * Returns the total number of stars
 *
 * @returns {Promise.<Number>}
 */
Dao.prototype.getTotalStars = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM stars WHERE enabled = 1'
    );
    return data[0].total;
};

/**
 * Return the star matching the provided ID
 *
 * @param {Number} id Star ID
 * @returns {Promise.<Object>}
 */
Dao.prototype.getStarById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM stars WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

/**
 * Adds a new star
 *
 * @param {String} name Star name
 * @param {String} slug Star slug
 * @returns {Promise.<Object>}
 */
Dao.prototype.addStar = async function(name, slug) {
    return await this.executeQuery(
        'INSERT INTO stars SET ?',
        {
            name: name,
            slug: slug
        }
    )
};

/**
 * Update a star matching the provided ID
 *
 * @param {Number} id Star ID
 * @param {Object} model Star model
 * @returns {Promise.<Object>}
 */
Dao.prototype.updateStarById = async function(id, model) {
    return await this.executeQuery(
        'UPDATE stars SET ? WHERE id = ?',
        [
            model,
            id
        ]
    )
};

module.exports = new Dao();