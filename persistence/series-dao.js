let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getSeriesById = async function(id) {
    return await this.executeQuery(
        'SELECT * FROM series WHERE id = ? AND enabled = 1',
        [
            id
        ]
    )[0];
};

Dao.prototype.getSeriesBySlug = async function(slug) {
    let series = await this.executeQuery(
        'SELECT * FROM series WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return series[0];
};

Dao.prototype.getSeriesByIds = async function(ids) {
    return await this.executeQuery(
        'SELECT * FROM series WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

Dao.prototype.getSeriesByEpisodeIds = async function(ids) {
    return await this.executeQuery(
        'SELECT s.* FROM series s, episodes e WHERE e.id IN (?) AND e.series = s.id AND s.enabled = 1',
        [
            ids
        ]
    )
};

Dao.prototype.getSeriesByStarId = async function(id) {
    return await this.executeQuery(
        'SELECT s.* FROM stars_series_map ssm, series s WHERE ssm.star = ? AND ssm.series = s.id AND s.enabled = 1 ORDER BY s.added_date DESC',
        [
            id
        ]
    )
};

Dao.prototype.getSeriesByStarIds = async function(ids) {
    return await this.executeQuery(
        'SELECT s.*, ssm.star from stars_series_map ssm, series s WHERE ssm.series = s.id AND ssm.star IN (?) AND s.enabled = 1',
        [
            ids
        ]
    )
};

module.exports = new Dao();