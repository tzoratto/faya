const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
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
        token3Value = dataSet.Token[2].value,
        token4Value = dataSet.Token[3].value,
        token5Value = dataSet.Token[4].value,
        token6Value = dataSet.Token[5].value,
        token7Value = dataSet.Token[6].value,
        token8Value = dataSet.Token[7].value,
        token9Value = dataSet.Token[8].value,
        token10Value = dataSet.Token[9].value,
        token11Value = dataSet.Token[10].value,
        token12Value = dataSet.Token[11].value,
        token13Value = dataSet.Token[12].value,
        token14Value = dataSet.Token[13].value;
    var namespace1Name = dataSet.Namespace[0].name,
        namespace2Name = dataSet.Namespace[1].name;

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
                assert.strictEqual(res.body.data.result[0].count, 0, 'the counter must be at 0');
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

    it('should confirm that the token is still valid', function (done) {
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

    it('should indicate that the token has been validated twice', function (done) {
        server
            .get('/api/v1/token?q=' + token1Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].count, 2, 'the counter must be at 2');
                done();
            });
    });

    it('should confirm that the token is invalid because it doesn\'t exist', function (done) {
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

    it('should indicate that the token hasn\'t been validated', function (done) {
        server
            .get('/api/v1/token?q=' + token3Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].count, 0, 'the counter must be at 0');
                done();
            });
    });

    it('should confirm that the token is invalid because the active property is false', function (done) {
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

    it('should confirm that the token is invalid because the startsAt property is in the future', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token4Value)
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

    it('should confirm that the token is invalid because the endsAt property is in the past', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token5Value)
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

    it('should confirm that the token is valid', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token6Value)
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

    it('should confirm that the token is invalid because the active property is false', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token7Value)
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

    it('should confirm that the token is valid', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token8Value)
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

    it('should confirm that the token is invalid because the endsAt property is in the past', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token9Value)
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

    it('should confirm that the token is invalid because the pool is empty', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token10Value)
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

    it('should confirm that the token is valid', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token11Value)
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

    it('should confirm that the token is invalid because the active property is false', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token12Value)
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

    it('should confirm that the token is invalid because the pool is empty', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token13Value)
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

    it('should confirm that the token is valid', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token14Value)
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

    it('should confirm that the token is invalid because the pool is now empty', function (done) {
        server
            .get('/api/v1/check?namespace=' + namespace2Name + '&token=' + token14Value)
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