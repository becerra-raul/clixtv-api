let FB = require('fb'),
    google = require('googleapis'),
    plus = google.plus('v1'),
    apiUtils = require('../utils/api-utils'),
    facebookConfigs = apiUtils.getFacebookConfig(),
    googleConfigs = apiUtils.getGoogleConfig(),
    twitterConfigs = apiUtils.getTwitterConfig(),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model');

const Twit = require('twit');

function Service() {
    FB.options({
        appId: facebookConfigs.appId,
        appSecret: facebookConfigs.secret,
        version: 'v4.0'
    });
    this.googleClient = new google.auth.OAuth2(
        googleConfigs.clientId,
        googleConfigs.secret
    );
}

Service.prototype.getAuthenticatedFacebookUser = async function(userId, accessToken) {
    let response = await FB.api('me', { fields: 'id,birthday,email,first_name,gender,last_name', access_token: accessToken });

    if (!response || !response.id || response.id !== userId) {
        throw new InvalidRequestErrorModel('Facebook access token does not match user ID');
    }

    let exchangedToken = await FB.api('oauth/access_token', {
        client_id: facebookConfigs.appId,
        client_secret: facebookConfigs.secret,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken
    });

    if (!exchangedToken || !exchangedToken.token_type) {
        console.warn('Error exchanging Facebook access token', exchangedToken);
    }

    return {
        id: response.id,
        email: response.email,
        firstName: response.first_name,
        lastName: response.last_name,
        gender: response.gender,
        birthdate: response.birthday,
        accessToken: exchangedToken.access_token,
        avatar: 'https://graph.facebook.com/' + response.id + '/picture?type=large'
    }
};

Service.prototype.getAuthenticatedGoogleUser = async function(userId, accessToken) {
    this.googleClient.setCredentials({
        access_token: accessToken
    });
    return new Promise((resolve, reject) => {
        plus.people.get({
            userId: 'me',
            auth: this.googleClient
        }, function (error, response) {
            if (error || !response || response.id !== userId) {
                return reject(error || 'Invalid Google+ user');
            }
            let user = {
                id: response.id,
                gender: response.gender,
                accessToken: accessToken // may need to refresh this in the future
            };
            if (response.emails && response.emails.length > 0) {
                user.email = response.emails[0].value;
            }
            if (response.name) {
                user.firstName = response.name.givenName;
                user.lastName = response.name.familyName;
            }
            if (response.image && response.image.url) {
                user.avatar = response.image.url.split('?')[0];
            }
            resolve(user);
        });
    });
};

Service.prototype.getAuthenticatedTwitterUser = async function(userId, accessToken, accessTokenSecret) {
    const T = new Twit({
        consumer_key: twitterConfigs.accessToken,
        consumer_secret: twitterConfigs.secret,
        access_token: accessToken,
        access_token_secret: accessTokenSecret
    });

    const { data } = await T.get('account/verify_credentials', {
        skip_status: true,
        include_email: true
    });

    if (data && data.id_str !== userId) {
        throw new Error('Invalid Twitter user');
    }
    const user = {
        id: data.id_str,
        accessToken: accessToken
    };
    if (data.email) {
        user.email = data.email;
    }
    if (data.name) {
        const name = data.name.split(' ');
        user.firstName = name[0];
        if (name.length > 1) {
            user.lastName = name[1];
        }
    }
    if (data.profile_image_url_https) {
        user.avatar = data.profile_image_url_https;
    }
    return user;
};

module.exports = new Service();