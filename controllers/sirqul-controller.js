let util = require('util'),
    BaseController = require('./base-controller'),
    sirqulService = require('../services/sirqul-service');

function Controller(app) {
    if (!(this instanceof Controller)) {
        return new Controller(app);
    }
    BaseController.call(this, app, {
        path: '/sirqul'
    });
}

util.inherits(Controller, BaseController);

Controller.prototype.registerAllMethods = function() {
    this.registerPostMethod('/analytics/usage', this.analyticsUsage);
    this.registerGetMethod('/geolocation', this.geolocation);

    // ads
    this.registerPostMethod('/ads/find', this.findAds);

    // appConfig
    this.registerGetMethod('/appconfig', this.getAppConfig);
    this.registerGetMethod('/switchconfig', this.getSwitchConfig);
};

Controller.prototype.findAds = async function(request, response){
    try {
        let data = await sirqulService.findAds(request.body);
        this.sendSuccess(response, data)
    } catch (e) {
        console.log(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error finding sirqul ads'
        })
    }
}

Controller.prototype.getAppConfig = async function(request, response){
    try {
        let data = await sirqulService.getAppConfig();
        this.sendSuccess(response, data)
    } catch (e) {
        console.log(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting app Config '
        })
    }
}

Controller.prototype.getSwitchConfig = async function(request, response){
    try {
        let data = await sirqulService.getAppConfig("1.0");
        this.sendSuccess(response, data)
    } catch (e) {
        console.log(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting app Config '
        })
    }
}

Controller.prototype.analyticsUsage = async function(request, response) {
/*
    if (request.accessLevels.indexOf('ANALYTICS') === -1) {
        this.sendForbiddenError(response, {
            error: 'Invalid permissions to access this data'
        });
        return new Promise(() => {});
    }

    let model = new AnalyticsSendGridUsersRequestModel(request.body);
*/
    
    try {
        const currentUser = this.getSessionUser(request);
        request.body.accountId = currentUser.id;
    } catch (error) { }
    
    try {
        request.body.ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            null;
        if(request.body.userAgent){
            let browserData = this.checkUserAgent(request.body.userAgent);
            if(browserData){
                if(browserData.browserName)
                    request.body.device = browserData.browserName;
                // if(browserData.browserVersion)
                //     request.body.deviceOS = browserData.browserVersion;
                if(browserData.osName)
                    request.body.deviceOS = browserData.osName;
                // if(browserData.osVersion)
                //     request.body.deviceOS = browserData.browserVersion;
            }
        }
        let data = await sirqulService.analyticsUsage(request.body);
        this.sendSuccess(response, data);
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error sending sirqul analtyics'
        })
    }
};

Controller.prototype.geolocation = async function(request, response) {
    try {
        let query = request.query;
        if (!query.ip) {
            let ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            null;
            query.ip = ip;
        }
        if (query.hasOwnProperty('debug')) {
            let debugResponse = {}; 
            debugResponse.headers = request.headers;
            debugResponse.conRemoteAddress = request.connection.remoteAddress;
            debugResponse.socRemoteAddress = request.socket.remoteAddress;
            debugResponse.finalIP = query.ip;

            this.sendSuccess(response, debugResponse);
        } else {
            let data = await sirqulService.geolocation(query);
            this.sendSuccess(response, data);
        }
    } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        this.sendServerError(response, {
            error: 'Error getting geolocation'
        })
    }
};

Controller.prototype.checkUserAgent = function(userAgent){

    let unknown = '';

    // browser
    let nVer = unknown;
    let nAgt = userAgent;
    let browser = unknown;
    let version = unknown;
    let os = unknown;
    let osVersion = unknown;
    let nameOffset, verOffset, ix;

    try{
        // Facebook in-app browser
        if (nAgt.indexOf('FBAN') != -1 || nAgt.indexOf('FBAV') != -1) {
            browser = 'Facebook';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        } else {
            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // Opera Next
            if ((verOffset = nAgt.indexOf('OPR')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 4);
            }
            // Legacy Edge
            else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
                browser = 'Microsoft Legacy Edge';
                version = nAgt.substring(verOffset + 5);
            }
            // Edge (Chromium)
            else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
                browser = 'Microsoft Edge';
                version = nAgt.substring(verOffset + 4);
            }
            // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
            }
            // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                browser = 'Chrome';
                version = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                browser = 'Safari';
                version = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                browser = 'Firefox';
                version = nAgt.substring(verOffset + 8);
            }
            // MSIE 11+
            else if (nAgt.indexOf('Trident/') != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(nAgt.indexOf('rv:') + 3);
            }
            // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                version = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() == browser.toUpperCase()) {
                    browser = "others";
                }
            }
        }

        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        let clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Chrome OS', r:/CrOS/},
            {s:'Linux', r:/(Linux|X11(?!.*CrOS))/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (let id in clientStrings) {
            let cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS':
            case 'Mac OS X':
            case 'Android':
                osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }
    } catch (e){
        console.log(e);
    }

    let result =  {
        browserName : browser,
        browserVersion: version,
        osName: os,
        osVersion: osVersion
    };
    return result;
}

module.exports = Controller;