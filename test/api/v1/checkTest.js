const supertest = require('supertest');
const app = require('../../../server');
const server = supertest.agent(app);
const User = require('../../../models/user');
const Namespace = require('../../../models/namespace');
const Token = require('../../../models/token');
const assert = require('assert');
const async = require('async');

describe('Tests token check', function () {

    var authorization;
    var token1Value, token2Value, token3Value;
    var namespace1Name = 'my namespace', namespace2Name = 'my second namespace';

    //TODO This function is a mess. It needs a refactor.
    before(function (done) {
        Namespace.remove({}).exec();
        Token.remove({}).exec();
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

            newUser.save(function (err, user) {
                if (err) {
                    throw err;
                }
                if (user) {
                    async.parallel([
                            function (callback) {
                                var namespace = new Namespace({
                                    user: user._id,
                                    name: namespace1Name
                                });
                                namespace.save(function (err, namespace) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    if (namespace) {
                                        async.parallel([
                                                function (callback) {
                                                    var token = new Token({
                                                        namespace: namespace._id,
                                                        description: 'my token'
                                                    });
                                                    token.save(function (err) {
                                                        if (err) {
                                                            return callback(err);
                                                        }
                                                        token1Value = token.value;
                                                        return callback(null, token);
                                                    })
                                                },
                                                function (callback) {
                                                    var token = new Token({
                                                        namespace: namespace._id,
                                                        description: 'my third token',
                                                        active: false
                                                    });
                                                    token.save(function (err) {
                                                        if (err) {
                                                            return callback(err);
                                                        }
                                                        token3Value = token.value;
                                                        return callback(null, token);
                                                    })
                                                }
                                            ],
                                            function (err) {
                                                callback(err);
                                            });
                                    }
                                });
                            },
                            function (callback) {
                                var namespace = new Namespace({
                                    user: user._id,
                                    name: namespace2Name
                                });
                                namespace.save(function (err, namespace) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    if (namespace) {
                                        var token = new Token({
                                            namespace: namespace._id,
                                            description: 'my second token'
                                        });
                                        token.save(function (err) {
                                            if (err) {
                                                return callback(err);
                                            }
                                            token2Value = token.value;
                                            return callback(null, token);
                                        })
                                    }
                                });
                            }
                        ],
                        function (err) {
                            if (err) {
                                throw err;
                            }
                            done();
                        });
                }
            });
        });
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
                assert(res.body.data[0].count === 0, 'the counter must be at 0');
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

    it('should indicate that the token has been checked once', function (done) {
        server
            .get('/api/v1/token?q=' + token1Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data[0].count === 1, 'the counter must be at 1');
                done();
            });
    });

    it('should confirm that the token is invalid against this namespace', function (done) {
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

    it('should indicate that the token has been checked once', function (done) {
        server
            .get('/api/v1/token?q=' + token3Value)
            .set(authorization)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                assert(res.body.data[0].count === 1, 'the counter must be at 1');
                done();
            });
    });

    it('should confirm that the token is invalid against this namespace', function (done) {
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

});