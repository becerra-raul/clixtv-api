let expect = require('chai').expect,
    testHelper = require('./test-helper');

describe('Categories Test', function() {

    let categoryId;

    this.timeout(10000);

    describe('/api/category/get_all_categories', () => {

        let categories;

        before(async () => {
            categories = await testHelper.makeGetRequest('/category/get_all_categories?page=0&page_size=999');
        });

        after(() => {
            categoryId = categories[0]._id;
        });

        it('Should return a list of categories', () => {
            expect(categories).is.an('array');
        });

        it('Should have an appropriate data structure', () => {
            categories.forEach((category) => {
                expect(category._id).is.a('string');
                expect(category.title).is.a('string');
                expect(category.content.ProfilePicture.downloadUrl).is.a('string');
            });
        });

        it('Should return all media with a secure protocol', () => {
            categories.forEach((category) => {

                if (category.content.BrandTransparentLogo) {
                    expect(category.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
                }
                if (category.content.ProfilePicture) {
                    expect(category.content.ProfilePicture.downloadUrl).to.have.string('https://');
                }
                if (category.content.BackgroundImage) {
                    expect(category.content.BackgroundImage.downloadUrl).to.have.string('https://');
                }
            });
        });
    });

    describe('/api/category/get_category_by_id', () => {

        let category;

        before(async () => {
            category = await testHelper.makeGetRequest('/category/get_category_by_id?id=' + categoryId);
        });

        it('Should return a category matching the provided ID', async () => {
            expect(category).is.an('object');
        });

        it('Should have an appropriate data structure', () => {
            expect(category._id).is.a('string');
            expect(category._id).to.equal(categoryId);
            expect(category.title).is.a('string');
            expect(category.description).is.a('string');
            expect(category.videos).is.an('array');
        });

        it('Should return all media with a secure protocol', () => {
            if (category.content.BrandTransparentLogo) {
                expect(category.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
            }
            if (category.content.BackgroundImage) {
                expect(category.content.BackgroundImage.downloadUrl).to.have.string('https://');
            }
            if (category.content.Video) {
                expect(category.content.Video.downloadUrl).to.have.string('https://');
            }
        });
    });
});