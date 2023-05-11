let q = require('q'),
    mysql = require('mysql'),
    apiUtils = require('../utils/api-utils'),
    mysqlConfigs = apiUtils.getSirqulProdMysqlSessionConfig(),
    connectionPool = mysql.createPool({
        host: mysqlConfigs.host,
        user: mysqlConfigs.username,
        password: mysqlConfigs.password,
        database: mysqlConfigs.database
    });

function SirqulSessionDao() {
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

SirqulSessionDao.prototype.executeQuery = function(query, values) {
    if (!connectionPool) {
        throw new Error('No connection pool defined for query %s!', JSON.stringify(query));
    }
    return _executeQuery(connectionPool, query, values);
};

SirqulSessionDao.prototype.addUserSession = async function(userId, sessionToken, expires) {
    return await this.executeQuery(
        'INSERT INTO users_sessions SET ?',
        {
            user_id: userId,
            session_token: sessionToken,
            expires: expires
        }
    );
};

SirqulSessionDao.prototype.getSessionByToken = async function(sessionToken) {
    let data = await this.executeQuery(
        'SELECT * FROM users_sessions WHERE session_token = ? LIMIT 1',
        [
            sessionToken
        ]
    );
    return data[0];
};


module.exports = new SirqulSessionDao();