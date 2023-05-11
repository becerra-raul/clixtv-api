function UserAdditionalInfoModel(data) {
    if (!data) return undefined
    if (data.appInfo) {
        this.rank = data.appInfo.rank;
        this.points = data.appInfo.points;
    }
    if (data.friendInfo) {
        this.followerCount = data.friendInfo.followerCount;
        this.followingCount = data.friendInfo.followingCount;
        this.friendCount = data.friendInfo.friendCount;
    }
    this.canViewFriendInfo = data.canViewFriendInfo;
    this.canViewProfileInfo = data.canViewProfileInfo;
    this.isContact = data.isContact;
    this.isFollower = data.isFollower;
    this.isFollowerPending = data.isFollowerPending;
    this.isFollowing = data.isFollowing;
    this.isFollowingPending = data.isFollowerPending;
    this.isFriend = data.isFriend;
    this.isFriendRequested = data.isFriendRequested;
    this.isFriendRequestPending = data.isFriendRequestPending;
}

module.exports = { UserAdditionalInfoModel };