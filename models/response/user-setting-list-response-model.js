let UserSettingResponseModel = require('./user-setting-response-model');

/**
 * @apiDefine UserSettingListResponseModel
 *
 * @apiSuccess {Number} total Total settings available
 * @apiSuccess {UserSettingResponseModel[]} settings List of settings
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 11,
 *                  "settings": [
 *                      {
 *                          "id": 1,
 *                          "type": "OFFERS",
 *                          "group": "SETTINGS",
 *                          "enabled": true
 *                      },
 *                      {
 *                          "id": 2,
 *                          "type": "VIDEOS",
 *                          "group": "SETTINGS",
 *                          "enabled": true
 *                      },
 *                      ...
 *                  ]
 *              }
 */
function UserSettingListResponseModel(total, settings) {
    this.total = total;
    this.settings = settings.map((setting) => {
        return new UserSettingResponseModel(setting);
    })
}

module.exports = UserSettingListResponseModel;