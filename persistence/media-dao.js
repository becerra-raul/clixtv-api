let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.addIPAffiliate = async function(ipAddress, uniqueId) {
    return await this.executeQuery(
        'INSERT INTO ip_affiliate SET ?',
        {
            ip_address: ipAddress,
            unique_id: uniqueId
        }
    )
};

Dao.prototype.getAffiliateByIPAddress = async function(ipAddress) {
    let data = await this.executeQuery(
        'SELECT * FROM ip_affiliate WHERE ip_address = ?',
        [
            ipAddress
        ]
    );
    return data[0];
};

Dao.prototype.addTransformableMediaUrls = async function(urls) {
    return await this.executeQuery(
        'INSERT IGNORE INTO media_transformable (url) VALUES ?',
        [
            urls.map((url) => {
                return [url];
            })
        ]
    );
};

Dao.prototype.getTransformableMediaByUrl = async function(url) {
    let data = await this.executeQuery(
        'SELECT * FROM media_transformable WHERE url = ?',
        [
            url
        ]
    );
    return data[0];
};

Dao.prototype.getMediaTypes = async function() {
    return this.executeQuery(
        'SELECT * FROM media_types ORDER BY label ASC'
    )
};

Dao.prototype.getMediaTypeById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM media_types WHERE id = ?',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getMedia = async function(offset, limit) {
    return await this.executeQuery(
        'SELECT * FROM media ORDER BY updated_date DESC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    )
};

Dao.prototype.getMediaByIds = async function(ids) {
    return await this.executeQuery(
        'SELECT * FROM media WHERE id IN (?)',
        [
            ids
        ]
    )
};

Dao.prototype.getMediaById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM media WHERE id = ?',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getTotalMedia = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(*) as total FROM media'
    );
    return data[0].total;
};

Dao.prototype.addMedia = async function(type, path, sizes, resolutions) {
    return await this.executeQuery(
        'INSERT INTO media SET ?',
        {
            type: type,
            path: path,
            sizes: sizes.join(','),
            resolutions: resolutions.join(',')
        }
    )
};

module.exports = new Dao();