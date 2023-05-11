let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getTagsBySeriesIds = async function(ids) {
    return await this.executeQuery(
        'SELECT t.*, tsm.series FROM tags t, tags_series_map tsm WHERE tsm.tag = t.id AND tsm.series IN (?)',
        [
            ids
        ]
    )
};

module.exports = new Dao();