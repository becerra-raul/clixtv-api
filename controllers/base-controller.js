const UnAuthorizedError = require('../errors/unauthorized-error');
const ValidationError = require('../errors/validation-error');

let apiUtils = require('../utils/api-utils'),
    environment = apiUtils.getEnvironment();

function BaseController(app, options) {
    this.app = app;
    this.options = (options instanceof Object) ? options : {};
}

function _sendResponse(code, data, response) {
    response.setHeader('Content-Type', 'application/json');
    response.status(code).send(JSON.stringify(data));
}

function _sendImage(data, response) {
    response.writeHead(200, { 'Content-Type': 'image/jpg' });
    response.end(data, 'binary');
}

BaseController.prototype._registerMethod = function (method, endpoint, callback, options) {
    let _this = this;
    options = (options instanceof Object) ? options : {};
    this.app[method](this.options.path + endpoint, function (request, response) {
        callback.call(_this, request, response);
    });
};

/**
 * Registers a new GET method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerGetMethod = function (endpoint, callback, options) {
    this._registerMethod('get', endpoint, callback, options);
};

/**
 * Registers a new POST method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerPostMethod = function (endpoint, callback, options) {
    this._registerMethod('post', endpoint, callback, options);
};

/**
 * Registers a new PUT method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerPutMethod = function (endpoint, callback, options) {
    this._registerMethod('put', endpoint, callback, options);
};

/**
 * Registers a new DELETE method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerDeleteMethod = function (endpoint, callback, options) {
    this._registerMethod('delete', endpoint, callback, options);
};

/**
 * Returns data in a JSON response
 *
 * @public
 * @param   {Response}      response        Express response object
 * @param   {Object}        data            Data to send
 */
BaseController.prototype.sendSuccess = function (response, data) {
    _sendResponse(200, data || {}, response);
};

BaseController.prototype.sendImageSuccess = function (response, data) {
    _sendImage(data, response);
};

BaseController.prototype.sendCreatedSuccess = function (response, data) {
    _sendResponse(201, data || {
        created: true
    }, response);
};

BaseController.prototype.sendServerError = function (response, data) {
    _sendResponse(500, data || {}, response);
};

BaseController.prototype.sendNotFoundError = function (response, data) {
    _sendResponse(404, data || {}, response);
};

BaseController.prototype.sendBadRequestError = function (response, data) {
    _sendResponse(400, data || {}, response);
};

BaseController.prototype.sendForbiddenError = function (response, data) {
    _sendResponse(403, data || {}, response);
};

/**
 * Returns boolean value of whether or not the session user ID matches the provided user ID
 *
 * @param   {Object}        request     Request object
 * @param   {String|Number} userId      User ID to test
 * @returns {boolean}
 */
BaseController.prototype.isAuthenticatedUser = function (request, userId) {

    // Local environment is always authenticated
    if (environment === 'local') {
        return true;
    }
    if (!request || !request.sessionUser) {
        return false;
    }
    return (request.sessionUser.id + '') === (userId + '');
};

/**
 * 
 * @param {object} response 
 * @param {object} payload 
 * @param {string[]} requiredProps 
 * @returns {boolean}
 */
BaseController.prototype.validatePayload = function (payload, requiredProps = []) {
    const missingProps = [];
    try {
        for (const prop of requiredProps) {
            const value = payload[prop];
            if (value === undefined || value === null || (typeof value === 'string' && !value) || (typeof value === 'object' && Object.keys(value).length < 1)) {
                missingProps.push(prop);
            }
        }
    } catch (error) {
        console.error("error occur in validatePayload::", error);
    }
    if (missingProps.length > 0) {
        throw new ValidationError(missingProps.join(', ') + "are required!");
    }
};

/**
 * 
 * @param {object} request 
 * @returns {object} logged user info
 */
BaseController.prototype.getSessionUser = function (request) {
    // if (environment !== 'local') {        
    // }
    if (!request.sessionUser) {
        throw new UnAuthorizedError();
    }
    return request.sessionUser;
}

/**
 * Abstract method to register all methods for the controller
 *
 * @protected
 */
BaseController.prototype.registerAllMethods = function () { };

/**
 * 
 * @param {object} request 
 * @param {object} response 
 * @param {Function} handleFun 
 * @returns 
 */
BaseController.prototype.handleRequest = async function (request, response, handleFun) {
    try {
        return await handleFun();
    } catch (e) {
        console.log('request payload is::', request.query, request.body);
        console.error('error occur at ' + request.path + '::', e);
        if (e.name === UnAuthorizedError.name) {
            this.sendForbiddenError(response, { error: e.message });
        } else if (e.name === ValidationError.name) {
            this.sendBadRequestError(response, { error: e.message });
        } else {
            this.sendServerError(response, {
                error: 'Unexpected error occur!'
            });
        }
    }
}
/**
 * Initializes the controller and sets up all endpoints
 *
 * @public
 * @throws  {Error}         If no path parameter has been set
 */
BaseController.prototype.init = function () {
    if (typeof this.options.path !== 'string') {
        throw new Error('No path defined to start service!');
    }
    this.registerAllMethods();
};

module.exports = BaseController;