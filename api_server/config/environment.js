const environments = {
    development: {
        mysql: {
            username: 'study',
            password: 'study',
            database: 'api_dev'
        }
    },

    test: {
        mysql: {
            username: 'study',
            password: 'study',
            database: 'api_test'
        }
    },

    production: {

    }
};

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = environments[nodeEnv];