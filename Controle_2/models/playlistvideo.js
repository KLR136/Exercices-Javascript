const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaylistVideo = sequelize.define('PlaylistVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Position dans la playlist'
  }
}, {
  tableName: 'playlist_videos',
  timestamps: false
});

module.exports = PlaylistVideo;