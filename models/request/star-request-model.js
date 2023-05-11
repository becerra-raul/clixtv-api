function StarRequestModel(data) {
    this.name = data.name;
    this.slug = data.slug;

    this.getErrorMessage = function() {
        let errorMessage = undefined;

        ['name', 'slug'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });
        return errorMessage;
    };
}

module.exports = StarRequestModel;