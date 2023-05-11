let jwt = require('jsonwebtoken'),
    apiUtils = require('../utils/api-utils'),
    jwtConfig = apiUtils.getJWTConfig(),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    ApplicationAuthenticationResponseModel = require('../models/response/application-authentication-response-model'),
    applicationDao = require('../persistence/application-dao');

function Service() {}

Service.prototype.authenticateApplication = async function(key, secret) {
    let application = await applicationDao.getApplicationByKeySecret(key, secret);
    if (!application) {
        throw new NotFoundErrorModel('No application found matching that key and secret.');
    }

    let token = jwt.sign({ key: key, secret: secret }, jwtConfig.secret, { expiresIn: '24h' });

    return new ApplicationAuthenticationResponseModel({
        token: token
    });
};

Service.prototype.getApplicationByToken = async function(token) {
    try {
        let request = jwt.verify(token, jwtConfig.secret);
        if (!request || !request.key || !request.secret) {
            return undefined;
        }
        return await applicationDao.getApplicationByKeySecret(request.key, request.secret);
    } catch (e) {
        return undefined;
    }
};

module.exports = new Service();