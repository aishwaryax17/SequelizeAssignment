require('dotenv').config();

module.exports = {
  development: {
    username: "myuser",
    password: "mypassword",
    database: "mydb",
    host: "localhost", 
    port: 5432,        
    dialect: 'postgres'
  }
};