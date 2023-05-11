const requestPromise = require("request-promise-native");
const util = require("util"),
  multer = require("multer"),
  BaseController = require("./base-controller"),
  userService = require("../services/user-service"),
  userSettingsService = require("../services/user-settings-service"),
  sendgridService = require("../services/sendgrid-service"),
  rankingService = require('../services/leaderboard-service'),
  NewsletterUserRequestModel = require("../models/request/newsletter-user-request-model"),
  ContactRequestModel = require("../models/request/contact-request-model"),
  UserRequestModel = require("../models/request/user-request-model"),
  SocialNetworkUserRequestModel = require("../models/request/social-network-user-request-model"),
  DuplicateEntryErrorModel = require("../models/duplicate-entry-error-model"),
  InvalidRequestErrorModel = require("../models/invalid-request-error-model");


function Controller(app) {
  if (!(this instanceof Controller)) {
    return new Controller(app);
  }
  BaseController.call(this, app, {
    path: "/users",
  });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function () {
  /**
   * @api {get} /id/:userid/session/:token Get user by session
   * @apiName GetUsersBySession
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Returns a user matching the provided user ID and session token
   *
   * @apiParam {String} userid User ID
   * @apiParam {String} token Session token
   *
   * @apiExample {curl} Example Usage
   *                  curl -i https://api.clixtv.com/v2.0/users/id/17/session/65cd96202fc9d80d775a5c24372fdf4b5a1a7757501719445fc6bee0a443eab8
   *
   * @apiUse UserResponseModel
   *
   * @apiError {String} error Error message if the user wasn't found
   */
  this.registerGetMethod("/id/:userid/session/:token", this.getSessionByTokenSirqul);
  this.registerGetMethod(
    "/sirqul/id/:userid/session/:token",
    this.getSessionByTokenSirqul
  );

  this.registerGetMethod("/id/:userid", this.getUserById);

  /**
   * @api {get} /id/:userid/settings Get user settings
   * @apiName GetSettingsByUserId
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Returns a list of user settings
   *
   * @apiHeader {String="Bearer :token"} Authorization Replace <code>:token</code> with authentication token
   *
   * @apiParam {String} userid User ID
   *
   * @apiExample {curl} Example Usage
   *                  curl -i https://api.clixtv.com/v2.0/users/id/17/settings
   *
   * @apiUse UserSettingListResponseModel
   *
   * @apiError {String} error Error message if the settings couldn't be retrieved
   */
  this.registerGetMethod("/id/:userid/settings", this.getSettingsByUserId);

  /**
   * @api {post} /users/ Add user
   * @apiName PostUsers
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Adds new user
   *
   * @apiParam {String} email Email address for the user
   * @apiParam {String} password Plain text password for the user
   * @apiParam {String} [firstName] User first name
   * @apiParam {String} [lastName] User last name
   *
   * @apiExample {js} Example usage:
   *                  {
   *                      email: "john.smith@example.com",
   *                      password: "clixtv001",
   *                      firstName: "John",
   *                      lastName: "Smith"
   *                  }
   *
   * @apiUse UserSessionResponseModel
   *
   * @apiError {String} error Error message if the user wasn't added
   */
  this.registerPostMethod("/", this.createAccount);
  this.registerPutMethod("/myprofile", this.updateProfile);
  this.registerPostMethod("/sirqul", this.addUserSirqul);

  /**
   * @api {post} /users/login Login user
   * @apiName PostUsersLogin
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Logs a new user in via email and password
   *
   * @apiParam {String} [email] Email address for the user
   * @apiParam {String} [password] Plain text password for the user
   *
   * @apiExample {js} Example usage:
   *                  {
   *                      email: "john.smith@example.com",
   *                      password: "clixtv001"
   *                  }
   *
   * @apiUse UserSessionResponseModel
   *
   * @apiError {String} error Error message if the user wasn't logged in
   */
  this.registerPostMethod("/login", this.loginUser);
  this.registerPostMethod("/sirqul/login", this.loginUserSirqul);
  this.registerPostMethod("/login/facebook", this.loginFacebookUser);
  this.registerPostMethod("/login/google", this.loginGoogleUser);
  this.registerPostMethod("/login/twitter", this.loginTwitterUser);

  /**
   * @api {post} /users/newsletter Add user to newsletter
   * @apiName PostUsersNewsletter
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Adds a user to the list to receive a newsletter
   *
   * @apiParam {String} email Email address for the user
   * @apiParam {String} firstName User first name
   * @apiParam {String} lastName User last name
   *
   * @apiExample {js} Example usage:
   *                  {
   *                      email: "john.smith@example.com",
   *                      firstName: "John",
   *                      lastName: "Smith"
   *                  }
   *
   * @apiSuccess {Boolean} success True if the user was added to the group successfully
   *
   * @apiError {String} error Error message if the user wasn't added to the newsletter group
   */
  this.registerPostMethod("/newsletter", this.addUserToNewsletter);

  /**
   * @api {post} /users/contact Send contact email
   * @apiName PostUsersContact
   * @apiGroup Users
   * @apiVersion 2.0.0
   *
   * @apiDescription Sends a contact email
   *
   * @apiParam {String} name User name
   * @apiParam {String} email User email address
   * @apiParam {String} phone User phone number
   * @apiParam {String} message Message
   *
   * @apiExample {js} Example usage:
   *                  {
   *                      name: "John Smith",
   *                      email: "john.smith@example.com",
   *                      phone: "0000000000",
   *                      message: "This is a message"
   *                  }
   *
   * @apiSuccess {Boolean} success True if the email was sent
   *
   * @apiError {String} error Error message if the email wasn't sent
   */
  this.registerPostMethod("/contact", this.sendContactEmail);
  this.registerPostMethod("/password/reset", this.resetPassword);
  this.registerPostMethod("/sirqul/password/reset", this.resetPasswordSirqul);
  this.registerPutMethod("/id/:userid", this.updateUser);
  this.registerPutMethod("/sirqul/id/:userid", this.updateUserSirqul);
  this.registerPutMethod("/password", this.updateUserPassword);
  this.registerPutMethod("/sirqul/password", this.updateUserPasswordSirqul);
  this.registerPutMethod("/setting", this.updateUserSetting);
  this.registerPostMethod("/:userid/upload/profile-image", this.uploadProfileImage);
  this.registerGetMethod("/:id", this.getMyProfileDetail);
  this.registerGetMethod('/handle/search', this.checkUserHandleAvaibility);
  this.registerGetMethod('/interests/list', this.getInterests);
};

Controller.prototype.getUserById = async function (request, response) {
  let userId = request.params.userid;
  try {
    let user = await userService.getUserById(userId);
    this.sendSuccess(response, user);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error getting user",
    });
  }
};

