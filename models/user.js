/**
 * @file Defines the user model.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const uuid = require('uuid');
const Namespace = require('./namespace');

/**
 * User Mongoose schema.
 */
var userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
        valid: Boolean,
        token: String,
        date: Date
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    lastAccess: Date,
    createdAt: Date,
    apiKeyPairs: [{
        keyId: String,
        keySecret: String
    }]
});

/**
 * Generates password hash.
 *
 * @param password
 * @return {String} hashed password.
 */
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Compares a password against the user's password.
 *
 * @param password
 * @return {Boolean}
 */
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

/**
 * Creates a new API key pair.
 *
 * @param callback
 */
userSchema.methods.createApiKeyPair = function (callback) {
    var keyPair = this.apiKeyPairs.create({
        keyId: uuid.v4(),
        keySecret: uuid.v4()
    });
    this.apiKeyPairs.push(keyPair);
    this.save(function (err) {
        callback(err, keyPair);
    });
};

/**
 * Deletes an API key pair.
 *
 * @param id
 * @param callback
 */
userSchema.methods.deleteApiKeyPair = function (id, callback) {
    var keyPair = this.apiKeyPairs.id(id);
    if (keyPair) {
        keyPair.remove();
        this.save(callback);
    } else {
        var err = new Error();
        err.status = 404;
        callback(err);
    }
};

/**
 * Creates a new namespace.
 *
 * @param name
 * @param description
 * @param callback
 */
userSchema.methods.createNamespace = function (name, description, callback) {
    var namespace = new Namespace({
        user: this._id,
        name: name,
        description: description
    });
    namespace.save(function (err, namespace) {
        callback(err, namespace);
    });
};

/**
 * Deletes a namespace.
 *
 * @param id
 * @param callback
 */
userSchema.methods.deleteNamespace = function (id, callback) {
    Namespace.findOneAndRemove({'user': this._id, '_id': id}, function (err, namespace) {
        if (!err && !namespace) {
            err = new Error();
            err.status = 404;
        }
        if (namespace) {
            //Necessary to trigger the Namespace pre-remove hook as findOneAndRemove doesn't trigger hooks
            namespace.remove();
        }
        callback(err);
    });
};

/**
 * Before validation of a User instance, populate some fields.
 */
userSchema.pre('validate', function(next) {
    if (this.isNew) {
        var date = new Date();
        this.createdAt = date;
        this.lastAccess = date;
    }
    next();
});

/**
 * Deletes all user's namespaces when deleting user.
 */
userSchema.pre('remove', function (next) {
    Namespace.remove({'user': this._id}).exec();
    next();
});


module.exports = mongoose.model('User', userSchema);