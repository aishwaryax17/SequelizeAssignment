const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

// Initialize Sequelize with correct environment config
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Create db object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user')(sequelize, DataTypes);
db.Task = require('./task')(sequelize, DataTypes);

// Associations
db.User.hasMany(db.Task, { foreignKey: 'userId', as: 'tasks' });
db.Task.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
