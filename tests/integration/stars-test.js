let expect = require('chai').expect,
    testHelper = require('./test-helper');

describe('Stars Test', function() {

    let starId;

    this.timeout(10000);

    describe('/api/celebrity/get_all_celebrities', () => {

        let stars;

        before(async () => {
            stars = await testHelper.makeGetRequest('/celebrity/get_all_celebrities?page=0&page_size=999');
        });

        after(() => {
            starId = stars[0]._id;
        });

        it('Should return a list of stars', function() {
            expect(stars).is.an('array');
        });

        it('Should have an appropriate data structure', function() {
            stars.forEach((star) => {
                expect(star._id).is.a('string');
                expect(star.title).is.a('string');
                expect(star.content.ProfilePicture.downloadUrl).is.a('string');
            });
        });

        it('Should return all media with a secure protocol', () => {
            stars.forEach((star) => {
                if (star.content.ProfilePicture) {
                    expect(star.content.ProfilePicture.downloadUrl).to.have.string('https://');
                }
                if (star.content.BackgroundImage) {
                    expect(star.content.BackgroundImage.downloadUrl).to.have.string('https://');
                }
            });
        })
    });

    describe('/api/celebrity/get_celebrity', () => {

        let star;

        before(async () => {
            star = await testHelper.makeGetRequest('/celebrity/get_celebrity?id=' + starId);
        });

        it('Should return a star matching the provided ID', async () => {
            expect(star).is.an('object');
        });

        it('Should have an appropriate data structure', () => {
            expect(star._id).is.a('string');
            expect(star._id).to.equal(starId);
            expect(star.title).is.a('string');
            expect(star.description).is.a('string');
            expect(star.videos).is.an('array');
            expect(star.series).is.an('array');
            expect(star.charities).is.an('array');
            expect(star.campaigns).is.an('array');
        });

        it('Should return all media with a secure protocol', () => {
            if (star.content.ProfilePicture) {
                expect(star.content.ProfilePicture.downloadUrl).to.have.string('https://');
            }
            if (star.content.BackgroundImage) {
                expect(star.content.BackgroundImage.downloadUrl).to.have.string('https://');
            }
        })
    });
});