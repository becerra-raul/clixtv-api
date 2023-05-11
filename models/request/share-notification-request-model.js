function ShareNotificationRequestModel(data) {
    this.type = data.type;
    this.emailList = data.emailList;
    this.fromEmail = data.fromEmail;
    this.fromName = data.fromName;
    this.message = data.message;

    this.getErrorMessage = function() {
        let errorMessage = undefined;

        if (this.type !== 'email') {
            errorMessage = 'Invalid type specified';
        }

        ['type', 'emailList', 'fromEmail', 'fromName', 'message'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });
        return errorMessage;
    };
}

module.exports = ShareNotificationRequestModel;