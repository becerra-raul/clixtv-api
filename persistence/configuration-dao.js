let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.addConfiguration = async function(key, value, type, date) {
    return await this.executeQuery(
        'INSERT INTO configurations SET ? ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `modified_date` = VALUES(`modified_date`)',
        {
            key: key,
            value: value,
            type: type,
            create_date: date,
            modified_date: date
        }
    );
};

Dao.prototype.getConfigurations = async function(type) {
    return this.executeQuery(
        'SELECT * FROM configurations WHERE type = ?',
        [
            type
        ]
    );
};

module.exports = new Dao();