function ContactNotificationRequestModel(data) {
    this.type = data.type;
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.message = data.message;

    if (this.type) {
        let formattedType = this.type.replace(/-/g, ' ');
        this.formattedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
    }

    this.getErrorMessage = function() {
        let errorMessage = undefined;
        ['type', 'name', 'email', 'subject', 'message'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });
        return errorMessage;
    };
}

module.exports = ContactNotificationRequestModel;