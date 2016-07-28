const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./settingTestDataSet.json');
const insertDataSet = require('./insertDataSet');

describe('Tests operations related to the application settings', function () {

    var authorizationNonAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorizationAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    it('should return the setting value when trying to get application setting as a unauthenticated user', function (done) {
        server
            .get('/setting/subscription')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.subscriptionEnabled === true, 'the subscription must be enabled by default');
                done();
            });
    });

    it('should return a 403 code when trying to set application setting as a non-admin', function (done) {
        server
            .put('/setting/subscription')
            .set(authorizationNonAdmin)
            .send({subscriptionEnabled: false})
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to set application setting as an admin', function (done) {
        server
            .put('/setting/subscription')
            .set(authorizationAdmin)
            .send({subscriptionEnabled: false})
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 400 code when trying to signup through Faya when subscriptions are disabled', function (done) {
        server
            .post('/auth/signup')
            .send({email: 'test@test.com', password: 'apassword'})
            .expect(400)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the setting value when trying to get application\'s setting as a unauthenticated user', function (done) {
        server
            .get('/setting/authentication')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.authMethods, 'the available authentication methods must be returned');
                done();
            });
    });
});