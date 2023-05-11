function ApiResponseModel(data, ItemType = undefined) {
    this.valid = data.valid;
    this.message = data.message;
    this.start = data.start;
    this.limit = data.limit;
    this.countTotal = data.countTotal;
    this.hasMoreResults = data.hasMoreResults;
    this.errorCode = data.errorCode;
    if (ItemType) {        
        if (Array.isArray(data.items)) {
            this.items = data.items.map(item => new ItemType(item));
        } else if (data.item) {
            this.item = new ItemType(data.item);
        }
    }
}

module.exports = ApiResponseModel;