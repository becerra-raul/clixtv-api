let AWS = require('aws-sdk'),
    request = require('request-promise-native'),
    apiUtils = require('../utils/api-utils'),
    awsConfigs = apiUtils.getAWSConfig(),
    univtecConfigs = apiUtils.getUnivtecConfig();

function Service() {
    this.s3 = new AWS.S3({
        accessKeyId: awsConfigs.key,
        secretAccessKey: awsConfigs.secret
    });
}

Service.prototype.getProxyRequest = async function(url) {
    return new Promise((resolve, reject) => {
        let key = 'data' + url + '.json';
        this.s3.getObject({
            Bucket: awsConfigs.s3.bucket,
            Key: key
        }, (error, data) => {
            if (error || !data || !data.Body) {
                return reject(error || 'Invalid data returned for url ' + url);
            }
            resolve(JSON.parse(data.Body.toString()));
        });
    });
};

Service.prototype.postProxyRequest = async function(url, data) {
    let response = await request({
        url: univtecConfigs.url + url,
        body: JSON.stringify(data)
    }).auth(univtecConfigs.username, univtecConfigs.password, false);
    return JSON.parse(response);
};

module.exports = new Service();