const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const User = require('../../../models/user');
const assert = require('assert');

describe('Test namespace-related operations', function () {

    var authorization;

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
            newUser.save(done);
        });
    });

    var namespaceId;

    it('should return the created namespace', function (done) {
        server
            .post('/api/v1/namespace')
            .set(authorization)
            .send({name: 'mynamespace', description: 'a description'})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.name === 'mynamespace', 'the name of the created namespace must be returned');
                assert(res.body.data.description === 'a description', 'the description of the created namespace must be returned');
                assert(res.body.data._id, 'the id of the created namespace must be returned');
                namespaceId = res.body.data._id;
                done();
            });
    });

    it('should return a 500 code when trying to create a namespace without name', function (done) {
        server
            .post('/api/v1/namespace')
            .set(authorization)
            .expect(500)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the status must be fail');
                done();
            });
    });

    it('should return the namespaces', function (done) {
        server
            .get('/api/v1/namespace')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is only one namespace');
                done();
            });
    });

    it('should return the details of the namespace', function (done) {
        server
            .get('/api/v1/namespace/' + namespaceId)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.name, 'the name must be returned');
                assert(res.body.data.description, 'the description of the namespace must be returned');
                assert(res.body.data._id, 'the id of the namespace must be returned');
                done();
            });
    });

    it('should return a 404 code when trying to get details of a nonexistent namespace', function (done) {
        server
            .get('/api/v1/namespace/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when trying to update a nonexistent namespace', function (done) {
        server
            .put('/api/v1/namespace/Idontexist')
            .send({name: 'mynewname'})
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return the modified namespace', function (done) {
        server
            .put('/api/v1/namespace/' + namespaceId)
            .send({name: 'mynewname'})
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.name === 'mynewname', 'the name must be returned');
                assert(!res.body.data.description, 'the description must be empty now');
                assert(res.body.data._id, 'the id of the namespace must be returned');
                done();
            });
    });

    it('should return a 500 code when trying to remove namespace\'s name', function (done) {
        server
            .put('/api/v1/namespace/' + namespaceId)
            .set(authorization)
            .expect(500)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the status must be fail');
                done();
            });
    });

    it('should return a 404 code when trying to delete a nonexistent namespace', function (done) {
        server
            .delete('/api/v1/namespace/Idontexist')
            .set(authorization)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when deleting a namespace', function (done) {
        server
            .delete('/api/v1/namespace/' + namespaceId)
            .set(authorization)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });
});