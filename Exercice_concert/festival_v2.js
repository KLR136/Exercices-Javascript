const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize('festival', 'root', 'AdriNatami08', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Désactive les logs SQL
});

// Modèle User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'users'
});

// Modèle Task
const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('pending', 'in progress', 'completed'),
        defaultValue: 'pending'
    },
    dueDate: {
        type: DataTypes.DATE
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'tasks'
});

// Modèles existants (Concerts, Bands, Artists)
const Concert = sequelize.define('Concert', {
    datetime: DataTypes.DATE,
    title: DataTypes.STRING
}, {
    tableName: 'concerts'
});

const Band = sequelize.define('Band', {
    name: DataTypes.STRING,
    style: DataTypes.STRING
}, {
    tableName: 'bands'
});

const Artist = sequelize.define('Artist', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    birthdate: DataTypes.DATE
}, {
    tableName: 'artists'
});

// Définition des relations
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

// Relations pour les concerts (à adapter selon votre structure)
Concert.belongsToMany(Band, { through: 'Concert_Bands' });
Band.belongsToMany(Concert, { through: 'Concert_Bands' });

Band.belongsToMany(Artist, { 
    through: 'Band_Artists',
    foreignKey: 'bandId',
    otherKey: 'artistId'
});
Artist.belongsToMany(Band, { 
    through: 'Band_Artists',
    foreignKey: 'artistId',
    otherKey: 'bandId'
});

module.exports = {
    sequelize,
    User,
    Task,
    Concert,
    Band,
    Artist
};