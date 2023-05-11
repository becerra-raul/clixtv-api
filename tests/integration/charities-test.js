let expect = require('chai').expect,
    testHelper = require('./test-helper');

describe('Charities Test', function() {

    let charitiyId;

    this.timeout(10000);

    describe('/api/brands/get_charities_array', () => {

        let charities;

        before(async () => {
            charities = await testHelper.makeGetRequest('/brands/get_charities_array?page=0&page_size=999');
        });

        after(() => {
            charitiyId = charities[0]._id;
        });

        it('Should return a list of charities', function() {
            expect(charities).is.an('array');
        });

        it('Should have an appropriate data structure', function() {
            charities.forEach((charity) => {
                expect(charity._id).is.a('string');
                expect(charity.title).is.a('string');
                expect(charity.content.ProfilePicture.downloadUrl).is.a('string');
            });
        });

        it('Should return all media with a secure protocol', () => {
            charities.forEach((charity) => {
                if (charity.content.BrandTransparentLogo) {
                    expect(charity.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
                }
                if (charity.content.BackgroundImage) {
                    expect(charity.content.BackgroundImage.downloadUrl).to.have.string('https://');
                }
                if (charity.content.Video) {
                    expect(charity.content.Video.downloadUrl).to.have.string('https://');
                }
            });
        })
    });

    describe('/api/brands/get_charity', () => {

        let charity;

        before(async () => {
            charity = await testHelper.makeGetRequest('/brands/get_charity?id=' + charitiyId);
            charity = charity[0]; // ...returned as an array for some reason
        });

        it('Should return a charity matching the provided ID', async () => {
            expect(charity).is.an('object');
        });

        it('Should have an appropriate data structure', () => {
            expect(charity).is.an('object');
            expect(charity._id).is.a('string');
            expect(charity._id).to.equal(charitiyId);
            expect(charity.title).is.a('string');
            expect(charity.description).is.a('string');
            expect(charity.celebrities).is.an('array');
            expect(charity.videos).is.an('array');
        });

        it('Should return all media with a secure protocol', () => {
            if (charity.content.BrandTransparentLogo) {
                expect(charity.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
            }
            if (charity.content.BackgroundImage) {
                expect(charity.content.BackgroundImage.downloadUrl).to.have.string('https://');
            }
            if (charity.content.Video) {
                expect(charity.content.Video.downloadUrl).to.have.string('https://');
            }
        })
    });
});