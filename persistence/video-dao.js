let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getVideoById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM videos WHERE id = ?',
        [
            id
        ]
    );
    return data[0];
};

module.exports = new Dao();