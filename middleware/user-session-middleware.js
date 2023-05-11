const UnAuthorizedError = require('../errors/unauthorized-error');
const jwt = require("jsonwebtoken");
const apiUtils = require('../utils/api-utils');
const jwtConfig = apiUtils.getJWTConfig();

module.exports = async function(request, response, next) {
    let token = request.headers['authorization'];
    if (token) {
        let tokenParts = token.split(' ');
        token = tokenParts[tokenParts.length - 1];
    }

    if (token) {
        try {            
            const payload = await jwt.verify(token, jwtConfig.secret);
            request.sessionUser = { ...payload, id: payload.userId };
        } catch (error) {
            console.error("authorization token err::", error);
            // return response.status(403).json(new UnAuthorizedError());
        }
    }
    next();
};