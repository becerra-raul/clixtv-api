let util = require('util'),
    BaseController = require('./base-controller'),
    applicationService = require('../services/application-service'),
    ApplicationAuthenticationRequestModel = require('../models/request/application-authentication-request-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/applications'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {post} /applications/authenticate Authenticate application
     * @apiName PostApplicationsAuthenticate
     * @apiGroup Applications
     * @apiVersion 2.0.0
     *
     * @apiDescription Authenticates an application via key and secret (provided by ClixTV), and returns a short-lived token to make elevated calls
     *
     * @apiParam {String} key API key
     * @apiParam {String} secret API secret
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      key: "XXXXXXXXXXXXX",
     *                      secret: "XXXXXXXXXXXXX"
     *                  }
     *
     * @apiSuccess {Boolean} token API token
     *
     * @apiError {String} error Error message if the token wasn't generated successfully
     */
    this.registerPostMethod('/authenticate', this.authenticateApplication);
};

Controller.prototype.authenticateApplication = async function(request, response) {
    let model = new ApplicationAuthenticationRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let data = await applicationService.authenticateApplication(model.key, model.secret);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error authenticating application'
        })
    }
};

module.exports = Controller;