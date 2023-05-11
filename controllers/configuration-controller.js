let util = require('util'),
    BaseController = require('./base-controller'),
    configurationService = require('../services/configuration-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/configurations'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {get} /configurations/mobile Get mobile configurations
     * @apiName GetMobileConfigurations
     * @apiGroup Configurations
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns mobile configurations
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/configurations/mobile
     *
     * @apiUse ConfigurationListResponseModel
     *
     * @apiError {String} error Error message if no configurations were found
     */
    this.registerGetMethod('/mobile', this.getMobileConfigurations);

    /**
     * @api {get} /configurations/site Get site configurations
     * @apiName GetSiteConfigurations
     * @apiGroup Configurations
     * @apiVersion 2.0.0
     *
     * @apiDescription Returns site configurations
     *
     * @apiExample {curl} Example Usage
     *                  curl -i https://api.clixtv.com/v2.0/configurations/site
     *
     * @apiUse ConfigurationListResponseModel
     *
     * @apiError {String} error Error message if no configurations were found
     */
    this.registerGetMethod('/site', this.getSiteConfigurations);
};

Controller.prototype.getMobileConfigurations = async function(request, response) {
    try {
        let configurations = await configurationService.getMobileConfigurations();
        this.sendSuccess(response, configurations);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting mobile configurations'
        })
    }
};

Controller.prototype.getSiteConfigurations = async function(request, response) {
    try {
        let configurations = await configurationService.getSiteConfigurations();
        this.sendSuccess(response, configurations);
    } catch (e) {
        console.error(e);
        this.sendServerError(response, {
            error: 'Error getting site configurations'
        })
    }
};

module.exports = Controller;