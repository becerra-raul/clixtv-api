let fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    service;

describe('Episode Service Test', function() {

    before(() => {

        service = rewire('../../../services/episode-service');

        service.__set__('proxyService', {
            getProxyRequest: async (url) => {
                return new Promise((resolve) => {
                    let mockFile;
                    switch(url) {
                        case '/video/get_all_series?page=0&page_size=99':
                            mockFile = 'mock.series-list.json';
                            break;

                        case '/video/get_video_by_id?id=591112e12bbc15029759c977':
                            mockFile = 'mock.episode.json';
                            break;

                        case '/video/get_related_videos?id=5931d885f26c170db5f26f91':
                            mockFile = 'mock.related-episodes.json';
                            break;
                    }
                    resolve(JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', mockFile), 'utf8')));
                });
            }
        });

        service.__set__('_getEpisodeMapBySlug', () => {
            return {
                id: 42,
                entity_slug: 'sock-it-to-ya-party-socks',
                entity_id: '591112e12bbc15029759c977',
                type: 'EPISODE'
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

    describe('#getEpisodeBySlug(...)', () => {
        it('should return the full episode', async () => {
            let episode = await service.getEpisodeBySlug('sock-it-to-ya-super-socks');
            expect(episode).is.an('object');
            expect(episode.id).is.a('string');
            expect(episode.title).is.a('string');
            expect(episode.slug).to.equal('sock-it-to-ya-super-socks');
            expect(episode.runtime).is.a('string');
            expect(episode.episodeNumber).is.a('number');
            expect(episode.views).is.a('number');
            expect(episode.likes).is.a('number');
            expect(episode.viewPoints).is.a('number');
            expect(episode.sharePoints).is.a('number');
            expect(episode.description).is.a('string');
            expect(episode.series).is.an('object');
            expect(episode.series).to.not.be.empty;
            expect(episode.star).is.an('object');
            expect(episode.star).to.not.be.empty;
            expect(episode.brands).is.an('object');
            expect(episode.brands.total).is.a('number');
            expect(episode.brands.brands).is.an('array');
            expect(episode.brands.brands).to.not.be.empty;
            expect(episode.charity).is.an('object');
            expect(episode.charity).to.not.be.empty;
            expect(episode.endPhoto).is.a('string');
            expect(episode.thumbnailPhoto).is.a('string');
            expect(episode.video).is.a('string');
        });
    });

    describe('#getRelatedEpisodesByEpisodeSlug(...)', () => {
        it('should return the related episodes', async () => {
            let episodes = await service.getRelatedEpisodesByEpisodeSlug('sock-it-to-ya-super-socks');
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.not.be.empty;
        });
        it('should return paginated related episodes', async () => {
            let episodes = await service.getRelatedEpisodesByEpisodeSlug('sock-it-to-ya-super-socks', { offset: 0, limit: 5 });
            expect(episodes).is.an('object');
            expect(episodes.total).is.a('number');
            expect(episodes.episodes).is.an('array');
            expect(episodes.episodes).to.have.lengthOf(5);
        });
    });
});