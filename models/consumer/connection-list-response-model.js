const ConnectionModel = require("./connection-model");

function ConnectionListResponseModel(data) {
    this.valid = data.valid;
    this.message = data.message;
    this.connections = data.connections.map(c => new ConnectionModel(c));
    this.hasMoreResults = data.hasMoreResults;
}

module.exports = ConnectionListResponseModel;