Controller.prototype.getSettingsByUserId = async function (request, response) {
  let userId = request.params.userid;

  if (!this.isAuthenticatedUser(request, userId)) {
    this.sendForbiddenError(response, {
      error: "Invalid permissions to get user settings",
    });
    return new Promise(() => { });
  }

  try {
    let user = await userSettingsService.getSettingsByUserId(userId);
    this.sendSuccess(response, user);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error getting user settings",
    });
  }
};

Controller.prototype.createAccount = async function (request, response) {
  this.handleRequest(request, response, async () => {
    const data = await userService.createAccount(request.body);
    this.sendSuccess(response, data);
  })
};

Controller.prototype.updateProfile = async function (request, response) {
  this.handleRequest(request, response, async () => {
    const curUser = this.getSessionUser(request);
    if(!request.body.userId) request.body.userId = curUser.id;
    const data = await userService.updateProfile(request.body);
    this.sendSuccess(response, data);
  })
};

Controller.prototype.addUserToNewsletter = async function (request, response) {
  let userRequestModel = new NewsletterUserRequestModel(request.body);
  try {
    let userAddResponse = await sendgridService.addUser(
      userRequestModel.email,
      userRequestModel.firstName,
      userRequestModel.lastName
    );
    this.sendSuccess(response, userAddResponse);
  } catch (e) {
    console.error(e);
    if (
      e instanceof DuplicateEntryErrorModel ||
      e instanceof InvalidRequestErrorModel
    ) {
      this.sendBadRequestError(response, {
        error: e.message,
      });
    } else {
      this.sendServerError(response, {
        error: "Error adding user to newsletter list",
      });
    }
  }
};

Controller.prototype.sendContactEmail = async function (request, response) {
  let model = new ContactRequestModel(request.body);
  const template = `Name: ${model.name}<br />Email Address: ${model.email}<br />Phone Number: ${model.phone}<br /><br />${model.message}`;
  try {
    await sendgridService.sendEmail(
      model.email,
      model.name,
      "info@clixtv.com",
      "Demo Site Contact Message",
      template
    );
    this.sendSuccess(response, { success: true });
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error sending contact email",
    });
  }
};

