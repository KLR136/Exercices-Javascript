const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize('festival', 'root', 'AdriNatami08', {
    host: 'localhost',
    dialect: 'mysql'
});

const Concert = sequelize.define('Concert', {
    datetime: DataTypes.DATE,
    title: DataTypes.STRING
});

const Band = sequelize.define('Band', {
    name: DataTypes.STRING,
    style: DataTypes.STRING
});

const Artist = sequelize.define('Artist', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    birthdate: DataTypes.DATE
});

Concert.belongsToMany(Artist, { through: 'Concert_Artists' });
Artist.belongsToMany(Concert, { through: 'Concert_Artists' });

async function getConcertsAntechronological() {
    try {
        const concerts = await Concert.findAll({
            order: [['datetime', 'DESC']],
            attributes: ['id', 'title', 'datetime']
        });
        
        console.log('Concerts (ordre antéchronologique):');
        concerts.forEach(concert => {
            console.log(`${concert.title} - ${concert.datetime}`);
        });
        
        return concerts;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function getArtistsUnder30() {
    try {
        const thirtyYearsAgo = new Date();
        thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
        
        const artists = await Artist.findAll({
            where: {
                birthdate: {
                    [Op.gt]: thirtyYearsAgo // Né il y a moins de 30 ans
                }
            },
            attributes: ['id', 'firstName', 'lastName', 'birthdate']
        });
        
        console.log('Artistes de moins de 30 ans:');
        artists.forEach(artist => {
            const age = Math.floor((new Date() - artist.birthdate) / (365.25 * 24 * 60 * 60 * 1000));
            console.log(`${artist.firstName} ${artist.lastName} - ${age} ans`);
        });
        
        return artists;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function getRockConcerts() {
    try {
        const concerts = await Concert.findAll({
            include: [{
                model: Band,
                where: {
                    style: {
                        [Op.like]: '%rock%'
                    }
                },
                attributes: ['id', 'name', 'style']
            }],
            attributes: ['id', 'title', 'datetime']
        });
        
        console.log('Concerts de rock:');
        concerts.forEach(concert => {
            console.log(`${concert.title} - ${concert.datetime}`);
            concert.Bands.forEach(band => {
                console.log(`  → ${band.name} (${band.style})`);
            });
        });
        
        return concerts;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function getArtistsByConcert(concertId) {
    try {
        const concert = await Concert.findByPk(concertId, {
            include: [{
                model: Band,
                include: [{
                    model: Artist,
                    through: {
                        attributes: ['role'] // Récupère le rôle depuis la table de liaison
                    }
                }]
            }]
        });
        
        if (!concert) {
            console.log('Concert non trouvé');
            return;
        }
        
        console.log(`Artistes du concert "${concert.title}":`);
        
        concert.Bands.forEach(band => {
            console.log(`\nGroupe: ${band.name}`);
            band.Artists.forEach(artist => {
                const role = artist.Band_Artists.role;
                console.log(`  → ${artist.firstName} ${artist.lastName} - Rôle: ${role}`);
            });
        });
        
        return concert;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie!');
        
        // 1. Concerts ordre antéchronologique
        console.log('\n=== 1. Concerts (ordre antéchronologique) ===');
        await getConcertsAntechronological();
        
        // 2. Artistes de moins de 30 ans
        console.log('\n=== 2. Artistes de moins de 30 ans ===');
        await getArtistsUnder30();
        
        // 3. Concerts de rock
        console.log('\n=== 3. Concerts de rock ===');
        await getRockConcerts();
        
        // 4. Artistes d'un concert spécifique avec leurs rôles
        console.log('\n=== 4. Artistes du concert ID 1 avec leurs rôles ===');
        await getArtistsByConcert(1);
        
    } catch (error) {
        console.error('Erreur générale:', error);
    } finally {
        await sequelize.close();
    }
}

// Lancer le programme
main();