let SeriesModel = require('./series-model');

function SeriesListModel(total, series) {
    if (total) {
        this.total = total;
    }
    this.series = series.map(function(s) {
        return new SeriesModel(s);
    });
}

module.exports = SeriesListModel;