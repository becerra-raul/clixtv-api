let genderEnum = require('../enum/gender-enum');

function UserRequestModel(data, isSirqul = false) {
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.handle = data.handle;
    this.categoryIds = data.categoryIds;
    this.assetId = data.assetId;
    this.birthdate = (data.birthdate && data.birthdate * 1000) || data.birthdate;
    this.phone = (data.phone && data.phone.replace(/\D/g, '')) || data.phone;
    if (data.gender) {
        if (isSirqul)
            this.gender = data.gender;
        else
            this.gender = genderEnum.getKeyByLabel(data.gender);
    }
    if (data.inviteToken) {
        this.inviteToken = data.inviteToken;
    }
}

module.exports = UserRequestModel;