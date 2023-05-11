let apiUtils = require('../utils/api-utils'),
    elasticsearchConfigs = apiUtils.getAWSConfig().elasticsearch,
    elasticsearch = require('elasticsearch');

function Service() {
    this.client = new elasticsearch.Client({
        host: elasticsearchConfigs.endpoint,
        defaults: {
            index: elasticsearchConfigs.index
        }
    });

    this.client.indices.exists({ index: elasticsearchConfigs.index })
        .then((data) => {
            if (!data) {
                this.client.indices.create({ index: elasticsearchConfigs.index });
            }
        })
        .catch((e) => {
            console.error('Error initializing ElasticSearch', e);
        });
}

Service.prototype.search = function(type, body) {
    return this.client.search({
        type: type,
        body: body,
        index: elasticsearchConfigs.index
    });
};

Service.prototype.deleteDocument = function(type, id) {
    return this.client.delete({
        index: elasticsearchConfigs.index,
        type: type,
        id: id
    });
};

Service.prototype.createDocument = function(type, body) {
    return this.client.index({
        index: elasticsearchConfigs.index,
        type: type,
        body: body,
        id: body.id
    });
};

module.exports = new Service();