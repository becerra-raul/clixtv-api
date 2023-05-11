let pointsDao = require('../persistence/points-dao'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model');

function Service() {}

Service.prototype.addPoints = async function(userId, type, entityId) {
    try {
        await pointsDao.addPoints(userId, type, entityId, new Date());
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('User has already earned points');
        }
        throw e;
    }
    return {
        success: true
    }
};

Service.prototype.getPointsForUser = async function(userId) {
    let data = await Promise.all(
        [
            pointsDao.getTotalPointsForUser(userId)
        ]
    );
    return {
        total: data[0] || 0
    }
};

module.exports = new Service();