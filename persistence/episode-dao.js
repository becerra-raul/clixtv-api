let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getEpisodes = async function(offset, limit) {
    return await this.executeQuery(
        'SELECT e.*, ssm.star from stars_series_map ssm, episodes e WHERE ssm.series = e.series AND e.enabled = 1 LIMIT ?, ?',
        [
            offset,
            limit
        ]
    )
};

Dao.prototype.getEpisodesByIds = async function(ids) {
    return await this.executeQuery(
        'SELECT * FROM episodes WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getEpisodeBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM episodes WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};

Dao.prototype.getEpisodeById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM episodes WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getTotalEpisodesByCategoryId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(*) AS total FROM categories_series_map csm, episodes e WHERE csm.series = e.series AND csm.category = ?',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getEpisodesByCategoryId = async function(id, offset, limit) {
    return await this.executeQuery(
        'SELECT e.* FROM categories_series_map csm, episodes e WHERE csm.series = e.series AND csm.category = ? ORDER BY e.added_date DESC LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    );
};

Dao.prototype.getEpisodesByCategoryIds = async function(ids) {
    return await this.executeQuery(
        'SELECT e.* FROM categories_series_map csm, episodes e WHERE csm.series = e.series AND csm.category IN (?) ORDER BY e.added_date DESC',
        [
            ids
        ]
    );
};

Dao.prototype.getTotalEpisodesByBrandId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(e.id) AS total FROM episodes e, series_brands_map sbm WHERE sbm.brand = ? AND sbm.series = e.series',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getEpisodesByBrandId = async function(id, offset, limit) {
    return await this.executeQuery(
        'SELECT e.* FROM episodes e, series_brands_map sbm WHERE sbm.brand = ? AND sbm.series = e.series LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    );
};

Dao.prototype.getEpisodesByBrandIds = async function(ids) {
    return await this.executeQuery(
        'SELECT e.* FROM episodes e, series_brands_map sbm WHERE sbm.brand IN (?) AND sbm.series = e.series AND e.enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getTotalEpisodesByCharityId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(*) AS total FROM series_charities_map csm, episodes e WHERE csm.series = e.series AND csm.charity = ?',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getEpisodesByCharityId = async function(id, offset, limit) {
    return await this.executeQuery(
        'SELECT e.* FROM episodes e, series_charities_map scm WHERE scm.charity = ? AND scm.series = e.series LIMIT ?, ?',
        [
            id,
            offset,
            limit
        ]
    );
};

Dao.prototype.getEpisodesByCharityIds = async function(ids) {
    return await this.executeQuery(
        'SELECT e.* FROM episodes e, series_charities_map sbm WHERE sbm.charity IN (?) AND sbm.series = e.series AND e.enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getTotalEpisodesByStarId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(*) AS total FROM stars_series_map csm, episodes e WHERE csm.series = e.series AND csm.star = ?',
        [
            id
        ]
    );
    return data[0].total;
};

Dao.prototype.getTotalEpisodesByStarIds = async function(ids) {
    return this.executeQuery(
        'SELECT star, COUNT(*) AS total FROM stars_series_map csm, episodes e WHERE csm.series = e.series AND csm.star IN (?) GROUP BY csm.star',
        [
            ids
        ]
    );
};

Dao.prototype.getEpisodesByStarIds = async function(ids) {
    return this.executeQuery(
        'SELECT e.*, csm.star FROM stars_series_map csm, episodes e WHERE csm.series = e.series AND csm.star IN (?) AND e.enabled = 1',
        [
            ids
        ]
    );
};


Dao.prototype.getEpisodesBySeriesId = async function(id) {
    return await this.executeQuery(
        'SELECT * FROM episodes WHERE series = ? ORDER BY episode ASC',
        [
            id
        ]
    );
};

Dao.prototype.getTotalEpisodesBySeriesId = async function(id) {
    let data = await this.executeQuery(
        'SELECT COUNT(*) AS total FROM episodes WHERE series = ?',
        [
            id
        ]
    );
    return data[0].total;
};

module.exports = new Dao();