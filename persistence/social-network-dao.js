let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getUserBySocialNetworkId = async function(userId, type) {
    let data = await this.executeQuery(
        'SELECT * FROM users_social_networks WHERE social_user_id = ? AND social_type = ?',
        [
            userId,
            type
        ]
    );
    return data[0];
};

Dao.prototype.addSocialNetworkUser = async function(userId, accessToken, socialNetworkId, type, date) {
    return await this.executeQuery(
        'INSERT INTO users_social_networks SET ? ON DUPLICATE KEY UPDATE `access_token` = VALUES(`access_token`), `updated_date` = VALUES(`updated_date`)',
        {
            user_id: userId,
            access_token: accessToken,
            social_user_id: socialNetworkId,
            social_type: type,
            added_date: date,
            updated_date: date
        }
    )
};

module.exports = new Dao();