// app.js
const sequelize = require('./config/database');
const { User, Video, Comment, Playlist, PlaylistVideo } = require('./models/associations');

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    
    // Synchronisation des modèles avec la base de données
    await sequelize.sync({ force: false }); // Utilisez { force: true } seulement en développement pour recréer les tables
    console.log('Base de données synchronisée.');
    
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
  }
}

// Exemple d'utilisation
async function exampleUsage() {
  // Création d'un utilisateur
  const user = await User.create({
    pseudo: 'john_doe',
    email: 'john@example.com',
    registrationDate: new Date()
  });

  // Création d'une vidéo
  const video = await Video.create({
    title: 'Introduction à Sequelize',
    duration: 15,
    releaseDate: new Date('2024-01-01'),
    category: 'tutoriel'
  });

  // Création d'un commentaire
  const comment = await Comment.create({
    text: 'Excellent tutoriel !',
    rating: 5,
    publicationDate: new Date(),
    userId: user.id,
    videoId: video.id
  });

  // Création d'une playlist
  const playlist = await Playlist.create({
    name: 'Mes tutoriels favoris',
    description: 'Une sélection de mes tutoriels préférés',
    userId: user.id
  });

  // Ajout d'une vidéo à une playlist avec position
  await PlaylistVideo.create({
    playlistId: playlist.id,
    videoId: video.id,
    position: 1
  });

  // Récupération des données avec associations
  const userWithData = await User.findByPk(user.id, {
    include: [
      {
        model: Comment,
        as: 'comments',
        include: [{
          model: Video,
          as: 'video'
        }]
      },
      {
        model: Playlist,
        as: 'playlists',
        include: [{
          model: Video,
          as: 'videos',
          through: {
            attributes: ['position'] // Inclure la position depuis la table de liaison
          }
        }]
      }
    ]
  });

  console.log(JSON.stringify(userWithData, null, 2));
}

initializeDatabase().then(() => {
  // exampleUsage(); // Décommentez pour tester
});