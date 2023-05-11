let util = require('util'),
    BaseController = require('./base-controller'),
    notificationService = require('../services/notification-service'),
    ContactNotificationRequestModel = require('../models/contact-notification-request-model'),
    ShareNotificationRequestModel = require('../models/request/share-notification-request-model');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/notifications'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {

    /**
     * @api {post} /notifications/contact Send site contact email
     * @apiName PostNotificationsContact
     * @apiGroup Notifications
     * @apiVersion 2.0.0
     *
     * @apiDescription Sends an email to a watched ClixTV email address for user help/information with the site.
     *
     * @apiParam {String="investor-relations","advertisers","jobs","press","news","affiliates","rewards","help"} [type="help"] Type of contact email to send (determines the final sending address)
     * @apiParam {String} name Name of the requesting user
     * @apiParam {String} email Email of the requesting user
     * @apiParam {String} subject Subject for the contact message
     * @apiParam {String} message Contact message
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      type: "affiliates",
     *                      name: "John Smith",
     *                      email: "john.smith@example.com",
     *                      subject: "Inquiry About ClixTV Affiliate Program",
     *                      message: "Is there a place on the site that I can learn more about your affiliate program?"
     *                  }
     *
     * @apiSuccess {Boolean} success True if the email was sent successfully, false otherwise.
     *
     * @apiError {String} error Error message if the email wasn't sent successfully.
     */
    this.registerPostMethod('/contact', this.sendContactNotification);

    /**
     * @api {post} /notifications/share Send share message
     * @apiName PostNotificationsShare
     * @apiGroup Notifications
     * @apiVersion 2.0.0
     *
     * @apiDescription Sends a share message to a list of email addresses.
     *
     * @apiParam {String="email"} type Type of share message to send
     * @apiParam {String[]} emailList List of email addresses to send to
     * @apiParam {String} fromEmail Email of the user sending the message
     * @apiParam {String} fromName Name of the user sending the message
     * @apiParam {String} message Message to send
     *
     * @apiExample {js} Example usage:
     *                  {
     *                      type: "email",
     *                      emailList: ["john.doe@example.com", "jane.doe@example.com"],
     *                      fromEmail: "john.smith@example.com",
     *                      fromName: "John Smith",
     *                      message: "Here's a video I thought you'd enjoy from #ClixTV - https://www.clixtv.com/video/some-video"
     *                  }
     *
     * @apiSuccess {Boolean} success True if the email was sent successfully, false otherwise.
     *
     * @apiError {String} error Error message if the email wasn't sent successfully.
     */
    this.registerPostMethod('/share', this.sendShareNotification);
};

Controller.prototype.sendContactNotification = async function(request, response) {
    let model = new ContactNotificationRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let data = await notificationService.sendContactNotification(model);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error sending contact notification'
        })
    }
};

Controller.prototype.sendShareNotification = async function(request, response) {
    let model = new ShareNotificationRequestModel(request.body),
        errorMessage = model.getErrorMessage();

    if (errorMessage) {
        this.sendBadRequestError(response, {
            error: errorMessage
        });
        return new Promise(() => {});
    }

    try {
        let data = await notificationService.sendShareNotification(model);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error sending share notification'
        })
    }
};

module.exports = Controller;