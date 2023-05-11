let expect = require('chai').expect,
    testHelper = require('./test-helper');

describe('Episodes Test', function() {

    let episodeId;

    this.timeout(10000);

    describe('/api/video/get_all_series', () => {

        let series;

        before(async () => {
            series = await testHelper.makeGetRequest('/video/get_all_series?page=0&page_size=999');
        });

        after(() => {
            episodeId = series[0].seasons[0].episodes[0]._id;
        });

        it('Should return a list of series', function() {
            expect(series).is.an('array');
        });

        it('Should have an appropriate data structure', function() {
            series.forEach((series) => {
                expect(series._id).is.a('string');
                expect(series.title).is.a('string');
                expect(series.description).is.a('string');
                expect(series.campaigns).is.an('array');
                expect(series.categories).is.an('array');
                expect(series.celebrities).is.an('array');
                expect(series.charity).is.an('object');
                expect(series.seasons).is.an('array');
            });
        });

        it('Should return all media with a secure protocol', () => {
            series.forEach((series) => {
                series.seasons[0].episodes.forEach((episode) => {
                    if (episode.content.MezzanineVideo) {
                        expect(episode.content.MezzanineVideo.downloadUrl).to.have.string('https://');
                    }
                    if (episode.content.PosterH) {
                        expect(episode.content.PosterH.downloadUrl).to.have.string('https://');
                    }
                    if (episode.content.HLSStream) {
                        expect(episode.content.HLSStream.downloadUrl).to.have.string('https://');
                    }
                    if (episode.content.EndPoster) {
                        expect(episode.content.EndPoster.downloadUrl).to.have.string('https://');
                    }
                });
            });
        })
    });


    describe('/api/video/get_video_by_id', () => {

        let episode;

        before(async() => {
            episode = await testHelper.makeGetRequest('/video/get_video_by_id?id=' + episodeId);
        });

        it('Should return an episode matching the provided ID', async() => {
            expect(episode).is.an('object');
        });

        it('Should have an appropriate data structure', () => {
            expect(episode._id).is.a('string');
            expect(episode._id).to.equal(episodeId);
            expect(episode.title).is.a('string');
            expect(episode.description).is.a('string');
            expect(episode.charity).is.an('object');
            expect(episode.campaigns).is.an('array');
            expect(episode.celebrity).is.an('object');
        });

        it('Should return all media with a secure protocol', () => {
            if (episode.content.MezzanineVideo) {
                expect(episode.content.MezzanineVideo.downloadUrl).to.have.string('https://');
            }
            if (episode.content.PosterH) {
                expect(episode.content.PosterH.downloadUrl).to.have.string('https://');
            }
            if (episode.content.HLSStream) {
                expect(episode.content.HLSStream.downloadUrl).to.have.string('https://');
            }
            if (episode.content.EndPoster) {
                expect(episode.content.EndPoster.downloadUrl).to.have.string('https://');
            }
        })
    });
});