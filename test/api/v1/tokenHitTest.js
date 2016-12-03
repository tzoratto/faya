const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./tokenHitTestDataSet.json');
const insertDataSet = require('../../insertDataSet');
const TokenHit = require('../../../models/tokenHit');
const async = require('async');

describe('Test token hit related operations', function () {

    var authorization = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };

    var authorization2 = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };

    var token1Id = dataSet.Token[0]._id;
    var token2Id = dataSet.Token[1]._id;
    var tokenHit4 = dataSet.TokenHit[3]._id;
    var tokenHit5 = dataSet.TokenHit[4]._id;
    var tokenHit6 = dataSet.TokenHit[5]._id;

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
                assert(res.body.data.result[0].token, 'the token property should be returned');
                assert(res.body.data.result[0].namespace, 'the namespace property should be returned');
                assert(res.body.data.result[0].user, 'the user property should be returned');
                done();
            });
    });

    it('should return an empty result when trying to get token history of another user', function (done) {
        server
            .get('/api/v1/token/' + token1Id + '/history?limit=1&page=1')
            .set(authorization2)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 0, 'no item should be returned');
                assert.strictEqual(res.body.data.totalCount, 0, 'total of items should be 0');
                done();
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

    it('should return history grouped by months for the last 12 months', function (done) {
        var oneMonthAgoDate = new Date();
        oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
        var oneMonthAgo = oneMonthAgoDate.getUTCMonth();
        var twoMonthsAgoDate = new Date();
        twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
        var twoMonthsAgo = twoMonthsAgoDate.getUTCMonth();
        async.parallel(
            [
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit4}, {$set: {date: twoMonthsAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit5}, {$set: {date: twoMonthsAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit6}, {$set: {date: oneMonthAgoDate}}, callback);
                }
            ],
            function (err) {
                if (err) {
                    throw err;
                }
                server
                    .get('/api/v1/token/' + token2Id + '/history/year')
                    .set(authorization)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        assert.strictEqual(res.body.data.length, 12, 'we want 12 months of data');
                        assert.strictEqual(res.body.data[twoMonthsAgo].count, 2, 'there are 2 hits two months ago');
                        assert.strictEqual(res.body.data[oneMonthAgo].count, 1, 'there is 1 hit one month ago');
                        done();
                    });
            });
    });

    it('should return history grouped by days for the last 30 days', function (done) {
        var oneDayAgoDate = new Date();
        oneDayAgoDate.setDate(oneDayAgoDate.getDate() - 1);
        var oneDayAgo = oneDayAgoDate.getUTCDate();
        var twoDaysAgoDate = new Date();
        twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
        var twoDaysAgo = twoDaysAgoDate.getUTCDate();
        async.parallel(
            [
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit4}, {$set: {date: twoDaysAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit5}, {$set: {date: twoDaysAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit6}, {$set: {date: oneDayAgoDate}}, callback);
                }
            ],
            function (err) {
                if (err) {
                    throw err;
                }
                server
                    .get('/api/v1/token/' + token2Id + '/history/month')
                    .set(authorization)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        assert(res.body.data.length >= 28 && res.body.data.length <= 31, 'we want a month of data');
                        var indexTwoDaysAgo = twoDaysAgo - 1 >= 0 ? twoDaysAgo - 1 : res.body.data.length - 1;
                        var indexOneDayAgo = oneDayAgo - 1 >= 0 ? oneDayAgo - 1 : res.body.data.length - 1;
                        assert.strictEqual(res.body.data[indexTwoDaysAgo].count, 2, 'there are 2 hits two days ago');
                        assert.strictEqual(res.body.data[indexOneDayAgo].count, 1, 'there is 1 hit one day ago');
                        done();
                    });
            });
    });

    it('should return history grouped by hours for the last 24 hours', function (done) {
        var oneHourAgoDate = new Date();
        oneHourAgoDate.setHours(oneHourAgoDate.getHours() - 1);
        var oneHourAgo = oneHourAgoDate.getUTCHours();
        var twoHoursAgoDate = new Date();
        twoHoursAgoDate.setHours(twoHoursAgoDate.getHours() - 2);
        var twoHoursAgo = twoHoursAgoDate.getUTCHours();
        async.parallel(
            [
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit4}, {$set: {date: twoHoursAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit5}, {$set: {date: twoHoursAgoDate}}, callback);
                },
                function (callback) {
                    TokenHit.findOneAndUpdate({'_id': tokenHit6}, {$set: {date: oneHourAgoDate}}, callback);
                }
            ],
            function (err) {
                if (err) {
                    throw err;
                }
                server
                    .get('/api/v1/token/' + token2Id + '/history/day')
                    .set(authorization)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        assert.strictEqual(res.body.data.length, 24, 'we want 24 hours of data');
                        assert.strictEqual(res.body.data[twoHoursAgo].count, 2, 'there are 2 hits two hours ago');
                        assert.strictEqual(res.body.data[oneHourAgo].count, 1, 'there is 1 hit one hour ago');
                        done();
                    });
            });
    });
});