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
    var authorization2 = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[2].apiKeyPairs[0].keyId + ':' + dataSet.User[2].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorizationAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorization4 = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[3].apiKeyPairs[0].keyId + ':' + dataSet.User[3].apiKeyPairs[0].keySecret).toString('base64')
    };

    var namespaceId = dataSet.Namespace[0]._id;
    var namespaceUser4Id = dataSet.Namespace[2]._id;
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
                assert(res.body.data._id, 'the id of the created token must be returned');
                assert(res.body.data.user, 'the user of the created token must be returned');
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

    it('should return a 400 code when the query string is an invalid regex', function (done) {
        server
            .get('/api/v1/token?q=*')
            .set(authorization)
            .expect(400)
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
                assert(res.body.data.resultCount === 1, 'there is one token matching the search');
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
                assert(res.body.data.resultCount === 0, 'there is no token matching the search');
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
                assert(res.body.data.resultCount === 1, 'there is one token matching the search');
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
                assert(res.body.data.resultCount === 0, 'there is no token matching the search');
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
                assert.strictEqual(res.body.data.resultCount, 1, 'there is only one token in this namespace');
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
                assert.strictEqual(res.body.data.count, 5, 'there are 5 tokens');
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
                assert(res.body.data.count === 2, 'the user has 2 tokens');
                done();
            });
    });

    it('should return a 403 code when trying to get user\'s tokens count as a non-admin', function (done) {
        server
            .get('/api/v1/token/count?user=' + userId)
            .set(authorization2)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the number of tokens when a user tries to get the number of tokens it owns', function (done) {
        server
            .get('/api/v1/token/count?user=' + userId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.count === 2, 'the user has 2 tokens');
                done();
            });
    });

    it('should return the number of tokens requested', function (done) {
        server
            .get('/api/v1/token?limit=1&page=1&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one token was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 tokens');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one token should be returned');
                done();
            });
    });

    it('should return the number of tokens requested on page 2', function (done) {
        server
            .get('/api/v1/token?limit=1&page=2&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one token was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 tokens');
                assert.strictEqual(res.body.data.page, 2, 'page 2 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one token should be returned');
                done();
            });
    });

    it('should return the number of tokens requested matching filter', function (done) {
        server
            .get('/api/v1/token?q=first&limit=10&page=1&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one token was requested');
                assert.strictEqual(res.body.data.totalCount, 1, 'there is 1 token that matchs filter');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one token should be returned');
                done();
            });
    });

    it('should return the number of tokens requested matching filter', function (done) {
        server
            .get('/api/v1/token?q=ir&limit=10&page=1&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 2, 'ten tokens were requested');
                assert.strictEqual(res.body.data.totalCount, 2, 'there are 2 tokens that matchs filter');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 2, 'two tokens should be returned');
                done();
            });
    });

    it('should return empty result when pagination is off limit', function (done) {
        server
            .get('/api/v1/token?limit=10&page=4')
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 0, 'ten tokens were requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 tokens');
                assert.strictEqual(res.body.data.page, 4, 'page 4 is requested');
                assert.strictEqual(res.body.data.result.length, 0, 'no token should be returned');
                done();
            });
    });

    it('should return the number of tokens requested ordered by asc description', function (done) {
        server
            .get('/api/v1/token?limit=10&sort=description&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].description, 'my first token', 'tokens should be ordered by description');
                assert.strictEqual(res.body.data.result[1].description, 'my second token', 'tokens should be ordered by description');
                assert.strictEqual(res.body.data.result[2].description, 'my third token', 'tokens should be ordered by description');
                done();
            });
    });

    it('should return the number of tokens requested ordered by desc description', function (done) {
        server
            .get('/api/v1/token?limit=10&sort=-description&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].description, 'my third token', 'tokens should be ordered by description');
                assert.strictEqual(res.body.data.result[1].description, 'my second token', 'tokens should be ordered by description');
                assert.strictEqual(res.body.data.result[2].description, 'my first token', 'tokens should be ordered by description');
                done();
            });
    });

    it('should return the number of tokens requested ordered by desc description', function (done) {
        server
            .get('/api/v1/token?limit=1&page=3&sort=-description&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].description, 'my first token', 'tokens should be ordered by description');
                done();
            });
    });

    it('should return the number of tokens requested non ordered', function (done) {
        server
            .get('/api/v1/token?limit=10&sort=yay&namespace=' + namespaceUser4Id)
            .set(authorization4)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 3, '3 tokens should be returned');
                done();
            });
    });
});