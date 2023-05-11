function TransformableMediaRequestModel(data) {
    if (data.blur) {
        this.blur = parseFloat(data.blur);
    }
    if (data.resize && data.resize.indexOf('x') !== -1) {
        this.resize = data.resize.split('x');
    }
}

module.exports = TransformableMediaRequestModel;