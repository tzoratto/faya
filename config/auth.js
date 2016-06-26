const appConfig = require('./app');

module.exports = {

    facebookAuth: {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: appConfig.url + '/auth/facebook/callback'
    },

    twitterAuth: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: appConfig.url + '/auth/twitter/callback'
    },

    googleAuth: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: appConfig.url + '/auth/google/callback'
    }

};