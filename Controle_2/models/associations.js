// models/associations.js
const User = require('./user');
const Video = require('./video');
const Comment = require('./comment');
const Playlist = require('./playlist');
const PlaylistVideo = require('./playlistvideo');

// Relations User - Comment
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments'
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Relations Video - Comment
Video.hasMany(Comment, {
  foreignKey: 'videoId',
  as: 'comments'
});
Comment.belongsTo(Video, {
  foreignKey: 'videoId',
  as: 'video'
});

// Relations User - Playlist
User.hasMany(Playlist, {
  foreignKey: 'userId',
  as: 'playlists'
});
Playlist.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Relations Many-to-Many Playlist - Video via PlaylistVideo
Playlist.belongsToMany(Video, {
  through: PlaylistVideo,
  foreignKey: 'playlistId',
  otherKey: 'videoId',
  as: 'videos'
});

Video.belongsToMany(Playlist, {
  through: PlaylistVideo,
  foreignKey: 'videoId',
  otherKey: 'playlistId',
  as: 'playlists'
});

// Relations directes pour accéder aux attributs de la table de liaison
Playlist.hasMany(PlaylistVideo, {
  foreignKey: 'playlistId',
  as: 'playlistVideos'
});

Video.hasMany(PlaylistVideo, {
  foreignKey: 'videoId',
  as: 'videoPlaylists'
});

PlaylistVideo.belongsTo(Playlist, {
  foreignKey: 'playlistId',
  as: 'playlist'
});

PlaylistVideo.belongsTo(Video, {
  foreignKey: 'videoId',
  as: 'video'
});

module.exports = {
  User,
  Video,
  Comment,
  Playlist,
  PlaylistVideo
};