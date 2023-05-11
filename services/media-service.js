let crypto = require('crypto'),
    gm = require('gm'),
    AWS = require('aws-sdk'),
    request = require('request'),
    apiUtils = require('../utils/api-utils'),
    awsConfigs = apiUtils.getAWSConfig(),
    mediaDao = require('../persistence/media-dao'),
    imageSizeEnum = require('../models/enum/image-size-enum'),
    NotFoundErrorModel = require('../models/not-found-error-model'),
    InvalidRequestErrorModel = require('../models/invalid-request-error-model'),
    MediaTypeListResponseModel = require('../models/response/media-type-list-response-model'),
    MediaListResponseModel = require('../models/response/media-list-response-model'),
    MediaResponseModel = require('../models/response/media-response-model'),
    ImageMediaListResponseModel = require('../models/response/image-media-list-response-model');

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const episodeService = require('./episode-service');
const searchService = require('./elasticsearch-service');
const zypeService = require('./zype-service');

function Service() {
    this.s3 = new AWS.S3({
        accessKeyId: awsConfigs.key,
        secretAccessKey: awsConfigs.secret
    });
}

function _getImageBufferData(url) {
    return new Promise((resolve, reject) => {
        let requestSettings = {
            method: 'GET',
            url: url,
            encoding: null
        };
        request(requestSettings, function(error, response, body) {
            if (error || !body) {
                return reject(error || 'Error getting buffer data for image ' + url);
            }
            resolve(body);
        });
    });
}

function _getS3Object(key) {
    return new Promise((resolve, reject) => {
        this.s3.getObject({
            Bucket: awsConfigs.s3.bucket,
            Key: key
        }, (error, data) => {
            resolve(data);
        })
    });
}

