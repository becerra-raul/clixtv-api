let request = require('request-promise-native');

function TestHelper() {}

TestHelper.prototype.makeGetRequest = async function(url) {
    let response = await request('https://www.clixtv.com/api' + url).auth('clixtv', 'Univtec1@', false);
    return JSON.parse(response);
};

module.exports = new TestHelper();