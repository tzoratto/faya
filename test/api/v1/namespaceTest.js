const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./namespaceTestDataSet.json');
const insertDataSet = require('../../insertDataSet');

describe('Test namespace-related operations', function () {

    var authorization = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[0].apiKeyPairs[0].keyId + ':' + dataSet.User[0].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorization2 = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[1].apiKeyPairs[0].keyId + ':' + dataSet.User[1].apiKeyPairs[0].keySecret).toString('base64')
    };
    var authorizationAdmin = {
        "Authorization": "Basic: " + new Buffer(dataSet.User[2].apiKeyPairs[0].keyId + ':' + dataSet.User[2].apiKeyPairs[0].keySecret).toString('base64')
    };
    var userId = dataSet.User[1]._id;

    before(function (done) {
        insertDataSet(dataSet, done);
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

    it('should return matching namespaces when searching', function (done) {
        server
            .get('/api/v1/namespace?q=desc')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is one namespace matching the search');
                done();
            });
    });

    it('should return a 400 code when trying to create a namespace with a name already in use', function (done) {
        server
            .post('/api/v1/namespace')
            .set(authorization)
            .send({name: 'mynamespace', description: 'a description'})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.status === 'fail', 'the status must be fail');
                done();
            });
    });

    it('should return the created namespace', function (done) {
        server
            .post('/api/v1/namespace')
            .set(authorization2)
            .send({name: 'mynamespace', description: 'a description'})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.name === 'mynamespace', 'the name of the created namespace must be returned');
                assert(res.body.data.description === 'a description', 'the description of the created namespace must be returned');
                assert(res.body.data._id, 'the id of the created namespace must be returned');
                done();
            });
    });

    it('should return a 400 code when trying to create a namespace without name', function (done) {
        server
            .post('/api/v1/namespace')
            .set(authorization)
            .expect(400)
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

    it('should return matching namespaces when searching', function (done) {
        server
            .get('/api/v1/namespace?q=new')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, 'there is one namespace matching the search');
                done();
            });
    });

    it('should return matching namespaces when searching', function (done) {
        server
            .get('/api/v1/namespace?q=yay')
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 0, 'there is no namespace matching the search');
                done();
            });
    });

    it('should return a 400 code when trying to remove namespace\'s name', function (done) {
        server
            .put('/api/v1/namespace/' + namespaceId)
            .set(authorization)
            .expect(400)
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

    it('should return the number of namespaces', function (done) {
        server
            .get('/api/v1/namespace/count')
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.count === 2, 'there is two namespaces');
                done();
            });
    });

    it('should return a 403 code when trying to get the number of namespaces as a non-admin', function (done) {
        server
            .get('/api/v1/namespace/count')
            .set(authorization)
            .expect(403)
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

    it('should return the number of user\'s namespaces', function (done) {
        server
            .get('/api/v1/namespace/count?user=' + userId)
            .set(authorizationAdmin)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.count === 1, 'the user has 1 namespace');
                done();
            });
    });

    it('should return a 403 code when trying to get user\'s namespaces count as a non-admin', function (done) {
        server
            .get('/api/v1/namespace/count?user=' + userId)
            .set(authorization)
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });
});