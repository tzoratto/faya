const supertest = require('supertest');
const app = require('../server');
const server = supertest.agent(app);
const User = require('../models/user');
const assert = require('assert');

describe('Various routes tests', function () {

    it('should return a 404 code when trying to access nonexistent route', function (done) {
        server
            .get('/my/super/route')
            .expect(404)
            .end(function (err) {
                done(err);
            });
    });

    it('should return a 401 code when trying to access a secured route without authentication', function (done) {
        server
            .get('/api/namespace')
            .expect(401)
            .end(function (err) {
                done(err);
            });
    });
});