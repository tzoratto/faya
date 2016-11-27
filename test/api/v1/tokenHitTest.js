const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./tokenHitTestDataSet.json');
const insertDataSet = require('../../insertDataSet');

describe('Test token hit related operations', function () {

    var authorization = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };

    var authorization2 = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };

    var token1Id = dataSet.Token[0]._id;
    var token2Id = dataSet.Token[1]._id;

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    it('should return the number of token hits requested', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=1&page=1')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one item was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 items');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one item should be returned');
                done();
            });
    });

    it('should return a 403 when trying to get token history of another user', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=1&page=1')
            .set(authorization2)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the number of token hits requested on page 2', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=1&page=2')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one item was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 items');
                assert.strictEqual(res.body.data.page, 2, 'page 2 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one item should be returned');
                done();
            });
    });

    it('should return empty result when pagination is off limit', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=10&page=4')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 0, '10 items were requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 items');
                assert.strictEqual(res.body.data.page, 4, 'page 4 is requested');
                assert.strictEqual(res.body.data.result.length, 0, 'no item should be returned');
                done();
            });
    });

    it('should return the number of token hits requested ordered by asc date', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=10&sort=date')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].date, '2016-11-08T21:04:52.291Z', 'token hits should be ordered by date');
                assert.strictEqual(res.body.data.result[1].date, '2016-11-09T21:04:52.291Z', 'token hits should be ordered by date');
                assert.strictEqual(res.body.data.result[2].date, '2016-11-10T21:04:52.291Z', 'token hits should be ordered by date');
                done();
            });
    });

    it('should return the number of token hits requested ordered by desc date', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=10&sort=-date')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].date, '2016-11-10T21:04:52.291Z', 'token hits should be ordered by date');
                assert.strictEqual(res.body.data.result[1].date, '2016-11-09T21:04:52.291Z', 'token hits should be ordered by date');
                assert.strictEqual(res.body.data.result[2].date, '2016-11-08T21:04:52.291Z', 'token hits should be ordered by date');
                done();
            });
    });

    it('should return the number of token hits requested ordered by desc description', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=1&page=3&sort=-date')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].date, '2016-11-08T21:04:52.291Z', 'token hits should be ordered by date');
                done();
            });
    });
});