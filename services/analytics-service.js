let sendGridService = require('./sendgrid-service'),
    AnalyticsSendGridUserListResponseModel = require('../models/response/analytics-sendgrid-user-list-response-model');

function Service() {}

Service.prototype.searchSendGridUsers = async function(conditions) {
    let response = await sendGridService.searchUsers(conditions);
    if (response && response.body && response.body.recipients) {
        return new AnalyticsSendGridUserListResponseModel(response.body.recipients);
    }
    return response;
};

module.exports = new Service();