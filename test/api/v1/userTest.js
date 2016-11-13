const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./userTestDataSet.json');
const insertDataSet = require('./../../insertDataSet');

describe('Tests user-related operations', function () {

    var authorizationNonAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorizationAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };

    var userId = dataSet.User[1]._id,
        userId2 = dataSet.User[2]._id,
        adminId = dataSet.User[0]._id;

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    it('should return the user list', function (done) {
        server
            .get('/api/v1/user')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 4, 'there are 4 users');
                assert.strictEqual(res.body.data.result[0].apiKeyPairs, undefined, 'user\'s api key pairs shouldn\'t be returned');
                assert.strictEqual(res.body.data.result[0].local.password, undefined, 'user\'s password shouldn\'t be returned');
                done();
            });
    });

    it('should return matching users when searching', function (done) {
        server
            .get('/api/v1/user?q=test')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'there is 1 user matching the query');
                done();
            });
    });

    it('should return a 403 code when trying to get the user list as a non-admin', function (done) {
        server
            .get('/api/v1/user')
            .set(authorizationNonAdmin)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return user\'s details', function (done) {
        server
            .get('/api/v1/user/' + userId)
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.local.email === 'local2@local.com', 'the user\'s email must be returned');
                assert(!res.body.data.apiKeyPairs, 'the user\'s api key pairs musn\'t be returned');
                done();
            });
    });

    it('should return user\'s details', function (done) {
        server
            .get('/api/v1/user/' + userId)
            .set(authorizationNonAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.local.email === 'local2@local.com', 'the user\'s email must be returned');
                assert(res.body.data.apiKeyPairs, 'the user\'s api key pairs must be returned');
                done();
            });
    });

    it('should return a 403 code when trying to get details of another user as a non-admin', function (done) {
        server
            .get('/api/v1/user/' + userId2)
            .set(authorizationNonAdmin)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 403 code when trying to delete another user\'s account', function (done) {
        server
            .delete('/api/v1/user/' + userId2)
            .set(authorizationNonAdmin)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 403 code when trying to delete another user\'s account', function (done) {
        server
            .delete('/api/v1/user/' + userId2 + '?user=' + userId)
            .set(authorizationNonAdmin)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when trying to delete user\'s own account', function (done) {
        server
            .delete('/api/v1/user/' + userId)
            .set(authorizationNonAdmin)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 400 code when trying to delete admin\'s account', function (done) {
        server
            .delete('/api/v1/user/' + adminId)
            .set(authorizationAdmin)
            .expect(400)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the number of users requested', function (done) {
        server
            .get('/api/v1/user?limit=1&page=1')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one user was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 users');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one user should be returned');
                done();
            });
    });

    it('should return the number of users requested on page 2', function (done) {
        server
            .get('/api/v1/user?limit=1&page=2')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one user was requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 users');
                assert.strictEqual(res.body.data.page, 2, 'page 2 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one user should be returned');
                done();
            });
    });

    it('should return the number of users requested matching filter', function (done) {
        server
            .get('/api/v1/user?q=yet&limit=10&page=1')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 1, 'only one user was requested');
                assert.strictEqual(res.body.data.totalCount, 1, 'there is 1 user that matchs filter');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 1, 'only one user should be returned');
                done();
            });
    });

    it('should return the number of users requested matching filter', function (done) {
        server
            .get('/api/v1/user?q=local&limit=10&page=1')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 2, 'ten users were requested');
                assert.strictEqual(res.body.data.totalCount, 2, 'there are 2 users that matchs filter');
                assert.strictEqual(res.body.data.page, 1, 'page 1 is requested');
                assert.strictEqual(res.body.data.result.length, 2, 'two users should be returned');
                done();
            });
    });

    it('should return empty result when pagination is off limit', function (done) {
        server
            .get('/api/v1/user?limit=10&page=4')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 0, 'ten users were requested');
                assert.strictEqual(res.body.data.totalCount, 3, 'there are 3 users');
                assert.strictEqual(res.body.data.page, 4, 'page 4 is requested');
                assert.strictEqual(res.body.data.result.length, 0, 'no user should be returned');
                done();
            });
    });

    it('should return the number of users requested ordered by asc email', function (done) {
        server
            .get('/api/v1/user?limit=10&sort=local.email')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].local.email, 'local@local.com', 'users should be ordered by email');
                assert.strictEqual(res.body.data.result[1].local.email, 'test@local.com', 'users should be ordered by email');
                assert.strictEqual(res.body.data.result[2].local.email, 'yetanother@email.com', 'users should be ordered by email');
                done();
            });
    });

    it('should return the number of users requested ordered by desc email', function (done) {
        server
            .get('/api/v1/user?limit=10&sort=-local.email')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].local.email, 'yetanother@email.com', 'users should be ordered by email');
                assert.strictEqual(res.body.data.result[1].local.email, 'test@local.com', 'users should be ordered by email');
                assert.strictEqual(res.body.data.result[2].local.email, 'local@local.com', 'users should be ordered by email');
                done();
            });
    });

    it('should return the number of users requested ordered by desc email', function (done) {
        server
            .get('/api/v1/user?limit=1&page=3&sort=-local.email')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.result[0].local.email, 'local@local.com', 'users should be ordered by email');
                done();
            });
    });

    it('should return the number of users requested non ordered', function (done) {
        server
            .get('/api/v1/user?limit=10&sort=yay')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert.strictEqual(res.body.data.resultCount, 3, '3 users should be returned');
                done();
            });
    });

});