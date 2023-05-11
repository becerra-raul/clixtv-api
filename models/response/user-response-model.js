let apiUtils = require('../../utils/api-utils'),
    genderEnum = require('../enum/gender-enum');
const { UserAdditionalInfoModel } = require('./user/user-additional-info-model');

/**
 * @apiDefine UserResponseModel
 *
 * @apiSuccess {String} id ID of star
 * @apiSuccess {String} name Name of star
 * @apiSuccess {String} slug Slug of star
 * @apiSuccess {String} coverPhoto URL for the star cover photo
 * @apiSuccess {String} thumbnailPhoto URL for the star thumbnail photo
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "id": "15",
 *                  "email": "justin.podzimek@gmail.com"
 *              }
 */

function UserResponseModel(data, isSirqul = false) {
    // sirqul account profile response (from profile/get) to clix user response
    // username and email need to be the same

    if(isSirqul){
        if(data.profileInfo){
            const profileInfo = data.profileInfo;
            this.id = profileInfo.accountId;
            if (profileInfo.contact) {                
                this.email = profileInfo.contact.contactInfo && profileInfo.contact.contactInfo.emailAddress;
                this.firstName = profileInfo.contact.firstName;
                this.lastName = profileInfo.contact.lastName;
                this.name = profileInfo.contact.name;
            }
            this.displayName = profileInfo.display;
            this.personalAudienceName = profileInfo.personalAudienceName;
            this.avatar = profileInfo.profileImage;
            this.aboutUs = profileInfo.aboutUs;
            if (Array.isArray(profileInfo.categories)) {
                this.categoryIds = profileInfo.categories.map(cat => cat.categoryId);
            }
            // not supported yet
            // if (data.avatar) {
            //     this.avatar = apiUtils.getPaths().cdn + '/' + data.avatar;
            // }
            if (profileInfo.gender) {
                // this.gender = genderEnum.getLabelByKey(data.gender);
                if(profileInfo.gender === "MALE"){
                    this.gender = "male";
                } else if (profileInfo.gender === "FEMALE"){
                    this.gender = "female";
                } else if (profileInfo.gender === "ANY"){
                    this.gender = "other";
                }
            }
            if (profileInfo.personalProfile && profileInfo.personalProfile.birthday) {
                this.birthdate = new Date(profileInfo.personalProfile.birthday);
            }
            if (profileInfo.contact && profileInfo.contact.contactInfo && profileInfo.contact.contactInfo.cellPhone) {
                this.phone = profileInfo.contact.contactInfo.cellPhone;
                if(this.phone.startsWith("+1")){
                    this.phone = this.phone.substring(2);
                }
            }
        }
        // this.additionalInfo = new UserAdditionalInfoModel(data);
    } else {
        this.id = data.id;
        this.email = data.email;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        if (data.avatar) {
            this.avatar = apiUtils.getPaths().cdn + '/' + data.avatar;
        }
        if (data.gender) {
            this.gender = genderEnum.getLabelByKey(data.gender);
        }
        if (data.birthdate) {
            this.birthdate = data.birthdate;
        }
        if (data.phone) {
            this.phone = data.phone;
        }
    }

    if (!this.displayName) {
        this.displayName = (this.firstName || '') + ' ' + (this.lastName || '').trim();
    }
    
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

module.exports = UserResponseModel;