let fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    apiUtils = require('../utils/api-utils'),
    sendGridConfigs = apiUtils.getSendGridConfig(),
    sendGrid = require('sendgrid')(sendGridConfigs.apikey),
    sendGridService = require('./sendgrid-service');

function Service() {}

function _getToEmailByType(type) {
    switch (type) {
        case 'investor-relations':
        case 'advertisers':
        case 'jobs':
        case 'press':
        case 'news':
        case 'affiliates':
        case 'rewards':
        case 'help':
        default:
            return 'customerservice@clixtv.com';
    }
}

async function _sendEmail(toEmail, fromEmail, fromName, subject, body) {
    let request = sendGrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    to: [
                        {
                            email: toEmail
                        }
                    ],
                    subject: subject
                }
            ],
            from: {
                email: fromEmail,
                name: fromName
            },
            content: [
                {
                    type: 'text/html',
                    value: body
                }
            ]
        }
    });
    return await sendGrid.API(request);
}

Service.prototype.sendContactNotification = async function(model) {
    let email = _getToEmailByType(model.type),
        template = fs.readFileSync(path.resolve(__dirname, 'resources', 'contact-notification-template.html'), 'utf8'),
        response = await _sendEmail(email, model.email, model.name, 'ClixTV Contact Request Message', handlebars.compile(template)(model));

    if (!response || !(response.statusCode + '').startsWith('2')) {
        return {
            success: false
        }
    }

    return {
        success: true
    };
};

Service.prototype.sendShareNotification = async function(model) {
    await sendGridService.sendEmail(model.fromEmail, model.fromName, model.emailList, 'I Thought You\'d Like This!', '<p>' + model.message + '</p>');
    return {
        success: true
    }
};

module.exports = new Service();