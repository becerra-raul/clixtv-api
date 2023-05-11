let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getApplicationByKeySecret = async function(key, secret) {
    let data = await this.executeQuery(
        'SELECT a.* FROM applications a, applications_tokens `at` WHERE `at`.key = ? AND `at`.secret = ? AND `at`.application = `a`.id',
        [
            key,
            secret
        ]
    );
    return data[0];
};

module.exports = new Dao();