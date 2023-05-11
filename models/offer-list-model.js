let OfferModel = require('./offer-model');

function OfferListModel(total, offers) {
    if (total !== undefined) {
        this.total = total;
    }
    if (offers) {
        this.offers = offers.map(function(offer) {
            return new OfferModel(offer);
        });
    }
}

module.exports = OfferListModel;