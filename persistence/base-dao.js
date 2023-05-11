let q = require('q'),
    mysql = require('mysql'),
    apiUtils = require('../utils/api-utils'),
    mysqlConfigs = apiUtils.getMySqlConfig(),
    connectionPool = mysql.createPool({
        host: mysqlConfigs.host,
        user: mysqlConfigs.username,
        password: mysqlConfigs.password,
        database: mysqlConfigs.database
    });

function BaseDao() {

}

function _executeQuery(pool, query, values) {
    let deferred = q.defer();
    pool.getConnection(function onPoolConnection(error, connection) {
        if (error) {
            return deferred.reject(
                '\nError connecting to pool while running query...\n' + query + '\nError: ' + JSON.stringify(error)
            );
        }
        connection.query(query, values || [], function (error, rows) {
            connection.release();
            if (error) {
                return deferred.reject(error);
            }
            deferred.resolve(rows);
        });
    });
    return deferred.promise;
}

BaseDao.prototype.executeQuery = function(query, values) {
    if (!connectionPool) {
        throw new Error('No connection pool defined for query %s!', JSON.stringify(query));
    }
    return _executeQuery(connectionPool, query, values);
};

module.exports = BaseDao;