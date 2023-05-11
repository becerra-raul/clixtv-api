function AdResponseModel(data) {
    if (!data || !data.creatives) {
        return;
    }

    let ad = data.creatives[0];
    this.id = ad.creativeId;
    this.name = ad.name;
    if(ad.image){
        this.thumbnailURL = ad.image.thumbnailURL;
        this.coverURL = ad.image.coverURL;
        this.fullURL = ad.image.fullURL;
        this.griplyURL = ad.image.griplyURL;
    }
    this.action = ad.action;
    this.type = ad.type;
    this.suffix = ad.suffix;

    let campaign = data;
    this.campaignId = campaign.missionId;
    this.campaignName = campaign.title;
}

module.exports = AdResponseModel;