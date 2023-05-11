let expect = require('chai').expect,
    testHelper = require('./test-helper');

describe('Campaigns Test', function() {

    let campaignId;

    this.timeout(10000);

    describe('/api/campaigns', () => {

        let campaigns;

        before(async () => {
            campaigns = await testHelper.makeGetRequest('/campaigns?page=0&page_size=999');
        });

        after(() => {
            campaignId = campaigns[0]._id;
        });

        it('Should return a list of campaigns', function() {
            expect(campaigns).is.an('array');
        });

        it('Should have an appropriate data structure', function() {
            campaigns.forEach((campaign) => {
                expect(campaign._id).is.a('string');
                expect(campaign.title).is.a('string');
                expect(campaign.content.BrandTransparentLogo.downloadUrl).is.a('string');
            });
        });

        it('Should return all media with a secure protocol', () => {
            campaigns.forEach((campaign) => {
                if (campaign.content.BrandTransparentLogo) {
                    expect(campaign.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
                }
                if (campaign.content.BackgroundImage) {
                    expect(campaign.content.BackgroundImage.downloadUrl).to.have.string('https://');
                }
                if (campaign.content.Video) {
                    expect(campaign.content.Video.downloadUrl).to.have.string('https://');
                }
            });
        })
    });

    describe('/api/campaigns/get_campaign_by_id', () => {

        let campaign;

        before(async () => {
            campaign = await testHelper.makeGetRequest('/campaigns/get_campaign_by_id?id=' + campaignId);
        });

        it('Should return a campaign matching the provided ID', async () => {
            expect(campaign).is.an('object');
        });

        it('Should have an appropriate data structure', () => {
            expect(campaign._id).is.a('string');
            expect(campaign._id).to.equal(campaignId);
            expect(campaign.title).is.a('string');
            expect(campaign.description).is.a('string');
            expect(campaign.celebrities).is.an('array');
            expect(campaign.offers).is.an('array');
            expect(campaign.videos).is.an('array');
        });

        it('Should return all media with a secure protocol', () => {
            if (campaign.content.BrandTransparentLogo) {
                expect(campaign.content.BrandTransparentLogo.downloadUrl).to.have.string('https://');
            }
            if (campaign.content.BackgroundImage) {
                expect(campaign.content.BackgroundImage.downloadUrl).to.have.string('https://');
            }
            if (campaign.content.Video) {
                expect(campaign.content.Video.downloadUrl).to.have.string('https://');
            }
        })
    });
});