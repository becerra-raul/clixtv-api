let BrandResponseModel = require('./brand-response-model');

/**
 * @apiDefine BrandListResponseModel
 *
 * @apiSuccess {Number} total Total brands available
 * @apiSuccess {BrandResponseModel[]} brands List of brands
 *
 *
 * @apiSuccessExample {json} Example success
 *              {
 *                  "total": 11,
 *                  "brands": [
 *                      {
 *                          "id": "59114d822bbc15029759c99f",
 *                          "title": "Chevrolet",
 *                          "description": "Welcome to the official Chevrolet ClixTV channel. Here you can take a close-up look at how this iconic automotive brand sets innovation in motion through compelling design and revolutionary technology. See innovation in action with Chevrolet vehicles like the all-new Corvette Stingray, the fun-loving Sonic, the sophisticated Impala, the all-electric Spark EV, and the extended-range electric Volt. Join us as we continue to pave the way for discovery on the automotive front and Find New Roads.\n\nMore information about the Chevrolet brand and models can be found at www.chevrolet.com.",
 *                          "viewPoints": 50,
 *                          "slug": "chevrolet",
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114d822bbc15029759c99f/chevycover.jpg",
 *                          "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/59114d822bbc15029759c99f/chevrolet-auto-logo-vector.svg",
 *                          "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114d822bbc15029759c99f/All-new2018EquinoxisforEverybodyEverywhere-Chevrolet.mp4",
 *                          "offers": {
 *                              "total": 3,
 *                              "offers": [ ... ]
 *                          }
 *                      },
 *                      {
 *                          "id": "59114adc2bbc15029759c998",
 *                          "title": "Vans",
 *                          "description": "The Vans® brand has been connecting with youth culture to promote creative self-expression, authenticity and progression for nearly 50 years, while linking the brand’s deep roots in action sports with art, music and street culture.\n\nToday, the Vans® brand evolution continues. From its foundation as an original skateboarding company, to its emergence as a leading action sports brand, to its rise to become the world’s largest youth culture brand — the Vans® brand has taken on a power that matches its business performance.",
 *                          "viewPoints": 50,
 *                          "slug": "vans",
 *                          "coverPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/vanscover.jpg",
 *                          "logoPhoto": "https://advncedcdn.vo.llnwd.net/clixtv_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/vans-logo1.svg",
 *                          "video": "https://advncedcdn.vo.llnwd.net/clixtv_prod_storage/storage/57cdc2665aad0b6fcf67bb3d/59114adc2bbc15029759c998/TheStoryofVans.mp4",
 *                          "offers": {
 *                              "total": 3,
 *                              "offers": [ ... ]
 *                          }
 *                      }
 *                  ]
 *              }
 */
function BrandListResponseModel(total = 0, brands = [], isSirqul = false, sirqulType = "album") {
    this.total = total;
    this.brands = brands.map(brand => new BrandResponseModel(brand, isSirqul, sirqulType));
}

module.exports = BrandListResponseModel;