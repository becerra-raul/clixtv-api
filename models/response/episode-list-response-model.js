let EpisodeResponseModel = require('./episode-response-model');

/**
 * @apiDefine EpisodeListResponseModel
 *
 * @apiSuccess {Number} total Total episodes available
 * @apiSuccess {EpisodeResponseModel[]} episodes List of episodes
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 1,
 *                  "episodes": [
 *                      {
 *                          "id": "591d3dffd739a0051b6272ee",
 *                          "title": "Universal Takeover",
 *                          "description": "Musical.ly stars Danielle Cohn, Lauren Godwin, Bryce Xavier, Tyler Brown, Owen Bodnar, Brianna Buchanan, Angel Eslora and Hannah Mae Dugmore take over Universal Studios Hollywood.",
 *                          "runtime": "0:33",
 *                          "episodeNumber": 1,
 *                          "views": 3195,
 *                          "likes": 23,
 *                          "viewPoints": 100,
 *                          "endPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/S01E01.png",
 *                          "thumbnailPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/FollowMe-S01E01-Thumbnail1.jpg",
 *                          "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/591d3dffd739a0051b6272ee/FollowMe-S01E01.mov",
 *                          "slug": "universal-takeover"
 *                          "star": { ... },
 *                          "brands": { ... },
 *                          "charity": { ... },
 *                          "series": { ... },
 *                      }
 *                  ]
 *              }
 */
function EpisodeListResponseModel(total, episodes, isSirqul = false) {
    episodes = (episodes instanceof Array) ? episodes : [];

    this.total = (isNaN(total)) ? 0 : total;
    this.episodes = episodes
        .map((episode) => {
            return new EpisodeResponseModel(episode, isSirqul);
        });
}

module.exports = EpisodeListResponseModel;