function CategoryParametersRequestModel(data) {
    this.offsetEpisodes = parseInt(data.offsetepisodes) || 0;
    this.limitEpisodes = parseInt(data.limitepisodes) || 20;
}

module.exports = CategoryParametersRequestModel;