Controller.prototype.loginUser = async function (request, response) {
  this.handleRequest(request, response, async () => {
    const data = await userService.doLogin(request.body);
    this.sendSuccess(response, data);
  })
};

Controller.prototype.loginFacebookUser = async function (request, response) {
  let userRequestModel = new SocialNetworkUserRequestModel(request.body);

  try {
    let userLoginResponse = await userService.loginWithFacebook(
      userRequestModel.userId,
      userRequestModel.accessToken
    );
    this.sendSuccess(response, userLoginResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error logging in with Facebook",
    });
  }
};

Controller.prototype.loginGoogleUser = async function (request, response) {
  let userRequestModel = new SocialNetworkUserRequestModel(request.body);

  try {
    let userLoginResponse = await userService.loginWithGoogle(
      userRequestModel.userId,
      userRequestModel.accessToken
    );
    this.sendSuccess(response, userLoginResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error logging in with Google",
    });
  }
};

Controller.prototype.loginTwitterUser = async function (request, response) {
  let userRequestModel = new SocialNetworkUserRequestModel(request.body);

  try {
    let userLoginResponse = await userService.loginWithTwitter(
      userRequestModel.userId,
      userRequestModel.accessToken,
      userRequestModel.accessTokenSecret
    );
    this.sendSuccess(response, userLoginResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error logging in with Twitter",
    });
  }
};

Controller.prototype.resetPassword = async function (request, response) {
  let email = request.body.email;

  if (!email) {
    this.sendForbiddenError(response, {
      error: "Email is required",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userService.sendPasswordReset(email);
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error sending password reset",
    });
  }
};

