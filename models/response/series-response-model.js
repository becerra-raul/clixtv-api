
function SeriesResponseModel(series, isSirqul = false, sirqulType = "album") {
    // sirqul album response or audience response to clix series response
    // always return albumId as id in clix response

    if(isSirqul){
        let metaData = series.metaData ? JSON.parse(series.metaData) : {};
        if(sirqulType === "audience") {
            this.id = metaData.sirqul_album_id;
            this.title = series.name;
            this.audienceId = series.id;
            this.slug = metaData.friendly_title;
        } else {
            this.id = series.id;
            this.title = series.name;
            this.audienceId = metaData.sirqul_audience_id;
            this.slug = series.subType;
        }

        if (series.episodes) {
            this.episodes = series.episodes;
        }
        if (series.brands) {
            this.brands = series.brands;
        }

        if (series.charity) {
            this.charity = series.charity;
        } else if (series.charities) {
            // A series can only have one charity
            this.charity = series.charities.charities[0];
        }
    } else{
        this.id = series.id;
        this.title = series.title;
        this.slug = series.slug;

        if (series.episodes) {
            this.episodes = series.episodes;
        }

        if (series.brands) {
            this.brands = series.brands;
        }

        if (series.charity) {
            this.charity = series.charity;
        } else if (series.charities) {
            // A series can only have one charity
            this.charity = series.charities.charities[0];
        }
    }
}

module.exports = SeriesResponseModel;