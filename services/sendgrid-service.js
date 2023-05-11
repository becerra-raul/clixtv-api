let fs = require('fs'),
    path = require('path'),
    juice = require('juice'),
    handlebars = require('handlebars'),
    apiUtils = require('../utils/api-utils'),
    sendGridConfigs = apiUtils.getSendGridConfig(),
    sendGrid = require('sendgrid')(sendGridConfigs.apikey),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    NotFoundErrorModel = require('../models/not-found-error-model');

function Service() {
    this.FROM_EMAIL = 'customerservice@clixtv.com';
    this.FROM_NAME = 'ClixTV Customer Service';
}

async function _sendRequest(method, endpoint, data) {
    let request = sendGrid.emptyRequest();
    request.method = method;
    request.path = endpoint;
    if (data) {
        request.body = data;
    }
    return new Promise((resolve, reject) => {
        sendGrid.API(request, function (error, response) {
            if (error || !(response.statusCode + '').startsWith('2')) {
                return reject(error || response);
            }
            resolve(response);
        })
    });
}

async function _sendPostRequest(endpoint, data) {
    return await _sendRequest('POST', endpoint, data);
}

async function _sendGetRequest(endpoint) {
    return await _sendRequest('GET', endpoint);
}

async function _sendEmail(toEmails, fromEmail, fromName, subject, body) {
    toEmails = (!(toEmails instanceof Array)) ? [toEmails] : toEmails;
    let request = sendGrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    to: toEmails.map((email) => {
                        return {
                            email: email
                        }
                    }),
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
                    value: juice(body)
                }
            ]
        }
    });
    return await sendGrid.API(request);
}

/**
 * Looks up a user in the recipients list by email
 *
 * @param {String} email Email address
 *
 * @returns {Object|Undefined} User object, or undefined if no user found
 */
Service.prototype.getUserByEmail = async function(email) {
    let data = await _sendPostRequest('/v3/contactdb/recipients/search', {
        conditions: [
            {
                field: 'email',
                value: email,
                operator: 'eq',
                'and_or': ''
            }
        ]
    });
    if (!data || !data.body || !data.body.recipients || data.body.recipients.length === 0) {
        return undefined;
    }
    return data.body.recipients[0];
};

Service.prototype.getTemplateById = async function(templateId) {
    return await _sendGetRequest('/v3/templates/' + templateId);
};

Service.prototype.sendWelcomeEmail = async function(email) {
    let template = await this.getTemplateById('7b8ae5b0-8512-4d42-abb2-e2bba97f4191');
    if (!template || !template.body || !template.body.versions || template.body.versions.length === 0) {
        throw new NotFoundErrorModel('Welcome email template not found');
    }
    template = template.body.versions[0];
    return _sendEmail(email, this.FROM_EMAIL, this.FROM_NAME, template.subject, template.html_content);
};

Service.prototype.sendEmail = async function(fromEmail, fromName, toEmail, subject, message) {
    return _sendEmail(toEmail, fromEmail, fromName, subject, message);
};

Service.prototype.sendResourceTemplateEmail = async function(fromEmail, fromName, toEmail, subject, templateName, data) {
    let template = fs.readFileSync(path.resolve(__dirname, 'resources', templateName), 'utf8');
    return await this.sendEmail(fromEmail, fromName, toEmail, subject, handlebars.compile(template)(data));
};

/**
 * Adds a new user to the recipients list in SendGrid and sends them a welcome email.
 *
 * @param {String} email Email address
 * @param {String} [firstName] First name
 * @param {String} [lastName] Last name
 *
 * @throws InvalidRequestErrorModel if email is not provided
 * @throws DuplicateEntryErrorModel if user already exists in recipients list
 *
 * @returns {Object} Success response
 */
Service.prototype.addUser = async function(email, firstName, lastName) {

    if (!email) {
        throw new InvalidRequestErrorModel('Email is required');
    }

    let user = await this.getUserByEmail(email);
    if (user) {
        throw new DuplicateEntryErrorModel('User already exists');
    }

    await Promise.all(
        [
            this.sendWelcomeEmail(email),
            _sendPostRequest('/v3/contactdb/recipients', [
                {
                    email: email,
                    first_name: firstName,
                    last_name: lastName
                }
            ])
        ]
    );
    return {
        success: true
    }
};

Service.prototype.searchUsers = async function(conditions) {
    return _sendPostRequest('/v3/contactdb/recipients/search', {
        conditions: conditions
    })
};



module.exports = new Service();