Controller.prototype.updateUser = async function (request, response) {
  let userRequestModel = new UserRequestModel(request.body),
    userId = request.params.userid;

  if (!this.isAuthenticatedUser(request, userId)) {
    this.sendForbiddenError(response, {
      error: "Invalid permissions to update user",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userService.updateUserById(
      userId,
      userRequestModel
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    if (
      e instanceof DuplicateEntryErrorModel ||
      e instanceof InvalidRequestErrorModel
    ) {
      this.sendBadRequestError(response, {
        error: e.message,
      });
    } else {
      this.sendServerError(response, {
        error: "Error updating user",
      });
    }
  }
};

Controller.prototype.updateUserPassword = async function (request, response) {
  let email = request.body.email,
    code = request.body.code,
    password = request.body.password;

  try {
    let userResponse = await userService.updateUserPassword(
      email,
      code,
      password
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error updating password",
    });
  }
};

Controller.prototype.updateUserSetting = async function (request, response) {
  let userId = request.body.userId,
    settingId = request.body.settingId,
    enabled = request.body.enabled;

  if (!this.isAuthenticatedUser(request, userId)) {
    this.sendForbiddenError(response, {
      error: "Invalid permissions to get user settings",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userSettingsService.updateUserSetting(
      userId,
      settingId,
      enabled
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error updating user setting",
    });
  }
};

Controller.prototype.updateUserSetting = async function (request, response) {
  let userId = request.body.userId,
    settingId = request.body.settingId,
    enabled = request.body.enabled;

  if (!this.isAuthenticatedUser(request, userId)) {
    this.sendForbiddenError(response, {
      error: "Invalid permissions to get user settings",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userSettingsService.updateUserSetting(
      userId,
      settingId,
      enabled
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error updating user setting",
    });
  }
};

Controller.prototype.addUserSirqul = async function (request, response) {
  let userRequestModel = new UserRequestModel(request.body, true);
  try {
    let userAddResponse = await userService.addUserSirqul(userRequestModel);
    this.sendSuccess(response, userAddResponse);
  } catch (e) {
    console.error(e);
    if (
      e instanceof DuplicateEntryErrorModel ||
      e instanceof InvalidRequestErrorModel
    ) {
      this.sendBadRequestError(response, {
        error: e.message,
      });
    } else {
      this.sendServerError(response, {
        error: "Error adding user",
      });
    }
  }
};

Controller.prototype.loginUserSirqul = async function (request, response) {
  let userRequestModel = new UserRequestModel(request.body, true);

  try {
    let userLoginResponse = await userService.loginWithEmailPasswordSirqul(
      userRequestModel.email,
      userRequestModel.password
    );

    this.sendSuccess(response, userLoginResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error logging in",
    });
  }
};

Controller.prototype.getSessionByTokenSirqul = async function (
  request,
  response
) {
  try {
    let currentUser = { id: request.params.userid }, session = {};
    try {
      currentUser = this.getSessionUser(request);
    } catch (error) {
      session = await userService.createSessionForUser(currentUser.id);
    }
    const user = await userService.getSirqulUser(currentUser.id);
    this.sendSuccess(response, { ...user, ...session });
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error getting user",
    });
  }
};

Controller.prototype.updateUserSirqul = async function (request, response) {
  let userRequestModel = new UserRequestModel(request.body, true),
    userId = request.params.userid;

  if (!this.isAuthenticatedUser(request, userId)) {
    this.sendForbiddenError(response, {
      error: "Invalid permissions to update user",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userService.updateUserByIdSirqul(
      userId,
      userRequestModel
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    if (
      e instanceof DuplicateEntryErrorModel ||
      e instanceof InvalidRequestErrorModel
    ) {
      this.sendBadRequestError(response, {
        error: e.message,
      });
    } else {
      this.sendServerError(response, {
        error: "Error updating user",
      });
    }
  }
};

Controller.prototype.resetPasswordSirqul = async function (request, response) {
  let email = request.body.email,
    referer = request.body.referer;

  if (!email) {
    this.sendForbiddenError(response, {
      error: "Email is required",
    });
    return new Promise(() => { });
  }

  try {
    let userResponse = await userService.sendPasswordResetSirqul(
      email,
      referer
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error sending password reset",
    });
  }
};

Controller.prototype.updateUserPasswordSirqul = async function (request, response) {
  let email = request.body.email,
    code = request.body.code,
    password = request.body.password;

  try {
    let userResponse = await userService.updateUserPasswordSirqul(
      email,
      code,
      password
    );
    this.sendSuccess(response, userResponse);
  } catch (e) {
    console.error(e);
    this.sendServerError(response, {
      error: "Error updating password",
    });
  }
};

Controller.prototype.getMyProfileDetail = function (request, response) {
  this.handleRequest(request, response, async () => {
    const currentUser = this.getSessionUser(request);
    const results = await Promise.all([
      userService.getSirqulUser(currentUser.id, request.query),
      rankingService.getRankingResults({ userId: currentUser.id, limit: 1 })
    ]);
    const userInfo = results[0];
    userInfo.rank = results[1].data && results[1].data.userRank && results[1].data.userRank.rank;
    this.sendSuccess(response, userInfo);
  });
}

Controller.prototype.checkUserHandleAvaibility = function (request, response) {
  this.handleRequest(request, response, async () => {
    this.validatePayload(request.query, ['handle']);
    const result = await userService.checkUserHandleAvaibility(request.query);
    this.sendSuccess(response, result);
  })
}

Controller.prototype.getInterests = function (request, response) {
  this.handleRequest(request, response, async () => {
    // const result = await userService.getInterests(request.query);
    const jsonString = await requestPromise.get(request.query.dataUrl);
    const result = JSON.parse(jsonString);
    this.sendSuccess(response, result);
  });
}

// profile image storage and validation 
const upload = multer({
  storage: multer.diskStorage({
    filename: (_, file, cb) => {
      cb(null, Date.now() + "_" + file.originalname)
    }
  }),
  fileFilter: (_, file, cb) => {
    if (file.mimetype && file.mimetype.includes('image')) {
      cb(null, true)
    } else {
      cb(new Error("Only image file is acceptable."), false)
    }
  }
})
Controller.prototype.uploadProfileImage = async function (request, response) {
  try {
    const userId = request.params.userid;
    upload.any()(request, response, async (err) => {
      if (err) {
        this.sendBadRequestError(response, {
          message: err.message,
          valid: false,
        });
        return
      }
      const file = request.files[0]
      if (file) {
        const saveResult = await userService.addUserProfileImage(userId, file)
        this.sendSuccess(response, saveResult);
      } else {
        this.sendBadRequestError(response, {
          message: "Profile image is required.",
          valid: false,
        });
      }
    })
  } catch (e) {
    console.error("error occur in #uploadProfileImage::", e);
    this.sendServerError(response, {
      error: "Error occur while uploading profile image",
      valid: false
    });
  }
};


module.exports = Controller;
