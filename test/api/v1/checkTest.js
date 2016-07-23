const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./checkTestDataSet.json');
const insertDataSet = require('../../insertDataSet');

describe('Tests token check', function () {

    var authorization = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };
    var token1Value = dataSet.Token[0].value,
        token2Value = dataSet.Token[1].value,
        token3Value = dataSet.Token[2].value;
    var namespace1Name = dataSet.Namespace[0].name;

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    it('should indicate that the token has never been checked', function (done) {
        server
            .get('/api/v1/token?q=' + token1Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data[0].count === 0, 'the counter must be at 0');
                done();
            });
    });

    it('should confirm that the token is valid against this namespace', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace1Name + '&token=' + token1Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'success', 'the token must be valid');
                done();
            });
    });

    it('should indicate that the token has been checked once', function (done) {
        server
            .get('/api/v1/token?q=' + token1Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data[0].count === 1, 'the counter must be at 1');
                done();
            });
    });

    it('should confirm that the token is invalid against this namespace', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace1Name + '&token=yay')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the token must be invalid');
                done();
            });
    });

    it('should confirm that the token is invalid against this namespace', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace1Name + '&token=' + token3Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the token must be invalid');
                done();
            });
    });

    it('should indicate that the token has been checked once', function (done) {
        server
            .get('/api/v1/token?q=' + token3Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data[0].count === 1, 'the counter must be at 1');
                done();
            });
    });

    it('should confirm that the token is invalid against this namespace', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace1Name + '&token=' + token2Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the token must be invalid');
                done();
            });
    });

});