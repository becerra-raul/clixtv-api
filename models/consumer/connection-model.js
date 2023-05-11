function ConnectionModel(data) {
    this.connectionId = data.connectionId;
    this.connectionAccountId = data.connectionAccountId;
    this.connectionPendingId = data.connectionPendingId;
    this.display = data.display;
    this.isContact = data.isContact;
    this.isFriend = data.isFriend;
    this.isBlocked = data.isBlocked;
    this.isFollowing = data.isFollowing;
    this.isFollower = data.isFollower;
    this.isFriendRequested = data.isFriendRequested;
    this.isFriendRequestPending = data.isFriendRequestPending;
    this.profileImage = data.profileImage;
    this.username = data.username;
    this.personalAudienceName = data.personalAudienceName;
    this.isFollowerPending = data.isFollowerPending;
    this.isFollowingPending = data.isFollowingPending;
}

module.exports = ConnectionModel;