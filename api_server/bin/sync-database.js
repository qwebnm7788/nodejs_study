const models = require('../models');

module.exports = () => {
    console.log("sync DB");
    return models.sequelize.sync({force: true});
};