const CategoryIndexModel = require('./category-index-model');

function CategoryListIndexModel(total = 0, categories = []) {
    this.total = total;
    this.categories = categories.map(category => new CategoryIndexModel(category));
}

module.exports = CategoryListIndexModel;