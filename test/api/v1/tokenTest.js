const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const User = require('../../../models/user');
const assert = require('assert');

describe('Test token-related operations', function () {

    var authorization;
    var namespaceId;

    before(function (done) {
        User.remove({}, function (err) {
            if (err) {
                throw err;
            }
            var newUser = new User();

            var apiKey = {keyId: 'anId', keySecret: 'aSecret'};
            newUser.apiKeyPairs.push(apiKey);
            authorization = {
                "Authorization": "Basic: " + new Buffer(apiKey.keyId + ':' + apiKey.keySecret).toString('base64')
            };
            var namespace = newUser.namespaces.create({
                name: 'mynamespace'
            });
            namespaceId = namespace._id;
            newUser.namespaces.push(namespace);
            newUser.save(done);
        });
    });

    var tokenId;

    it('should return the created token', function (done) {
        server
            .post('/api/v1/namespace/' + namespaceId + '/token')
            .set(authorization)
            .send({description: 'a description'})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.value, 'the token\'s value must be returned');
                assert(res.body.data.description === 'a description', 'the description of the created token must be returned');
                assert(res.body.data._id, 'the id of the created namespace must be returned');
                tokenId = res.body.data._id;
                done();
            });
    });

    it('should return matching tokens when searching', function (done) {
        server
            .get('/api/v1/namespace/' + namespaceId + '/token?q=desc')
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
            .get('/api/v1/namespace/' + namespaceId + '/token?q=yay')
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
            .get('/api/v1/namespace/' + namespaceId + '/token')
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

    it('should return the details of the token', function (done) {
        server
            .get('/api/v1/namespace/' + namespaceId + '/token/' + tokenId)
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
            .get('/api/v1/namespace/' + namespaceId + '/token/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when trying to update a nonexistent token', function (done) {
        server
            .put('/api/v1/namespace/' + namespaceId + '/token/Idontexist')
            .send({description: 'my new description'})
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the modified token', function (done) {
        server
            .put('/api/v1/namespace/' + namespaceId + '/token/' + tokenId)
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

    it('should return a 404 code when trying to delete a nonexistent token', function (done) {
        server
            .delete('/api/v1/namespace/' + namespaceId + '/token/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when deleting a namespace', function (done) {
        server
            .delete('/api/v1/namespace/' + namespaceId + '/token/' + tokenId)
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });
});