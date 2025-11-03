// models/Video.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Durée en minutes'
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('documentaire', 'fiction', 'tutoriel', 'autre'),
    allowNull: false
  }
}, {
  tableName: 'videos',
  timestamps: false
});

module.exports = Video;