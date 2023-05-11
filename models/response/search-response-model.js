function _getFilteredResults(results, type, isSirqul) {
    if(isSirqul){
        let ret = results
            .find((result) => {
                return result._type === type;
            });
        return ret ? ret._source : null;
    }
    return results
        .filter((result) => {
            return result._type === type;
        })
        .map((hit) => {
            return hit._source;
        });
}

function SearchResponseModel(total, results, isSirqul = false) {
    let brands = _getFilteredResults(results, 'brand', isSirqul),
        stars = _getFilteredResults(results, 'star', isSirqul),
        charities = _getFilteredResults(results, 'charity', isSirqul),
        offers = _getFilteredResults(results, 'offer', isSirqul),
        episodes = _getFilteredResults(results, 'episode', isSirqul),
        categories = _getFilteredResults(results, 'category', isSirqul),
        series = _getFilteredResults(results, 'series', isSirqul),
        news = _getFilteredResults(results, 'news', isSirqul);
    
    this.total = total;

    if (brands && brands.length > 0) {
        this.brands = brands;
    }
    if (stars && stars.length > 0) {
        this.stars = stars;
    }
    if (charities && charities.length > 0) {
        this.charities = charities;
    }
    if (offers && offers.length > 0) {
        this.offers = offers;
    }
    if (episodes && episodes.length > 0) {
        this.episodes = episodes;
    }
    if (categories && categories.length > 0) {
        this.categories = categories;
    }
    if (series && series.length > 0) {
        this.series = series;
    }
    if (news && news.length > 0) {
        this.news = news;
    }
}

module.exports = SearchResponseModel;