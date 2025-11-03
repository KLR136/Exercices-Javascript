const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('video_platform', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;