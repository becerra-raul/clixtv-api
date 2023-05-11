let fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    service;

describe('Star Service Test', function() {

    before(() => {

        service = rewire('../../../services/star-service');

        service.__set__('proxyService', {
            getProxyRequest: async (url) => {
                return new Promise((resolve) => {
                    let mockFile;
                    switch(url) {
                        case '/celebrity/get_all_celebrities?page=0&page_size=99':
                            mockFile = 'mock.stars.json';
                            break;

                        case '/celebrity/get_celebrity?id=590ac858fbb3d633b64e3607':
                            mockFile = 'mock.star.json';
                            break;
                    }
                    resolve(JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', mockFile), 'utf8')));
                });
            }
        });

        service.__set__('_getStarMapBySlug', () => {
            return {
                id: 42,
                entity_slug: 'redfoo',
                entity_id: '590ac858fbb3d633b64e3607',
                type: 'STAR'
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

    describe('#getStars(...)', () => {
        it('should return all stars', async () => {
            let stars = await service.getStars();
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.not.be.empty;
            stars.stars.forEach((star) => {
                expect(star.id).is.a('string');
                expect(star.name).is.a('string');
                expect(star.slug).is.a('string');
                expect(star.coverPhoto).is.a('string');
                expect(star.thumbnailPhoto).is.a('string');
                expect(star.episodes).is.an('object');
                expect(star.episodes.total).is.a('number');
                expect(star.episodes.episodes).is.an('array');
                expect(star.episodes.episodes).to.be.empty;
            });
        });
        it('should return paginated stars', async () => {
            let stars = await service.getStars(0, 2);
            expect(stars).is.an('object');
            expect(stars.total).is.a('number');
            expect(stars.stars).is.an('array');
            expect(stars.stars).to.have.lengthOf(2);
        });
        it('should return sorted stars', async () => {
            let stars = await service.getStars(0, 99, { sort: 'name' });
            expect(stars.stars[0].slug).to.equal('drey-rich-kid');
            expect(stars.stars[1].slug).to.equal('follow-me');
            expect(stars.stars[2].slug).to.equal('grant-martin');
            expect(stars.stars[3].slug).to.equal('redfoo');

            let stars2 = await service.getStars(0, 99, { sort: '-name' });
            expect(stars2.stars[3].slug).to.equal('drey-rich-kid');
            expect(stars2.stars[2].slug).to.equal('follow-me');
            expect(stars2.stars[1].slug).to.equal('grant-martin');
            expect(stars2.stars[0].slug).to.equal('redfoo');
        });
    });

    describe('#getStarBySlug(...)', () => {
        it('should return the full star', async () => {
            let star = await service.getStarBySlug('redfoo');
            expect(star.id).is.a('string');
            expect(star.name).is.a('string');
            expect(star.slug).to.equal('redfoo');
            expect(star.coverPhoto).is.a('string');
            expect(star.thumbnailPhoto).is.a('string');
        });
    });

    describe('#getEpisodesByStarSlug(...)', () => {
        it('should return the episodes for the star', async () => {
            let episodes = await service.getEpisodesByStarSlug('redfoo');
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.not.be.empty;
        });
        it('should return the paginated episodes for the star', async () => {
            let episodes = await service.getEpisodesByStarSlug('redfoo', { offset: 0, limit: 2 });
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.have.lengthOf(2);
        });
    });

    describe('#getSeriesByStarSlug(...)', () => {
        it('should return the series list for the star', async () => {
            let series = await service.getSeriesByStarSlug('redfoo');
            expect(series).is.an('object');
            expect(series.total).is.a('number');
            expect(series.series).is.an('array');
            expect(series.series).to.not.be.empty;
            expect(series.series[0].episodes).to.not.exist;
        });
    });
});