function MediaRequestModel(data) {
    this.type = data.type;
    this.base64Image = data.base64Image;
    this.video = data.video;

    this.getErrorMessage = function() {
        let errorMessage = undefined;

        ['type'].forEach((param) => {
            if (!this[param]) {
                errorMessage = param + ' is required';
            }
        });

        if (!this.base64Image && !this.video) {
            errorMessage = 'Either base64Image or video is required';
        }

        return errorMessage;
    };
}

module.exports = MediaRequestModel;