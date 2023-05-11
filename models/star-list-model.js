let StarModel = require('./star-model');

function StarListModel(total, stars) {
    if (total) {
        this.total = total;
    }
    this.stars = stars.map(function(star) {
        return new StarModel(star);
    });
}

module.exports = StarListModel;