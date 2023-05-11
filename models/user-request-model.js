function UserRequestModel(data) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
}

module.exports = UserRequestModel;