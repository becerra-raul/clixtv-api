/**
 * @apiDefine UserSessionResponseModel
 *
 * @apiSuccess {UserResponseModel} user User
 * @apiSuccess {Object} session Session
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "user": { ... },
 *                  "session": { ... }
 *              }
 */

function UserSessionResponseModel(data) {
    this.user = data.user;
    this.session = data.session;
}

module.exports = UserSessionResponseModel;