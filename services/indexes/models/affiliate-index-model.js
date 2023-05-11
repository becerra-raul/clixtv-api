function AffiliateIndexModal(affiliate = {}) {
    const { pictures = [] } = affiliate;
    const endPhoto = pictures.find(p => p.title === 'end-photo');

    this.id = affiliate._id;
    this.title = affiliate.title;
    this.description = affiliate.description;
    this.slug = affiliate.friendly_title;
    this.enabled = affiliate.active === true;

    this.minPlayTime = affiliate.min_play_time || 0;
    this.autoplay = affiliate.autoplay;
    this.link = affiliate.link;
    this.trackingPixel = affiliate.tracking_pixel;
    this.videoId = affiliate.video_ids[0];
    this.inboundAffiliate = affiliate.inbound_affiliate;
    this.outboundAffiliate = affiliate.outbound_affiliate;

    if (endPhoto) {
        this.endPhoto = endPhoto.url;
    }
}

module.exports = AffiliateIndexModal;