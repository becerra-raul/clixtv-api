let fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    service;

describe('Brand Service Test', function() {

    before(() => {

        service = rewire('../../../services/brand-service');

        service.__set__('proxyService', {
            getProxyRequest: async (url) => {
                return new Promise((resolve) => {
                    let mockFile;
                    switch(url) {
                        case '/campaigns/campaigns?page=0&page_size=99':
                            mockFile = 'mock.campaigns.json';
                            break;

                        case '/campaigns/get_campaign_by_id?id=59114d822bbc15029759c99f':
                            mockFile = 'mock.campaign.json';
                            break;
                    }
                    resolve(JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', mockFile), 'utf8')));
                });
            }
        });

        service.__set__('_getBrandMapBySlug', () => {
            return {
                id: 42,
                entity_slug: 'chevrolet',
                entity_id: '59114d822bbc15029759c99f',
                type: 'BRAND'
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

    describe('#getBrands(...)', () => {

        it('should return all brands', async () => {
            let brands = await service.getBrands();
            expect(brands).is.an('object');
            expect(brands.total).is.a('number');
            expect(brands.brands).is.an('array');
            expect(brands.brands).to.not.be.empty;
            brands.brands.forEach((brand) => {
                expect(brand.id).is.a('string');
                expect(brand.title).is.a('string');
                expect(brand.description).is.a('string');
                expect(brand.viewPoints).is.a('number');
                expect(brand.slug).is.a('string');
                expect(brand.coverPhoto).is.a('string');
                expect(brand.logoPhoto).is.a('string');
                expect(brand.video).is.a('string');
                expect(brand.offers).is.an('object');
            });
        });

        it('should return paginated brands', async () => {
            let brands = await service.getBrands(0, 5);
            expect(brands).is.an('object');
            expect(brands.total).is.a('number');
            expect(brands.brands).is.an('array');
            expect(brands.brands).to.have.lengthOf(5);
        });
    });

    describe('#getBrandBySlug(...)', () => {
        it('should return the full brand', async () => {
            let brand = await service.getBrandBySlug('chevrolet');
            expect(brand).is.an('object');
            expect(brand.id).is.a('string');
            expect(brand.slug).to.equal('chevrolet');
            expect(brand.title).is.a('string');
            expect(brand.description).is.a('string');
            expect(brand.viewPoints).is.a('number');
            expect(brand.coverPhoto).is.a('string');
            expect(brand.logoPhoto).is.a('string');
            expect(brand.video).is.a('string');
            expect(brand.offers).is.an('object');
            expect(brand.stars).is.an('object');
            expect(brand.episodes).is.an('object');
        });

        it('should return the limited brand if fields are provided', async () => {
            let brand = await service.getBrandBySlug('chevrolet', { fields: [ 'offers' ] });
            expect(brand.offers).is.an('object');
            expect(brand.stars).to.not.exist;
            expect(brand.episodes).to.not.exist;
        })
    });

    describe('#getStarsByBrandSlug(...)', () => {
        it('should return the stars for the brand', async () => {
            let stars = await service.getStarsByBrandSlug('chevrolet');
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.have.lengthOf(1);
        });

        it('should return the stars for the brand with paginated episodes', async () => {
            let stars = await service.getStarsByBrandSlug('chevrolet', { offsetEpisodes: 0, limitEpisodes: 2 });
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.have.lengthOf(1);
            stars.stars.forEach((star) => {
                expect(star.episodes).is.an('object');
                expect(star.episodes.total).is.a('number');
                expect(star.episodes.episodes).is.an('array');
                expect(star.episodes.episodes).to.have.lengthOf(2);
            });
        });
    });

    describe('#getOffersByBrandSlug(...)', () => {
        it('should return the offers for the brand', async () => {
            let offers = await service.getOffersByBrandSlug('chevrolet');
            expect(offers).is.an('object');
            expect(offers.total).is.a('number');
            expect(offers.offers).is.an('array');
            expect(offers.offers).to.not.be.empty;
        });
        it('should return the paginated offers for the brand', async () => {
            let offers = await service.getOffersByBrandSlug('chevrolet', { offset: 0, limit: 2 });
            expect(offers).is.an('object');
            expect(offers.total).is.a('number');
            expect(offers.offers).is.an('array');
            expect(offers.offers).to.have.lengthOf(2);
        });
    });

    describe('#getEpisodesByBrandSlug(...)', () => {
        it('should return the episodes for the brand', async () => {
            let episodes = await service.getEpisodesByBrandSlug('chevrolet');
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.not.be.empty;
        });
        it('should return the paginated episodes for the brand', async () => {
            let episodes = await service.getEpisodesByBrandSlug('chevrolet', { offset: 0, limit: 2 });
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.have.lengthOf(2);
        });
    });

    describe('#getStarByBrandSlug(...)', () => {
        it('should return the star for the brand', async () => {
            let star = await service.getStarByBrandSlug('chevrolet', 'grant-martin');
            expect(star).is.an('object');
            expect(star.id).is.a('string');
            expect(star.slug).to.equal('grant-martin');
            expect(star.episodes).is.an('object');
            expect(star.episodes.total).is.a('number');
            expect(star.episodes.episodes).is.an('array');
            expect(star.episodes.episodes).to.not.be.empty;
            expect(star.coverPhoto).is.a('string');
            expect(star.thumbnailPhoto).is.a('string');
        });

        it('should return the star for the brand with paginated episodes', async () => {
            let star = await service.getStarByBrandSlug('chevrolet', 'grant-martin', { offsetEpisodes: 0, limitEpisodes: 2 });
            expect(star).is.an('object');
            expect(star.episodes).is.an('object');
            expect(star.episodes.total).is.a('number');
            expect(star.episodes.episodes).is.an('array');
            expect(star.episodes.episodes).to.have.lengthOf(2);
        });
    });
});