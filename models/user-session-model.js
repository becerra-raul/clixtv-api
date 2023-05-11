function UserSessionModel(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionToken = data.session_token;
}

module.exports = UserSessionModel;