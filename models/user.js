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
    lastAccess: Date,
    createdAt: Date,
    apiKeyPairs: [{
        keyId: String,
        keySecret: String
    }],
    admin: {type: Boolean, default: false}
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
        callback(null, null);
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
 * Returns a DTO user
 *
 * @return DTO user
 */
userSchema.methods.toDTO = function () {
    return {
        _id: this.id,
        local: {
            email: this.local.email,
            valid: this.local.valid,
            date: this.local.date
        },
        lastAccess: this.lastAccess,
        createdAt: this.createdAt,
        apiKeyPairs: this.apiKeyPairs,
        admin: this.admin
    };
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
 * If this is the first created user, make it admin.
 *
 * This is not atomic so if the 2 first users are created exactly at the same time both of them could be admin.
 */
userSchema.pre('save', function (next) {
    if (this.isNew) {
        var thisUser = this;
        mongoose.models['User'].count({}, function (err, count) {
            if (err) {
                throw err;
            }
            if (count === 0) {
                thisUser.admin = true;
            }
            next();
        });
    } else {
        next();
    }
});

/**
 * Deletes all user's namespaces when deleting user.
 */
userSchema.pre('remove', function (next) {
    Namespace.remove({'user': this._id}).exec();
    next();
});


module.exports = mongoose.model('User', userSchema);