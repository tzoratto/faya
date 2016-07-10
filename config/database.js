module.exports = {
    test: {db: process.env.MONGO_TEST_URL || 'mongodb://localhost/faya_test'},
    development: {db: 'mongodb://localhost/faya_dev'},
    production: {db: process.env.MONGO_URL}
}[process.env.NODE_ENV || 'development'];