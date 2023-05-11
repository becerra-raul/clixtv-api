const OfferIndexModel = require('./offer-index-model');

function OfferListIndexModel(total = 0, offers = []) {
    this.total = total;
    this.offers = offers.map(offer => new OfferIndexModel(offer));
}

module.exports = OfferListIndexModel;