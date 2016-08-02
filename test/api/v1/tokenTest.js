const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./tokenTestDataSet.json');
const insertDataSet = require('../../insertDataSet');

describe('Test token-related operations', function () {

    var authorization = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorizationAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };
    var namespaceId = dataSet.Namespace[0]._id;
    var userId = dataSet.User[0]._id;

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    var tokenId;

    it('should return the created token', function (done) {
        server
            .post('/api/v1/token')
            .set(authorization)
            .send({
                namespace: namespaceId,
                description: 'a description'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.namespace, 'the token\'s namespace must be returned');
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(res.body.data.description === 'a description', 'the description of the created token must be returned');
                assert(res.body.data._id, 'the id of the created namespace must be returned');
                tokenId = res.body.data._id;
                done();
            });
    });

    it('should return a 404 code when trying to create a token in a nonexistent namespace', function (done) {
        server
            .post('/api/v1/token')
            .set(authorization)
            .send({
                namespace: 'yay',
                description: 'a description'
            })
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when trying to search a token in a nonexistent namespace', function (done) {
        server
            .get('/api/v1/token?q=desc&namespace=yay')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return matching tokens when searching', function (done) {
        server
            .get('/api/v1/token?q=desc&namespace=' + namespaceId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is one token matching the search');
                done();
            });
    });

    it('should return matching tokens when searching', function (done) {
        server
            .get('/api/v1/token?q=yay&namespace' + namespaceId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 0, 'there is no token matching the search');
                done();
            });
    });

    it('should return matching tokens when searching', function (done) {
        server
            .get('/api/v1/token?q=desc')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is one token matching the search');
                done();
            });
    });

    it('should return matching tokens when searching', function (done) {
        server
            .get('/api/v1/token?q=yay')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 0, 'there is no token matching the search');
                done();
            });
    });

    it('should return the tokens', function (done) {
        server
            .get('/api/v1/token?namespace=' + namespaceId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is only one token');
                done();
            });
    });

    it('should return a 404 code when trying to list the tokens of a nonexistent namespace', function (done) {
        server
            .get('/api/v1/token?namespace=yay')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the details of the token', function (done) {
        server
            .get('/api/v1/token/' + tokenId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(res.body.data.description, 'the description of the token must be returned');
                assert(res.body.data._id, 'the id of the token must be returned');
                done();
            });
    });

    it('should return a 404 code when trying to get details of a nonexistent token', function (done) {
        server
            .get('/api/v1/token/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when trying to update a nonexistent token', function (done) {
        server
            .put('/api/v1/token/Idontexist')
            .send({description: 'my new description'})
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the modified token', function (done) {
        server
            .put('/api/v1/token/' + tokenId)
            .send({description: 'my new description'})
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(res.body.data.description === 'my new description', 'the description must be updated and returned');
                assert(res.body.data._id, 'the id of the token must be returned');
                done();
            });
    });

    it('should return the created token', function (done) {
        var startsAt = new Date(Date.UTC(2010, 0, 1)),
            endsAt = new Date(Date.UTC(2010, 1, 1));

        server
            .post('/api/v1/token')
            .send({
                namespace: namespaceId,
                description: 'a description',
                startsAt: startsAt,
                endsAt: endsAt,
                active: false,
                pool: 10
            })
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(res.body.data.description, 'the description must be returned');
                assert(res.body.data.pool === 10, 'the new pool property must be returned');
                assert(new Date(res.body.data.startsAt).getTime() === startsAt.getTime(), 'the new startsAt property must be returned');
                assert(new Date(res.body.data.endsAt).getTime() === endsAt.getTime(), 'the new endsAt property must be returned');
                assert(res.body.data._id, 'the id of the token must be returned');
                done();
            });
    });

    it('should return the modified token', function (done) {
        var startsAt = new Date(Date.UTC(2010, 0, 1)),
            endsAt = new Date(Date.UTC(2010, 1, 1));

        server
            .put('/api/v1/token/' + tokenId)
            .send({startsAt: startsAt, endsAt: endsAt, active: false, pool: 10})
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(!res.body.data.description, 'the description must be empty now');
                assert(res.body.data.pool === 10, 'the new pool property must be returned');
                assert(new Date(res.body.data.startsAt).getTime() === startsAt.getTime(), 'the new startsAt property must be returned');
                assert(new Date(res.body.data.endsAt).getTime() === endsAt.getTime(), 'the new endsAt property must be returned');
                assert(res.body.data._id, 'the id of the token must be returned');
                done();
            });
    });

    it('should return the modified token', function (done) {
        server
            .put('/api/v1/token/' + tokenId)
            .send({active: false})
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(!res.body.data.pool, 'the pool property must be absent now');
                assert(!res.body.data.startsAt, 'the startsAt property must be absent now');
                assert(!res.body.data.endsAt, 'the endsAt property must be absent now');
                assert(res.body.data._id, 'the id of the token must be returned');
                done();
            });
    });

    it('should return a 200 code when trying to update the description', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/description')
            .send({description: 'again a description'})
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to empty the description', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/description')
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to update the active property', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/activation')
            .send({active: false})
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to update the startsAt property', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/starting-date')
            .send({startsAt: new Date()})
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to remove the startsAt property', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/starting-date')
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to update the endsAt property', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/ending-date')
            .send({endsAt: new Date()})
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to remove the endsAt property', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/ending-date')
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to update the pool', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/pool')
            .send({pool: 5})
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to remove the pool', function (done) {
        server
            .put('/api/v1/token/' + tokenId + '/pool')
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when trying to delete a nonexistent token', function (done) {
        server
            .delete('/api/v1/token/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when deleting a token', function (done) {
        server
            .delete('/api/v1/token/' + tokenId)
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the number of tokens', function (done) {
        server
            .get('/api/v1/token/count')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.count === 1, 'there is one token');
                done();
            });
    });

    it('should return a 403 code when trying to get the number of tokens as a non-admin', function (done) {
        server
            .get('/api/v1/token/count')
            .set(authorization)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the number of user\'s tokens', function (done) {
        server
            .get('/api/v1/token/count?user=' + userId)
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.count === 1, 'the user has 1 token');
                done();
            });
    });

    it('should return a 403 code when trying to get user\'s tokens count as a non-admin', function (done) {
        server
            .get('/api/v1/token/count?user=' + userId)
            .set(authorization)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });
});