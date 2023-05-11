let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

/**
 * Adds a new category
 *
 * @param {String} title Category title
 * @param {String} slug Category slug
 * @returns {Promise.<Object>}
 */
Dao.prototype.addCategory = async function(title, slug) {
    return await this.executeQuery(
        'INSERT INTO categories SET ?',
        {
            title: title,
            slug: slug
        }
    )
};

/**
 * Update a category matching the provided ID
 *
 * @param {Number} id Category ID
 * @param {Object} model Category model
 * @returns {Promise.<Object>}
 */
Dao.prototype.updateCategoryById = async function(id, model) {
    return await this.executeQuery(
        'UPDATE categories SET ? WHERE id = ?',
        [
            model,
            id
        ]
    )
};

/**
 * Returns the total number of categories
 *
 * @returns {Promise.<Number>}
 */
Dao.prototype.getTotalCategories = async function() {
    let data = await this.executeQuery(
        'SELECT COUNT(id) AS total FROM categories WHERE enabled = 1'
    );
    return data[0].total;
};

/**
 * Returns the list of categories
 *
 * @param {Number} offset Return offset
 * @param {Number} limit Return limit
 */
Dao.prototype.getCategories = function(offset, limit) {
    return this.executeQuery(
        'SELECT * FROM categories WHERE enabled = 1 ORDER BY `order` ASC LIMIT ?, ?',
        [
            offset,
            limit
        ]
    );
};

/**
 * Return the category matching the provided slug
 *
 * @param {String} slug Category slug
 * @returns {Promise.<Object>}
 */
Dao.prototype.getCategoryBySlug = async function(slug) {
    let data = await this.executeQuery(
        'SELECT * FROM categories WHERE slug = ? AND enabled = 1',
        [
            slug
        ]
    );
    return data[0];
};

/**
 * Return the category matching the provided ID
 *
 * @param {Number} id Category ID
 * @returns {Promise.<Object>}
 */
Dao.prototype.getCategoryById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM categories WHERE id = ? AND enabled = 1',
        [
            id
        ]
    );
    return data[0];
};

/**
 * Return the category matching the provided IDs
 *
 * @param {Number[]} ids Category IDs
 * @returns {Promise.<Object[]>}
 */
Dao.prototype.getCategoryByIds = async function(ids) {
    return await this.executeQuery(
        'SELECT * FROM categories WHERE id IN (?) AND enabled = 1',
        [
            ids
        ]
    );
};

module.exports = new Dao();