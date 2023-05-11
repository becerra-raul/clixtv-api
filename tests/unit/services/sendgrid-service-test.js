let expect = require('chai').expect,
    rewire = require('rewire'),
    InvalidRequestErrorModel = require('../../../models/invalid-request-error-model'),
    service;

describe('SendGrid Service Test', function() {
    before(() => {

        service = rewire('../../../services/sendgrid-service');

        service.__set__('apiUtils', {
            getSendGridConfig: function() {}
        });

        service.__set__('sendGrid', {
            emptyRequest: function () {
                return {};
            },
            API: function (request, callback) {
                callback(null, {statusCode: 200});
            }
        });

        service.__set__('_sendEmail', async () => {
            return new Promise((resolve, reject) => {
                resolve({});
            });
        });

        service.getTemplateById = async () => {
            return new Promise((resolve, reject) => {
                resolve({
                    body: {
                        versions: [
                            {
                                subject: 'Test',
                                html_content: '<p>Test</p>'
                            }
                        ]
                    }
                })
            })
        };
    });

    describe('#addUser(...)', () => {

        it('should return a successful response', async () => {
            let response = await service.addUser('john.smith@example.com', 'John', 'Smith');
            expect(response).is.an('object');
            expect(response.success).to.equal(true);
        });

        it('should throw an error if the email is not provided', async () => {
            let response;
            try {
                response = await service.addUser();
            } catch (e) {
                expect(e).to.be.an.instanceof(InvalidRequestErrorModel);
            }
            expect(response).to.equal(undefined);
        });
    });
});