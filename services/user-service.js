let jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    moment = require('moment'),
    fs = require("fs"),
    path = require("path"),
    stringUtils = require('../utils/string-utils'),
    userDao = require('../persistence/user-dao'),
    socialNetworkDao = require('../persistence/social-network-dao'),
    socialNetworkService = require('./social-network-service'),
    mediaService = require('./media-service'),
    sendgridService = require('./sendgrid-service'),
    sirqulService = require('./sirqul-service'),
    DuplicateEntryErrorModel = require('../models/duplicate-entry-error-model'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    UserSessionResponseModel = require('../models/response/user-session-response-model'),
    UserResponseModel = require('../models/response/user-response-model'),
    UserModel = require('../models/user-model'),
    socialNetworkEnum = require('../models/enum/social-network-enum'),
    userMediaEnum = require('../models/enum/user-media-enum');
const ApiResponseModel = require('../models/api-response-model');
const { getProfileResponseFilters } = require('../models/enum/api-query-enum');
const apiUtils = require('../utils/api-utils');
const jwtConfig = apiUtils.getJWTConfig();

function Service() {}

async function _createSessionForUser(userId) {
    try {
        const sessionExpires = moment().add(365, 'days').toDate();
        const sessionToken = await jwt.sign({ userId }, jwtConfig.secret, { expiresIn: '365d', subject: userId.toString() });
        return {
            token: sessionToken,
            expire: sessionExpires
        }
    } catch (error) {
        console.error("failed to create session:: ", error);
    }
}

Service.prototype.addUser = async function(email, password, firstName, lastName) {
    if (!email) {
        throw new InvalidRequestErrorModel('Email is required');
    }
    try {
        let userAddResponse = await userDao.addUser(email, firstName, lastName, new Date()),
            user = await userDao.getUserById(userAddResponse.insertId);

        // A password can be undefined if the user is signed up
        // with a social network
        if (password) {
            let passwordHash = bcrypt.hashSync(password, 10);
            await userDao.addAuthenticationHash(user.id, passwordHash);
        }

        let session = await _createSessionForUser(user.id);

        return new UserSessionResponseModel({
            user: new UserResponseModel(user),
            session: session
        });

    } catch (e) {
        if (e.code && e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A user already exists with that email');
        }
        throw e;
    }
};

Service.prototype.updateUserById = async function(userId, user) {
    if (!user.email) {
        throw new InvalidRequestErrorModel('Email is required');
    }

    try {
        await userDao.updateUser(userId, user, new Date());
        return await this.getUserById(userId);
    } catch (e) {
        if (e.code && e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A user already exists with that email');
        }
        throw e;
    }
};

Service.prototype.addUserAvatarPath = async function(userId, path) {
    let existingAvatar = await userDao.getUserMedia(userId, userMediaEnum.types.AVATAR);

    path = path + ((path.indexOf('?') === -1) ? '?' : '&') + 't=' + new Date().getTime();

    if (existingAvatar && existingAvatar.length > 0) {
        await userDao.updateUserMediaById(existingAvatar[0].id, path, new Date());
    } else {
        await userDao.addUserMedia(userId, path, userMediaEnum.types.AVATAR, new Date());
    }
    return {
        success: true
    }
};

Service.prototype.loginWithEmailPassword = async function(email, password) {

    let user, existingUserHash;

    if (!email) {
        throw new Error('Email is required');
    }

    if (!password) {
        throw new Error('Password is required');
    }

    user = await userDao.getUserByEmail(email);
    if (!user) {
        throw new NotFoundErrorModel('No user found');
    }

    existingUserHash = await userDao.getAuthenticationHashByUserId(user.id);
    if (!existingUserHash) {
        throw new NotFoundErrorModel('No password found for user');
    }

    if (!bcrypt.compareSync(password, existingUserHash.hash)) {
        throw new NotFoundErrorModel('Invalid login credentials');
    }

    let session = await _createSessionForUser(user.id);

    let avatar = await userDao.getUserMedia(user.id, userMediaEnum.types.AVATAR);
    if (avatar && avatar.length > 0) {
        user.avatar = avatar[0].path;
    }

    return new UserSessionResponseModel({
        user: new UserResponseModel(user),
        session: session
    });
};

Service.prototype.loginWithSocialNetwork = async function(userId, accessToken, accessTokenSecret, type) {
    let authenticatedUser;
    switch (type) {
        case socialNetworkEnum.types.FACEBOOK:
            authenticatedUser = await socialNetworkService.getAuthenticatedFacebookUser(userId, accessToken);
            break;

        case socialNetworkEnum.types.GOOGLE:
            authenticatedUser = await socialNetworkService.getAuthenticatedGoogleUser(userId, accessToken);
            break;

        case socialNetworkEnum.types.TWITTER:
            authenticatedUser = await socialNetworkService.getAuthenticatedTwitterUser(userId, accessToken, accessTokenSecret);
            break;

        default:
            throw new InvalidRequestErrorModel('Invalid social network type provided to log in: ' + type);
    }
    if (!authenticatedUser) {
        throw new Error('Error authenticating social network user');
    }

    let user,
        socialNetworkUser = await socialNetworkDao.getUserBySocialNetworkId(userId, type);

    // If there's no linked social network user found, create a new one.
    if (!socialNetworkUser) {
        try {
            let newUserSession = await this.addUser(authenticatedUser.email, undefined, authenticatedUser.firstName, authenticatedUser.lastName, new Date());

            try {
                let avatar = await mediaService.saveImageFromUrl(authenticatedUser.avatar);
                await this.addUserAvatarPath(newUserSession.user.id, avatar);
            } catch (e) {
                console.warn('Error saving avatar', e);
            }

            if (newUserSession && newUserSession.user) {
                user = await this.getUserById(newUserSession.user.id);
            }

        } catch (e) {

            // If a user already exists with that email, look up the user
            // to be linked up later.
            if (e instanceof DuplicateEntryErrorModel) {
                user = await this.getUserByEmail(authenticatedUser.email);
            }
        }
    } else {
        user = await this.getUserById(socialNetworkUser.user_id);
    }

    if (!user || !user.id) {
        throw new Error('Error adding user for social network');
    }

    if (!user.avatar && authenticatedUser.avatar) {
        let avatar = await mediaService.saveImageFromUrl(authenticatedUser.avatar);
        await this.addUserAvatarPath(user.id, avatar);
        user = await this.getUserById(user.id);
    }

    await socialNetworkDao.addSocialNetworkUser(user.id, authenticatedUser.accessToken, userId, type, new Date());

    let session = await _createSessionForUser(user.id);

    return new UserSessionResponseModel({
        user: user,
        session: session
    });

};

Service.prototype.loginWithFacebook = async function(userId, accessToken) {
    return this.loginWithSocialNetwork(userId, accessToken, null, socialNetworkEnum.types.FACEBOOK);
};

Service.prototype.loginWithGoogle = async function(userId, accessToken) {
    return this.loginWithSocialNetwork(userId, accessToken, null, socialNetworkEnum.types.GOOGLE);
};

Service.prototype.loginWithTwitter = async function(userId, accessToken, accessTokenSecret) {
    return this.loginWithSocialNetwork(userId, accessToken, accessTokenSecret, socialNetworkEnum.types.TWITTER);
};

Service.prototype.getUserById = async function(id) {
    let user = await userDao.getUserById(id);
    if (!user) {
        throw new NotFoundErrorModel('No user found');
    }

    let avatar = await userDao.getUserMedia(user.id, userMediaEnum.types.AVATAR);
    if (avatar && avatar.length > 0) {
        user.avatar = avatar[0].path;
    }

    return new UserResponseModel(user);
};

Service.prototype.getUserByEmail = async function(email) {
    let user = await userDao.getUserByEmail(email);
    if (!user) {
        throw new NotFoundErrorModel('No user found');
    }
    return this.getUserById(user.id);
};

Service.prototype.getUserBySessionToken = async function(token) {
    let session = await userDao.getSessionByToken(token);
    if (session && moment(session.expires).isAfter(moment())) {
        try {
            return await this.getUserById(session.user_id);
        } catch (e) {
            return undefined;
        }
    }
    return undefined;
};

Service.prototype.sendPasswordReset = async function(email) {
    let code = stringUtils.getRandomToken(6),
        user = await this.getUserByEmail(email);

    // Even if there's no user found, return a success but don't send
    // a message for security so people can't keep trying different email
    // addresses until one sticks
    if (!user) {
        return {
            success: true
        }
    }

    await userDao.addUserPasswordResetCode(user.id, code, moment().add(10, 'minutes').toDate());

    await sendgridService.sendResourceTemplateEmail(
        sendgridService.FROM_EMAIL,
        sendgridService.FROM_NAME,
        email,
        'Reset your ClixTV password!',
        'forgot-password-template.html',
        {
            code: code,
            email: email
        }
    );

    return {
        success: true
    }
};

Service.prototype.updateUserPassword = async function(email, code, password) {
    if (!email || !code || !password) {
        throw new InvalidRequestErrorModel('Email, code, and password are required');
    }
    let data = await Promise.all(
        [
            this.getUserByEmail(email),
            userDao.getPasswordResetByCode(code)
        ]
    );
    if (!data[0] || !data[1]) {
        throw new NotFoundErrorModel('No valid password reset found');
    }

    await userDao.removeUserPasswordResetById(data[1].id);

    if (moment(data[1].expires_date).isBefore(moment())) {
        throw new NotFoundErrorModel('No valid password reset found');
    }

    let passwordHash = bcrypt.hashSync(password, 10);
    await userDao.addAuthenticationHash(data[0].id, passwordHash);

    return {
        success: true
    }
};


/**
 * SIRQUL
 */

Service.prototype.addUserSirqul = async function({ email, password, firstName, lastName, inviteToken, assetId }) {
    // email and username must be the same for sirqul
    if (!email) {
        throw new InvalidRequestErrorModel('Email is required');
    }
    if(!firstName && !lastName)
        firstName = email;
    try {
        let params = {
            "username" : email,
            "emailAddress" : email,
            "password" : password,
            "firstName" : firstName,
            "lastName" : lastName,
            "responseType" : "AccountResponse",
            "role": "MEMBER",
            "inviteToken": inviteToken,
            assetId
        };
        let userAddResponse = await sirqulService.makePostRequestPromise(
            "/account/create",
            params,
            true,
            false
        );

        let user = await this.getSirqulUser(userAddResponse.accountId);

        // A password can be undefined if the user is signed up
        // with a social network
        // if (password) {
        //     let passwordHash = bcrypt.hashSync(password, 10);
        //     await userDao.addAuthenticationHash(user.id, passwordHash);
        // }

        let session = await _createSessionForUser(user.id);

        return new UserSessionResponseModel({
            user: user,
            session: session
        });

    } catch (e) {
        if (e.code && e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A user already exists with that email');
        }
        throw e;
    }
};

Service.prototype.loginWithEmailPasswordSirqul = async function(email, password) {

    // let user, existingUserHash;

    if (!email) {
        throw new Error('Email is required');
    }

    if (!password) {
        throw new Error('Password is required');
    }

    let params = {
        "username" : email,
        "emailAddress" : email,
        "password" : password
    };
    let userLogin = await sirqulService.makePostRequestPromise(
        "/consumer/login",
        params,
        true,
        false
    );
    if (!userLogin) {
        throw new NotFoundErrorModel('Login Failed');
    }
    if(!userLogin.valid || !userLogin.account || !userLogin.account.accountId){
        throw new NotFoundErrorModel('Incorrect Username or Password');
    }

    let user = await this.getSirqulUser(userLogin.account.accountId);

    // existingUserHash = await userDao.getAuthenticationHashByUserId(user.id);
    // if (!existingUserHash) {
    //     throw new NotFoundErrorModel('No password found for user');
    // }

    // if (!bcrypt.compareSync(password, existingUserHash.hash)) {
    //     throw new NotFoundErrorModel('Invalid login credentials');
    // }

    let session = await _createSessionForUser(user.id);

    return new UserSessionResponseModel({
        user: user,
        session: session
    });
};

Service.prototype.getSirqulUser = async function (id, query = {}) {
    
    const filterOptions = getProfileResponseFilters[query.filterKey] || getProfileResponseFilters.BASIC;
    const params = {
        accountId : id,
        responseFilters: filterOptions
    };

    const user = await sirqulService.makePostRequestPromise(
        "/account/profile/get",
        params,
        true,
        false
    );
    if (!user) {
        throw new NotFoundErrorModel('No user found');
    }

    return new UserResponseModel(user, true);
};

async function _saveAudienceInfo(userId, handle) {
    const formData = {
        accountId: userId,
        name: handle,
        searchTags: handle,
        sendSuggestion: false,
        visibility: 'PUBLIC',
        audienceType: 'USER_MENTION'
    }

    const audienceCreateRes = await sirqulService.makePostRequestPromise('/audience/create', formData, true, false);
    return audienceCreateRes.item.id;
}
Service.prototype.updateUserByIdSirqul = async function(userId, user) {
    if (!user.email) {
        throw new InvalidRequestErrorModel('Email is required');
    }

    try {
        const params = {
            accountId: userId,
            birthday: user.birthdate,
            cellPhone: this.getPhoneByCode(user.phone)
        };
        if(user.firstName)
            params['firstName'] = user.firstName;
        if(user.lastName)
            params['lastName'] = user.lastName;
        if(user.gender){
            if(user.gender === "male"){
                params['gender'] = "MALE";
            } else if (user.gender === "female"){
                params['gender'] = "FEMALE";
            } else if (user.gender === "other"){
                params['gender'] = "ANY";
            }
        }
        if (user.assetId)
            params['assetId'] = user.assetId;
        params.name = user.name;

        const promises = [];
        if(user.email){
            // update username as well
            params['emailAddress'] = user.email;
            params['username'] = user.email;
            let usernameUpdate = sirqulService.makePostRequestPromise(
                "/account/username/update",
                params,
                true,
                false
            );
            promises.push(usernameUpdate);
        }
        if (user.handle) {
            const audId = await _saveAudienceInfo(userId, user.handle);
            if (audId) {
                // params.audienceIdsToAdd = [audId].join(',');
                params.personalAudienceId = audId;
            }
        }
        params.categoryIds = (user.categoryIds || []).join(',');

        const userUpdate = sirqulService.makePostRequestPromise(
            "/account/profile/update",
            params,
            true,
            false
        );
        promises.push(userUpdate);
        return Promise.all(
            promises
        ).then((_data)=> {
            return this.getSirqulUser(userId);
        });
    } catch (e) {
        if (e.code && e.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryErrorModel('A user already exists with that email');
        }
        throw e;
    }
};

Service.prototype.sendPasswordResetSirqul = async function(email, referer) {
    let params = {
        'email' : email,
        'referer' : referer
    };
    console.log(params);
    let userResetPassword = await sirqulService.makePostRequestPromise(
        "/consumer/requestpasswordreset",
        params,
        true,
        false
    );

    if (!userResetPassword.valid){
        return {
            success: false
        }
    }

    return {
        success: true
    }
};

Service.prototype.updateUserPasswordSirqul = async function(email, code, password) {
    if (!email || !code || !password) {
        throw new InvalidRequestErrorModel('Email, code, and password are required');
    }

    let params = {
        'token' : code
    };
    let userValidatePassword = await sirqulService.makePostRequestPromise(
        "/account/validatepasswordreset",
        params,
        true,
        false
    );

    if(!userValidatePassword.valid){
        throw new NotFoundErrorModel('No valid password reset found');
    }

    params = {
        'token' : code,
        'password' : password,
        'confirm' : password
    };
    let userResetPassword = await sirqulService.makePostRequestPromise(
        "/consumer/passwordreset",
        params,
        true,
        false
    );

    if (!userResetPassword.valid){
        throw new NotFoundErrorModel('Failed Resetting Password');
    }

    return {
        success: true
    }
};

Service.prototype.addUserProfileImage = async function (userId, file) {
    const fileStream = fs.createReadStream(path.resolve(file.path));
    const payload = Object.create(null);
    payload.accountId = userId
    payload.media = fileStream
    const uploadResult = await sirqulService.uploadFile(
        "asset/create",
        payload,
        true,
        false
    );
    //removing uploaded image because already saved on s3 bucket by sirquel api
    fs.unlink(path.resolve(file.path), (err) => {
        if (err) {
            console.error('error occur while removing uploaded profile image::', err)
        }
    })
    const { assetId, message, valid } = uploadResult;
    return { assetId, message, valid }
}

Service.prototype.checkUserHandleAvaibility = async function ({ handle }) {
    const params = {
        // accountId: userId,
        // audienceType: 'USER_MENTION',
        keyword: handle,
        start: 0,
        limit: 1,
    };
    const audienceRes = await sirqulService.makePostRequestPromise(
        "/audience/search",
        params,
        true,
        true
    );
    const { items, valid, message } = audienceRes;
    const alreadyTaken = !!items.find(aud => aud.name.toLowerCase() === handle.toLowerCase());
    return ({ alreadyTaken, valid, message });
}

Service.prototype.getInterests = async function (query) {
    const formData = {
        // accountId: query.userId,
        start: query.start,
        limit: query.limit,
        rootOnly: true,
        activeOnly: true
    }
    const parentCategories = await sirqulService.makePostRequestPromise('/category/list', formData, true, false);
    const { hasMoreResults, valid, message } = parentCategories;
    const subCatPromises = [];
    const filteredParentCategories = parentCategories.items.filter(pcat => pcat.subCategoryCount > 0);
    for (const parentCategory of filteredParentCategories) {
        const parentCategoryQuery = { categoryId: parentCategory.categoryId, start: 0, limit: 10, activeOnly: true };
        subCatPromises.push(sirqulService.makePostRequestPromise('/category/list', parentCategoryQuery, true, false));
    }
    const parentSubCategories = await Promise.all(subCatPromises);
    const categories = [];
    let index = 0;
    for (const parentCategory of filteredParentCategories) {
        categories.push({ categoryId: parentCategory.categoryId, name: parentCategory.name, subCategories: parentSubCategories[index].items });
        ++index;
    }
    return ({ categories, hasMoreResults, valid, message });
}

Service.prototype.createAccount = async function (payload) {
    const formData = {
        username: payload.username,
        password: payload.password,
        inviteToken: payload.inviteToken,
        responseType: 'AccountResponse',
        assetId: payload.assetId,
        role: 'MEMBER',
        name: payload.name,
        firstName: payload.firstName,
        emailAddress: payload.email,
        cellPhone: this.getPhoneByCode(payload.phone)
    }
    const createRes = await sirqulService.makePostRequestPromise(
        "account/create",
        formData,
        true,
        false
    );

    const dto = new ApiResponseModel(createRes);
    if (createRes.valid) {
        const user = await this.getSirqulUser(createRes.accountId);
        const session = await _createSessionForUser(user.id);
        const data = new UserSessionResponseModel({
            user: user,
            session: session
        });
        dto.item = data;
    }
    return dto;
}

Service.prototype.updateProfile = async function (payload) {
    const formData = {
        accountId: payload.userId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        emailAddress: payload.contactEmail,
        cellPhone: this.getPhoneByCode(payload.contactPhone),
        birthday: payload.birthDate,
        assetId: payload.assetId,
        categoryIds: payload.categoryIds
    }
    if (payload.handle) {
        const audId = await _saveAudienceInfo(payload.userId, payload.handle);
        if (audId) formData.personalAudienceId = audId;
    }
    const res = await sirqulService.makePostRequestPromise(
        "/account/profile/update",
        formData,
        true,
        false
    );
    return res;
}

Service.prototype.doLogin = async function (payload) {
    const formData = {};
    let loginRes = {};
    if (payload.phone) {
        formData.networkUID = 'PHONE_V2';
        formData.thirdPartyToken = payload.phone;
        formData.thirdPartySecret = payload.otp;
        formData.thirdPartyCredentialId = payload.tokenId;
        formData.accountId = payload.accountId;
        formData.createNewAccount = false;
        loginRes = await sirqulService.makePostRequestPromise('/thirdparty/credential/get', formData, true, false);
    } else {
        formData.accessToken = payload.email;
        formData.accessTokenSecret = payload.password;
        loginRes = await sirqulService.makePostRequestPromise('/account/login', formData, true, false);
    }

    const dto = new ApiResponseModel({ valid: loginRes.valid, message: loginRes.message });
    if (loginRes.valid) {
        const user = await this.getSirqulUser(loginRes.profileInfo.accountId);
        const session = await _createSessionForUser(user.id);
        dto.item = new UserSessionResponseModel({
            user: user,
            session: session
        });
    } else {
        dto.message = 'Incorrect Username or Password';
    }
    return dto;
}

Service.prototype.getPhoneByCode = function (phone) {
    if (!phone) return;
    if (/(^\+)/.test(phone)) return phone;
    else {
        return ('+1' + phone); //sending default country code
    }
}

Service.prototype.createSessionForUser = _createSessionForUser;

module.exports = new Service();