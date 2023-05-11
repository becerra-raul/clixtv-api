let CategoryModel = require('./category-model');

function CategoryListModel(total, categories) {
    if (total) {
        this.total = total;
    }
    this.categories = categories.map(function(category) {
        return new CategoryModel(category);
    });
}

module.exports = CategoryListModel;