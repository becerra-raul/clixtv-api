function SocialNetworkUserRequestModel(data) {
    this.userId = data.userId;
    this.accessToken = data.accessToken;
    this.accessTokenSecret = data.accessTokenSecret;
}

module.exports = SocialNetworkUserRequestModel;