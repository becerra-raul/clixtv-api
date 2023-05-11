/**
 * @apiDefine UserSettingResponseModel
 *
 * @apiSuccess {Number} id ID of setting
 * @apiSuccess {String} type Type of setting
 * @apiSuccess {String} group Setting group
 * @apiSuccess {Boolean} enabled Whether or not the setting is enabled
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": 1,
 *                  "type": "OFFERS",
 *                  "group": "SETTINGS",
 *                  "enabled": true
 *              }
 */

function UserSettingResponseModel(data) {
    this.id = data.id;
    this.type = data.type;
    this.group = data.group;
    this.enabled = (data.enabled === 1);
}

module.exports = UserSettingResponseModel;