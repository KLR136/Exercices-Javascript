const { sequelize, User, Task, Concert, Band, Artist, BandArtist } = require('./festival_v2.js'); // ← adapte le chemin
const { Op } = require('sequelize');

async function testSequelize() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion réussie à MySQL.');

    await sequelize.sync({ force: true }); 
    console.log('🧱 Tables créées.');

    const band = await Band.create({ name: 'The Meteors', style: 'Rock' });
    const concert = await Concert.create({
      datetime: new Date('2025-08-10'),
      title: 'Summer Rock Night',
      bandId: band.id
    });

    const artist1 = await Artist.create({ firstName: 'John', lastName: 'Doe', birthdate: new Date('1990-04-05') });
    const artist2 = await Artist.create({ firstName: 'Jane', lastName: 'Smith', birthdate: new Date('1995-02-10') });

    await band.addArtist(artist1, { through: { role: 'Chanteur' } });
    await band.addArtist(artist2, { through: { role: 'Guitariste' } });

    console.log('🎶 Données de test insérées.');

    const concerts = await Concert.findAll({
      include: Band,
      order: [['datetime', 'DESC']]
    });
    console.log('\n🎤 Concerts (ordre antéchronologique):');
    console.log(JSON.stringify(concerts, null, 2));

    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);

    const artists30 = await Artist.findAll({
      where: { birthdate: { [Op.lt]: thirtyYearsAgo } }
    });
    console.log('\n👴 Artistes de plus de 30 ans:');
    console.log(JSON.stringify(artists30, null, 2));

    const rockConcerts = await Concert.findAll({
      include: {
        model: Band,
        where: { style: 'Rock' }
      }
    });
    console.log('\n🎸 Concerts Rock:');
    console.log(JSON.stringify(rockConcerts, null, 2));

    const concertWithArtists = await Concert.findByPk(concert.id, {
      include: {
        model: Band,
        include: {
          model: Artist,
          through: { attributes: ['role'] }
        }
      }
    });
    console.log('\n🎭 Artistes et rôles pour le concert:');
    console.log(JSON.stringify(concertWithArtists, null, 2));

    console.log('\n✅ Test terminé avec succès.');
  } catch (error) {
    console.error('❌ Erreur Sequelize :', error);
  } finally {
    await sequelize.close();
  }
}

testSequelize();
