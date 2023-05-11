function AnalyticsSendGridUserListResponseModel(data) {
    this.users = data.map((user) => {
        return {
            created: user.created_at,
            email: user.email
        };
    })
}

module.exports = AnalyticsSendGridUserListResponseModel;