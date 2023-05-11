let fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    service;

describe('Charity Service Test', function() {

    before(() => {

        service = rewire('../../../services/charity-service');

        service.__set__('proxyService', {
            getProxyRequest: async (url) => {
                return new Promise((resolve) => {
                    let mockFile;
                    switch(url) {
                        case '/brands/get_charities_array?page=0&page_size=99':
                            mockFile = 'mock.charities.json';
                            break;

                        case '/brands/get_charity?id=5911e4f332399a7577df3482':
                            mockFile = 'mock.charity.json';
                            break;
                    }
                    resolve(JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', mockFile), 'utf8')));
                });
            }
        });

        service.__set__('_getCharityMapBySlug', () => {
            return {
                id: 42,
                entity_slug: 'special-olympics',
                entity_id: '5911e4f332399a7577df3482',
                type: 'CHARITY'
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

    describe('#getCharities(...)', () => {

        it('should return all charities', async () => {
            let charities = await service.getCharities();
            expect(charities).is.an('object');
            expect(charities.total).is.a('number');
            expect(charities.charities).is.an('array');
            expect(charities.charities).to.not.be.empty;
            charities.charities.forEach((charity) => {
                expect(charity.id).is.a('string');
                expect(charity.title).is.a('string');
                expect(charity.description).is.a('string');
                expect(charity.slug).is.a('string');
                expect(charity.coverPhoto).is.a('string');
                expect(charity.logoPhoto).is.a('string');
                expect(charity.video).is.a('string');
            });
        });

        it('should return paginated brands', async () => {
            let charities = await service.getCharities(0, 5);
            expect(charities).is.an('object');
            expect(charities.total).is.a('number');
            expect(charities.charities).is.an('array');
            expect(charities.charities).to.have.lengthOf(5);
        });

        it('should return sorted charities', async () => {
            let charities = await service.getCharities(0, 5, { sort: 'name' });
            expect(charities.charities[0].slug).to.equal('special-olympics');
            expect(charities.charities[1].slug).to.equal('special-olympics2');
            expect(charities.charities[2].slug).to.equal('special-olympics3');
            expect(charities.charities[3].slug).to.equal('special-olympics4');
            expect(charities.charities[4].slug).to.equal('special-olympics5');

            let charities2 = await service.getCharities(0, 5, { sort: '-name' });
            expect(charities2.charities[0].slug).to.equal('special-olympics9');
            expect(charities2.charities[1].slug).to.equal('special-olympics8');
            expect(charities2.charities[2].slug).to.equal('special-olympics7');
            expect(charities2.charities[3].slug).to.equal('special-olympics6');
            expect(charities2.charities[4].slug).to.equal('special-olympics5');
        });
    });

    describe('#getCharityBySlug(...)', () => {
        it('should return the full charity', async () => {
            let charity = await service.getCharityBySlug('special-olympics');
            expect(charity).is.an('object');
            expect(charity.id).is.a('string');
            expect(charity.slug).to.equal('special-olympics');
            expect(charity.title).is.a('string');
            expect(charity.description).is.a('string');
            expect(charity.coverPhoto).is.a('string');
            expect(charity.logoPhoto).is.a('string');
            expect(charity.video).is.a('string');
            expect(charity.episodes).to.not.exist;
        });

        it('should return the limited charity if fields are provided', async () => {
            let charity = await service.getCharityBySlug('chevrolet', { fields: [ 'episodes' ] });
            expect(charity.episodes).is.an('object');
        })
    });

    describe('#getStarsByCharitySlug(...)', () => {
        it('should return the stars for the charity', async () => {
            let stars = await service.getStarsByCharitySlug('special-olympics');
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.have.lengthOf(3);
        });

        it('should return the stars for the charity with paginated episodes', async () => {
            let stars = await service.getStarsByCharitySlug('special-olympics', { offsetEpisodes: 0, limitEpisodes: 2 });
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.have.lengthOf(3);
            stars.stars.forEach((star) => {
                expect(star.episodes).is.an('object');
                expect(star.episodes.total).is.a('number');
                expect(star.episodes.episodes).is.an('array');
                expect(star.episodes.episodes).to.have.lengthOf(2);
            });
        });
    });

    describe('#getEpisodesByCharitySlug(...)', () => {
        it('should return the episodes for the charity', async () => {
            let episodes = await service.getEpisodesByCharitySlug('special-olympics');
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.not.be.empty;
        });
        it('should return the paginated episodes for the charity', async () => {
            let episodes = await service.getEpisodesByCharitySlug('special-olympics', { offset: 0, limit: 2 });
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.have.lengthOf(2);
        });
    });

    describe('#getStarByCharitySlug(...)', () => {
        it('should return the star for the charity', async () => {
            let star = await service.getStarByCharitySlug('special-olympics', 'redfoo');
            expect(star).is.an('object');
            expect(star.id).is.a('string');
            expect(star.slug).to.equal('redfoo');
            expect(star.episodes).is.an('object');
            expect(star.episodes.total).is.a('number');
            expect(star.episodes.episodes).is.an('array');
            expect(star.episodes.episodes).to.not.be.empty;
            expect(star.coverPhoto).is.a('string');
            expect(star.thumbnailPhoto).is.a('string');
        });

        it('should return the star for the brand with paginated episodes', async () => {
            let star = await service.getStarByCharitySlug('special-olympics', 'redfoo', { offsetEpisodes: 0, limitEpisodes: 2 });
            expect(star).is.an('object');
            expect(star.episodes).is.an('object');
            expect(star.episodes.total).is.a('number');
            expect(star.episodes.episodes).is.an('array');
            expect(star.episodes.episodes).to.have.lengthOf(2);
        });
    });
});