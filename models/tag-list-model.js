let TagModel = require('./tag-model');

function TagListModel(total, tags) {
    if (total) {
        this.total = total;
    }
    this.tags = tags.map(function(tag) {
        return new TagModel(tag);
    });
}

module.exports = TagListModel;