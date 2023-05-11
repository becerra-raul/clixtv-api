let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.addPoints = async function(userId, pointsId, entityId, date) {
    return await this.executeQuery(
        'INSERT INTO points SET ?',
        {
            user_id: userId,
            points_id: pointsId,
            entity_id: entityId,
            earned_date: date
        }
    );
};

Dao.prototype.getTotalPointsForUser = async function(userId) {
    let data = await this.executeQuery(
        'SELECT SUM(pt.value) AS total FROM points p, points_types pt WHERE p.user_id = ? AND p.points_id = pt.id',
        [
            userId
        ]
    );
    return data[0].total;
};

module.exports = new Dao();