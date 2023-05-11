function ApplicationAuthenticationRequestModel(data) {
    this.key = data.key;
    this.secret = data.secret;

    this.getErrorMessage = function() {
        let errorMessage = undefined;

        ['key', 'secret'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });
        return errorMessage;
    };
}

module.exports = ApplicationAuthenticationRequestModel;