Service.prototype.getTransformedImage = async function(url, parameters) {
    let transformable = await mediaDao.getTransformableMediaByUrl(url);
    if (transformable === undefined) {
        throw new NotFoundErrorModel('No transformable media found for url ' + url);
    }

    let key = 'media/images/' + crypto.createHash('md5').update(url + '?' + JSON.stringify(parameters)).digest('hex') + '.jpg',
        existingImage = await _getS3Object.call(this, key);

    if (existingImage) {
        return new Promise((resolve, reject) => {
            resolve(existingImage.Body);
        });
    }

    let imageData = await _getImageBufferData(url);

    return new Promise(async (resolve, reject) => {
        let image = gm(imageData);

        if (parameters.blur) {
            image = image.blur(0, parameters.blur);
        }
        if (parameters.resize && parameters.resize.length === 2) {
            image = image.resize(parseFloat(parameters.resize[0]) || null, parseFloat(parameters.resize[1]) || null);
        }

        let buffer;
        try {
            buffer = await _gmToBuffer(image);
            if (buffer) {
                this.s3.putObject({
                    Body: buffer,
                    Bucket: awsConfigs.s3.bucket,
                    Key: key,
                    ContentType: 'image/jpeg'
                }, (error, data) => {
                    if (error) {
                        console.error('Error saving image to S3: ' + JSON.stringify(error));
                    }
                    resolve(buffer);
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

Service.prototype.addTransformableImageUrls = async function(urls) {
    urls = (urls instanceof Array) ? urls : [urls];
    let data = await mediaDao.addTransformableMediaUrls(urls.filter((url) => {
        if (typeof url !== 'string') {
            return url;
        }
        return url.trim() !== '';
    }));
    return {
        success: true
    }
};

Service.prototype.saveImageFromUrl = async function(url) {
    return new Promise(async (resolve, reject) => {
        let buffer = await _getImageBufferData(url),
            key = 'images/' + crypto.createHash('md5').update(url).digest('hex') + '.jpg';
        if (!buffer) {
            return reject('Error getting buffer for image ' + url);
        }
        this.s3.putObject({
            Body: buffer,
            Bucket: awsConfigs.s3.cdnbucket,
            Key: key,
            ContentType: 'image/jpeg'
        }, (error, data) => {
            if (error) {
                return reject(error);
            }
            resolve(key);
        })
    });
};


function _gmToBuffer(data) {
    return new Promise((resolve, reject) => {
        data.stream((err, stdout, stderr) => {
            if (err) { return reject(err) }
            const chunks = [];
            stdout.on('data', (chunk) => { chunks.push(chunk) });
            stdout.once('end', () => { resolve(Buffer.concat(chunks)) });
            stderr.once('data', (data) => { reject(String(data)) });
        })
    })
}

async function _saveImageFromBuffer(buffer, fileKey, retinaSize) {
    let imageSize = await new Promise((resolve, reject) => {
        gm(buffer).size(function (err, size) {
            if (err) {
                return reject(err);
            }
            resolve(size);
        });
    });
    let image = gm(buffer);
    let fileType = fileKey.substr(fileKey.lastIndexOf('.'));

    switch(retinaSize) {
        case 3:
            fileKey = fileKey.replace(fileType, '@3x' + fileType);
            break;
        case 2:
            fileKey = fileKey.replace(fileType, '@2x' + fileType);
            image = image.resize(imageSize.width / 2);
            break;
        case 1:
            fileKey = fileKey.replace(fileType, '@1x' + fileType);
            image = image.resize(imageSize.width / 3);
            break;
    }

    let imageBuffer = await new Promise((resolve, reject) => {
        image.stream((err, stdout, stderr) => {
            if (err) { return reject(err) }
            const chunks = [];
            stdout.on('data', (chunk) => { chunks.push(chunk) });
            stdout.once('end', () => { resolve(Buffer.concat(chunks)) });
            stderr.once('data', (data) => { reject(String(data)) });
        })
    });

    // return new Promise((resolve, reject) => {
    //     resolve();
    // });

    // let _gm = gm(buffer);
    // if (width || height) {
    //     _gm = _gm.resize(width, height);
    // }
    // let image = await new Promise((resolve, reject) => {
    //     _gm.stream((err, stdout, stderr) => {
    //         if (err) { return reject(err) }
    //         const chunks = [];
    //         stdout.on('data', (chunk) => { chunks.push(chunk) });
    //         stdout.once('end', () => { resolve(Buffer.concat(chunks)) });
    //         stderr.once('data', (data) => { reject(String(data)) });
    //     })
    // });

    return new Promise((resolve, reject) => {
        this.s3.putObject({
            Body: imageBuffer,
            Bucket: awsConfigs.s3.cdnbucket,
            Key: fileKey,
            ContentType: 'image/' + fileType.replace('.', '')
        }, (error, data) => {
            if (error) {
                return reject(error);
            }
            resolve(data);
        });
    })
}


async function _saveResizedImage(buffer, fileKey, width, height) {
    let imageSize = await new Promise((resolve, reject) => {
        gm(buffer).size(function (err, size) {
            if (err) {
                return reject(err);
            }
            resolve(size);
        });
    });

    let image = gm(buffer);
    if (width || height) {
        image = image.resize(width, height);
    }

    let fileType = fileKey.substr(fileKey.lastIndexOf('.'));

    let imageBuffer = await new Promise((resolve, reject) => {
        image.stream((err, stdout, stderr) => {
            if (err) { return reject(err) }
            const chunks = [];
            stdout.on('data', (chunk) => { chunks.push(chunk) });
            stdout.once('end', () => { resolve(Buffer.concat(chunks)) });
            stderr.once('data', (data) => { reject(String(data)) });
        })
    });

    return Promise.all(
        [
            _saveImageFromBuffer.call(this, imageBuffer, fileKey),
            _saveImageFromBuffer.call(this, imageBuffer, fileKey, 3),
            _saveImageFromBuffer.call(this, imageBuffer, fileKey, 2),
            _saveImageFromBuffer.call(this, imageBuffer, fileKey, 1)
        ]
    )

}


/**
 * Returns the list of available media types
 *
 * @returns {Promise<MediaTypeListResponseModel>}
 */
Service.prototype.getMediaTypes = async function() {
    let types = await mediaDao.getMediaTypes();
    return new MediaTypeListResponseModel(types.length, types);
};

Service.prototype.getMedia = async function(offset, limit) {
    let data = await Promise.all(
        [
            mediaDao.getTotalMedia(),
            mediaDao.getMedia(offset, limit),
            this.getMediaTypes()
        ]
    );
    return new MediaListResponseModel(data[0], data[1].map((media) => {
        media.type = data[2].types.filter((type) => {
            return type.id === media.type;
        })[0];
        return media;
    }));
};

Service.prototype.addBase64Image = async function(type, base64) {
    let validType = await mediaDao.getMediaTypeById(type);
    if (!validType) {
        throw new InvalidRequestErrorModel('Invalid media type ' + type);
    }

    let fileType = base64.split(';')[0].split('/')[1];
    if (!fileType) {
        throw new InvalidRequestErrorModel('Unable to parse file type. Base64 image should be requested using a standard request formatting.');
    }

    let base64Source = base64.split(',')[1];
    if (!base64Source) {
        throw new InvalidRequestErrorModel('Unable to parse image source. Base64 image should be requested using a standard request formatting.');
    }

    let buffer = new Buffer(base64Source, 'base64'),
        fileKey = 'images/' + new Date().getTime(), // Unique by timestamp. I doubt it'll ever be an issue as parallel requests are unlikely.
        insertResponse = await mediaDao.addMedia(type, fileKey + '.' + fileType, [imageSizeEnum.types.LARGE.label, imageSizeEnum.types.MEDIUM.label, imageSizeEnum.types.SMALL.label], ['1x', '2x', '3x']);

    try {
        await Promise.all(
            [
                _saveResizedImage.call(this, buffer, fileKey + '.' + fileType),
                _saveResizedImage.call(this, buffer, fileKey + '-' + imageSizeEnum.types.LARGE.label + '.' + fileType, imageSizeEnum.types.LARGE.width, imageSizeEnum.types.LARGE.height),
                _saveResizedImage.call(this, buffer, fileKey + '-' + imageSizeEnum.types.MEDIUM.label + '.' + fileType, imageSizeEnum.types.MEDIUM.width, imageSizeEnum.types.MEDIUM.height),
                _saveResizedImage.call(this, buffer, fileKey + '-' + imageSizeEnum.types.SMALL.label + '.' + fileType, imageSizeEnum.types.SMALL.width, imageSizeEnum.types.SMALL.height)
            ]
        )
    } catch (e) {
        console.error(e);
        throw new Error('Unknown error adding media');
    }
    return this.getMediaImageById(insertResponse.insertId);
};

Service.prototype.addVideo = async function(type, video) {
    let validType = await mediaDao.getMediaTypeById(type);
    if (!validType) {
        throw new InvalidRequestErrorModel('Invalid media type ' + type);
    }
};

Service.prototype.getMediaImageById = async function(id) {
    let data = await Promise.all(
        [
            this.getMediaTypes(),
            mediaDao.getMediaById(id)
        ]
    );

    let types = data[0],
        media = data[1];

    if (!types || !types.types) {
        throw new NotFoundErrorModel('Error getting media types for ID ' + id);
    }
    if (!media) {
        throw new NotFoundErrorModel('No media found for ID ' + id);
    }

    media.type = types.types.filter((type) => {
        return type.id === media.type;
    })[0];

    if (!media.type || media.type.type !== 'IMAGE') {
        throw new NotFoundErrorModel('No image found for ID ' + id);
    }

    return new MediaResponseModel(media);
};

Service.prototype.getMediaImagesByIds = async function(ids) {
    ids = ids || [];
    if (ids.length === 0) {
        return new ImageMediaListResponseModel(0, []);
    }

    let data = await Promise.all(
        [
            this.getMediaTypes(),
            mediaDao.getMediaByIds(ids)
        ]
    );

    let types = data[0],
        media = data[1].map((m) => {
            m.type = types.type = types.types.filter((type) => {
                return type.id === m.type;
            })[0];
            return m;
        });

    return new ImageMediaListResponseModel(media.length, media);
};

Service.prototype.getEpisodeVideoBySlug = async function(slug, request = {}, response) {


    const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    const userIdKey = 'clixAffiliateUid';
    const { cookies = {} } = request;
    let userIdCookie = cookies[userIdKey];

    const ipAffiliate = await mediaDao.getAffiliateByIPAddress(ipAddress);
    if (!ipAffiliate) {
        userIdCookie = new Date().getTime().toString();
        await mediaDao.addIPAffiliate(ipAddress, userIdCookie);
    } else {
        userIdCookie = ipAffiliate.unique_id;
    }

    // await mediaDao.addIPAffiliate(ipAddress, new Date().getTime().toString());

    if (!userIdCookie) {
        const userId = new Date().getTime().toString();
        response.cookie(userIdKey, userId, { maxAge: 3600 * 1000 * 24 * 365, sameSite: 'none', secure: true }); // 1 year
        userIdCookie = userId;
    }

    const { hits: { hits } } = await searchService.search('affiliate', {
        query: { match_phrase: { slug } }
    });

    const { _source: source } = hits[0] || {};

    if (!source) {
        throw new Error(`Error looking up video for slug ${slug}`);
    }

    const { id, title, videoId, minPlayTime = 0, endPhoto, autoplay = false, link = '', trackingPixel, inboundAffiliate, outboundAffiliate } = source;

    let userIdParam = '';
    switch ((outboundAffiliate || '').toUpperCase()) {
        case 'AWIN':
            userIdParam = 'clickRef';
            break;
        case 'LINKSHARE':
            userIdParam = 'u1';
            break;
        case 'PEPPERJAM':
            userIdParam = 'sid';
            break;
        case 'SHARE_A_SALE':
            userIdParam = 'afftrack';
            break;
        case 'DEMO':
            break;
        default:
            throw new Error(`Unknown outbound affiliate ${outboundAffiliate}`);
    }

    handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
        return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper('if_eq', function () {
        const args = Array.prototype.slice.call(arguments, 0, -1);
        const options = arguments[arguments.length - 1];
        const allEqual = args.every(function (expression) {
            return args[0] === expression;
        });

        return allEqual ? options.fn(this) : options.inverse(this);
    });

    const template = fs.readFileSync(path.resolve(__dirname, 'resources', 'embedded-episode-template.html'), 'utf8');
    return handlebars.compile(template)({
        inboundAffiliate,
        videoId,
        orderId: new Date().getTime(),
        slug,
        productName: title,
        minPlayTime,
        endPhoto,
        autoplay,
        link: `${link}${link.indexOf('?') === -1 ? '?' : '&'}${userIdParam}=${userIdCookie}`,
        trackingPixel,
        userIdCookie
    });
};

module.exports = new Service();