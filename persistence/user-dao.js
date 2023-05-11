let util = require('util'),
    BaseDao = require('./base-dao');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.addUser = async function(email, firstName, lastName, date) {
    let params = {
        email: email,
        created_date: date,
        updated_date: date
    };
    if (firstName) {
        params.first_name = firstName;
    }
    if (lastName) {
        params.last_name = lastName;
    }
    return await this.executeQuery(
        'INSERT INTO users SET ?',
        params
    )
};

Dao.prototype.addUserMedia = async function(userId, path, type, date) {
    return await this.executeQuery(
        'INSERT INTO users_media SET ?',
        {
            user_id: userId,
            path: path,
            type: type,
            created_date: date,
            updated_date: date
        }
    )
};

Dao.prototype.getUserMedia = async function(userId, type) {
    return await this.executeQuery(
        'SELECT * FROM users_media WHERE user_id = ? AND type = ?',
        [
            userId,
            type
        ]
    )
};

Dao.prototype.getUserMediaById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM users_media WHERE id = ?',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.updateUserMediaById = async function(id, path, date) {
    return await this.executeQuery(
        'UPDATE users_media SET path = ?, updated_date = ? WHERE id = ?',
        [
            path,
            date,
            id
        ]
    )
};

Dao.prototype.updateUser = async function(id, user, date) {
    let params = {
        updated_date: date
    };
    if (user.email) {
        params.email = user.email;
    }
    if (user.firstName) {
        params.first_name = user.firstName;
    }
    if (user.lastName) {
        params.last_name = user.lastName;
    }
    if (user.birthdate) {
        params.birthdate = user.birthdate;
    }
    if (user.gender) {
        params.gender = user.gender;
    }
    if (user.phone) {
        params.phone = user.phone;
    }

    return await this.executeQuery(
        'UPDATE users SET ? WHERE id = ?',
        [
            params,
            id
        ]
    )
};

Dao.prototype.addAuthenticationHash = async function(userId, hash) {
    return await this.executeQuery(
        'INSERT INTO users_authentication SET ? ON DUPLICATE KEY UPDATE `hash` = VALUES(`hash`)',
        {
            user_id: userId,
            hash: hash
        }
    );
};

Dao.prototype.getAuthenticationHashByUserId = async function(userId) {
    let data = await this.executeQuery(
        'SELECT * FROM users_authentication WHERE user_id = ?',
        [
            userId
        ]
    );
    return data[0];
};

Dao.prototype.getUserById = async function(id) {
    let data = await this.executeQuery(
        'SELECT * FROM users WHERE id = ?',
        [
            id
        ]
    );
    return data[0];
};

Dao.prototype.getUserByEmail = async function(email) {
    let data = await this.executeQuery(
        'SELECT * FROM users WHERE email = ?',
        [
            email
        ]
    );
    return data[0];
};

Dao.prototype.addUserSession = async function(userId, sessionToken, expires) {
    return await this.executeQuery(
        'INSERT INTO users_sessions SET ?',
        {
            user_id: userId,
            session_token: sessionToken,
            expires: expires
        }
    );
};

Dao.prototype.getSessionByToken = async function(sessionToken) {
    let data = await this.executeQuery(
        'SELECT * FROM users_sessions WHERE session_token = ? LIMIT 1',
        [
            sessionToken
        ]
    );
    return data[0];
};

Dao.prototype.addUserPasswordResetCode = async function(userId, code, expires) {
    return await this.executeQuery(
        'INSERT INTO users_password_reset_codes SET ? ON DUPLICATE KEY UPDATE `code` = VALUES(`code`), `expires_date` = VALUES(`expires_date`), `enabled` = VALUES(`enabled`)',
        {
            user_id: userId,
            code: code,
            expires_date: expires,
            enabled: true
        }
    );
};

Dao.prototype.getPasswordResetByCode = async function(code) {
    let data = await this.executeQuery(
        'SELECT * FROM users_password_reset_codes WHERE code = ? AND enabled = 1',
        [
            code
        ]
    );
    return data[0];
};

Dao.prototype.removeUserPasswordResetById = async function(id) {
    let data = await this.executeQuery(
        'UPDATE users_password_reset_codes SET ? WHERE id = ?',
        [
            {
                enabled: false
            },
            id
        ]
    );
    return data[0];
};

module.exports = new Dao();