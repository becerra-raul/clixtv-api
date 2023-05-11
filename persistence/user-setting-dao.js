let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getSettingsByUserId = async function(userId) {
    return await this.executeQuery(
        'SELECT usm.*, IFNULL((SELECT enabled FROM users_settings WHERE user_id = ? AND setting = usm.id), true) AS enabled FROM users_settings_map usm LEFT JOIN users_settings us ON us.setting = usm.id GROUP BY usm.id',
        [
            userId
        ]
    )
};

Dao.prototype.updateUserSetting = async function(userId, settingId, enabled, date) {
    return await this.executeQuery(
        'INSERT INTO users_settings SET ? ON DUPLICATE KEY UPDATE `enabled` = VALUES(`enabled`), `updated_date` = VALUES(`updated_date`)',
        {
            user_id: userId,
            setting: settingId,
            enabled: enabled,
            updated_date: date
        }
    )
};

module.exports = new Dao();