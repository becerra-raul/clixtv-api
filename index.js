let express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    apiUtils = require('./utils/api-utils'),
    environment = apiUtils.getEnvironment(),
    connect_datadog = require('connect-datadog')({
        'response_code': true
    }),
    morgan = require('morgan')
let categoryController = require('./controllers/category-controller')(app),
    episodeController = require('./controllers/episode-controller')(app),
    starController = require('./controllers/star-controller')(app),
    brandController = require('./controllers/brand-controller')(app),
    charityController = require('./controllers/charity-controller')(app),
    offerController = require('./controllers/offer-controller')(app),
    userController = require('./controllers/user-controller')(app),
    notificationController = require('./controllers/notification-controller')(app),
    applicationController = require('./controllers/application-controller')(app),
    analyticsController = require('./controllers/analytics-controller')(app),
    mediaController = require('./controllers/media-controller')(app),
    seriesController = require('./controllers/series-controller')(app),
    configurationController = require('./controllers/configuration-controller')(app),
    pointsController = require('./controllers/points-controller')(app),
    favoriteController = require('./controllers/favorite-controller')(app),
    adminController = require('./controllers/admin-controller')(app),
    searchController = require('./controllers/search-controller')(app),
    carouselController = require('./controllers/carousel-controller')(app),
    sirqulController = require('./controllers/sirqul-controller')(app),
    leaderboardController = require('./controllers/leaderboard-controller')(app),
    consumerController = require('./controllers/consumer-controller')(app),
    likeController = require('./controllers/like-controller')(app),
    albumController = require('./controllers/album-controller')(app),
    ratingController = require('./controllers/rating-controller')(app),
    noteController = require('./controllers/note-controller')(app),
    commonController = require('./controllers/common-controller')(app),
    inviteController = require('./controllers/invite-controller')(app),
    gameController = require('./controllers/game-controlller')(app),
    tokenController = require('./controllers/token-controller')(app);

let userSessionMiddleware = require('./middleware/user-session-middleware'),
    accessLevelsMiddleware = require('./middleware/access-levels-middleware');

if (environment === 'prod') {
    app.use(connect_datadog);
}

const cookieParser = require('cookie-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(userSessionMiddleware);
app.use(accessLevelsMiddleware);
app.use(cookieParser());
app.use(morgan('combined'));
app.set('trust proxy', true);

// Simple healthcheck to make sure the app is still up and running
app.get('/healthcheck', function (request, response) {
    response.json({
        status: 'lookin\' goooood'
    });
});

// Prevent the automated favicon request from throwing a 500
app.get('/favicon.ico', function (request, response) {
    response.sendStatus(204);
});

categoryController.init();
episodeController.init();
starController.init();
brandController.init();
charityController.init();
offerController.init();
notificationController.init();
userController.init();
mediaController.init();
seriesController.init();
applicationController.init();
analyticsController.init();
configurationController.init();
pointsController.init();
favoriteController.init();
adminController.init();
searchController.init();
carouselController.init();
sirqulController.init();
leaderboardController.init();
categoryController.init();
consumerController.init();
likeController.init();
albumController.init();
ratingController.init();
noteController.init();
commonController.init();
inviteController.init();
gameController.init();
tokenController.init();

if (!process.env.PORT) {
    console.error('No port environment variable defined');
    process.exit(1);
}

app.listen(process.env.PORT, function () {
    console.log('ClixTV API listening on port ' + process.env.PORT);
});
