const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config').development;


const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});
//creating a db object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//stores the model instance in db
db.User = require('./user')(sequelize, DataTypes);
db.Task = require('./task')(sequelize, DataTypes);

// Association
db.User.hasMany(db.Task, { foreignKey: 'userId', as: 'tasks' });
db.Task.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;

