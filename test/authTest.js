const describe = require('mocha').describe;
const before = require('mocha').before;
const it = require('mocha').it;
const supertest = require('supertest');
const app = require('../server');
const server = supertest.agent(app);
const assert = require('assert');
const dataSet = require('./authTestDataSet.json');
const insertDataSet = require('./insertDataSet');

describe('Simple authentication tests', function () {

    var userId = dataSet.User[0]._id;

    before(function (done) {
        insertDataSet(dataSet, done);
    });

    it('should return a 401 code when trying to log in with bad credentials', function (done) {
        server
            .post('/auth/login')
            .send({email: 'notarealemail', password: 'notthegoodone'})
            .expect(401)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 401 code when trying to log in with bad password', function (done) {
        server
            .post('/auth/login')
            .send({email: 'test@test.com', password: 'notthegoodone'})
            .expect(401)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when logging in with good credentials', function (done) {
        server
            .post('/auth/login')
            .send({email: 'test@test.com', password: 'mypassword'})
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 403 code when trying to log in being already logged in', function (done) {
        server
            .post('/auth/login')
            .send({email: 'notarealemail', password: 'notthegoodone'})
            .expect(403)
            .end(function (err) {
                done(err);
            });
    });

    it('should return an empty list when there is no api key pair', function (done) {
        server
            .get('/api-key')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 0, 'no data must be returned');
                done();
            });
    });

    var keyPairId;

    it('should create a new api key pair', function (done) {
        server
            .post('/api-key')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.keyId, 'the created keyId must be returned');
                assert(res.body.data.keySecret, 'the created keySecret must be returned');
                assert(res.body.data._id, 'the id of the created key pair must be returned');
                keyPairId = res.body.data._id;
                done();
            });
    });

    it('should return the list of the api key pairs', function (done) {
        server
            .get('/api-key')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.length === 1, '1 api key pair must be returned');
                done();
            });
    });

    it('should return the details of the api key pair', function (done) {
        server
            .get('/api-key/' + keyPairId)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data.keyId, 'the keyId must be returned');
                assert(res.body.data.keySecret, 'the keySecret must be returned');
                assert(res.body.data._id, 'the id of the key pair must be returned');
                done();
            });
    });

    it('should return a 404 code when accessing nonexistent api key pair', function (done) {
        server
            .get('/api-key/' + 132)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when deleting an api key pair', function (done) {
        server
            .delete('/api-key/' + keyPairId)
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 404 code when deleting nonexistent api key pair', function (done) {
        server
            .delete('/api-key/' + 132)
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 200 code when logging out', function (done) {
        server
            .get('/auth/logout')
            .expect(200)
            .end(function (err) {
                done(err);
            });
    });
});