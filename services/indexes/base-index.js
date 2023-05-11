let elasticSearchService = require('../elasticsearch-service');

function BaseIndex() {
    this.searchService = elasticSearchService;
}

function _getNoopPromise() {
    return new Promise((resolve) => {
        resolve({});
    })
}

BaseIndex.prototype.indexDataById = function(id) {
    return _getNoopPromise();
};

BaseIndex.prototype.indexAllData = function() {
    return _getNoopPromise();
};

BaseIndex.prototype.deleteIndexDataById = function(id) {
    return _getNoopPromise();
};

module.exports = BaseIndex;