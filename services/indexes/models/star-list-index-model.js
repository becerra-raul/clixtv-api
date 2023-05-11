const StarIndexModel = require('./star-index-model');

function StarListIndexModel(total, stars) {
    stars = (stars instanceof Array) ? stars : [];
    this.total = (isNaN(total)) ? 0 : total;
    this.stars = stars.map((star) => {
        return new StarIndexModel(star);
    })
}

module.exports = StarListIndexModel;