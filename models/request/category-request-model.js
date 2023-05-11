function CategoryRequestModel(data) {
    this.title = data.title;
    this.slug = data.slug;

    this.getErrorMessage = function() {
        let errorMessage = undefined;

        ['title', 'slug'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });
        return errorMessage;
    };
}

module.exports = CategoryRequestModel;