let fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    service;

describe('Category Service Test', function() {

    before(() => {

        service = rewire('../../../services/category-service');

        service.__set__('proxyService', {
            getProxyRequest: async (url) => {
                return new Promise((resolve) => {
                    let mockFile;
                    switch(url) {
                        case '/category/get_all_categories?page=0&page_size=99':
                            mockFile = 'mock.categories.json';
                            break;

                        case '/category/get_category_by_id?id=57d1a8fd60130003003b727b':
                            mockFile = 'mock.category.json';
                            break;
                    }
                    resolve(JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', mockFile), 'utf8')));
                });
            }
        });

        service.__set__('_getCategoryMapBySlug', () => {
            return {
                id: 42,
                entity_slug: 'trending-now',
                entity_id: '57d1a8fd60130003003b727b',
                type: 'CATEGORY'
            }
        });

        service.__set__('mediaService', {
            addTransformableImageUrls: async () => {
                return new Promise((resolve) => {
                    resolve({ success: true });
                });
            }
        });
    });

    describe('#getCategories(...)', () => {
        it('should return all categories', async () => {
            let categories = await service.getCategories();
            expect(categories).is.an('object');
            expect(categories.total).is.a('number');
            expect(categories.categories).is.an('array');
            expect(categories.categories).to.not.be.empty;
        });
        it('should return paginated categories', async () => {
            let categories = await service.getCategories(0, 5);
            expect(categories).is.an('object');
            expect(categories.total).is.a('number');
            expect(categories.categories).is.an('array');
            expect(categories.categories).to.have.lengthOf(5);
        });
    });

    describe('#getCategoryBySlug(...)', () => {
        it('should return the full category', async () => {
            let category = await service.getCategoryBySlug('trending-now');
            expect(category.id).is.a('string');
            expect(category.title).is.a('string');
            expect(category.slug).is.a('string');
            expect(category.coverPhoto).is.a('string');
            expect(category.thumbnailPhoto).is.a('string');
            expect(category.episodes).is.an('object');
            expect(category.episodes.total).is.a('number');
            expect(category.episodes.episodes).is.an('array');
            expect(category.episodes.episodes).to.not.be.empty;
        });
        it('should return the category with paginated episodes', async () => {
            let category = await service.getCategoryBySlug('trending-now', { offsetEpisodes: 0, limitEpisodes: 5 });
            expect(category.id).is.a('string');
            expect(category.title).is.a('string');
            expect(category.slug).is.a('string');
            expect(category.coverPhoto).is.a('string');
            expect(category.thumbnailPhoto).is.a('string');
            expect(category.episodes).is.an('object');
            expect(category.episodes.total).is.a('number');
            expect(category.episodes.episodes).is.an('array');
            expect(category.episodes.episodes).to.have.lengthOf(5);
        });
    });
});