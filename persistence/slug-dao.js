let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.getBySlug = async function(slug, type) {
    let data = await this.executeQuery(
        'SELECT * FROM slug_id_map WHERE entity_slug = ? AND type = ?',
        [
            slug,
            type
        ]
    );
    return data[0];
};

Dao.prototype.addSlugMap = async function(slug, id, type) {
    return this.executeQuery(
        'INSERT INTO slug_id_map SET ?',
        {
            entity_slug: slug,
            entity_id: id,
            type: type
        }
    )
};

module.exports = new Dao();