let applicationService = require('../services/application-service');

module.exports = async function(request, response, next) {
    let token = request.headers['authorization'];
    if (token) {
        let tokenParts = token.split(' ');
        token = tokenParts[tokenParts.length - 1];
    }
    if (token) {
        let application = await applicationService.getApplicationByToken(token);
        if (application && application.accesslevels) {
            request.accessLevels = application.accesslevels.split(',');
        }
    }
    if (!request.accessLevels) {
        request.accessLevels = [];
    }
    next();
};