let userSettingDao = require('../persistence/user-setting-dao'),
    UserSettingListResponseModel = require('../models/response/user-setting-list-response-model');

function Service() {}

Service.prototype.getSettingsByUserId = async function(userId) {
    let settings = await userSettingDao.getSettingsByUserId(userId);
    return new UserSettingListResponseModel(settings.length, settings);
};

Service.prototype.updateUserSetting = async function(userId, settingId, enabled) {
    await userSettingDao.updateUserSetting(userId, settingId, enabled, new Date());
    return {
        success: true
    }
};

module.exports = new Service();