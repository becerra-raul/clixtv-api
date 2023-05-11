let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.updateFavorite = async function(userId, entityId, type, date, enabled) {
    return await this.executeQuery(
        'INSERT INTO favorites SET ? ON DUPLICATE KEY UPDATE `updated_date` = VALUES(`updated_date`), `enabled` = VALUES(`enabled`)',
        {
            user_id: userId,
            entity_id: entityId,
            entity_type: type,
            added_date: date,
            updated_date: date,
            enabled: enabled
        }
    );
};

Dao.prototype.getUserFavoritesByType = async function(userId, type, offset, limit) {
    return await this.executeQuery(
        'SELECT * FROM favorites WHERE user_id = ? AND entity_type = ? AND enabled = 1 ORDER BY updated_date LIMIT ?, ?',
        [
            userId,
            type,
            offset,
            limit
        ]
    );
};

Dao.prototype.getUserFavoritesByIdsAndType = async function(userId, entityIds, type) {
    return await this.executeQuery(
        'SELECT * FROM favorites WHERE user_id = ? AND entity_id IN (?) AND entity_type = ? AND enabled = 1',
        [
            userId,
            entityIds,
            type
        ]
    );
};

Dao.prototype.getTotalUserFavoritesByType = async function(userId, type) {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM favorites WHERE user_id = ? AND entity_type = ? AND enabled = 1',
        [
            userId,
            type
        ]
    );
    return data[0].total;
};

Dao.prototype.getTotalFavoritesByIdAndType = async function(entityId, type) {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM favorites WHERE entity_id = ? AND entity_type = ? AND enabled = 1',
        [
            entityId,
            type
        ]
    );
    return data[0].total;
};

module.exports = new Dao();