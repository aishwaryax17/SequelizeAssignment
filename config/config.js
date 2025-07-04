require('dotenv').config();

module.exports = {
  development: {
    username: "myuser",
    password: "mypassword",
    database: "mydb",
    host: "localhost", 
    port: 5432,        
    dialect: 'postgres'
  },
  test: {
    username: 'mytestuser',
    password: 'mytestpassword',
    database: 'mytestdb',
    host: 'localhost',
    dialect: 'postgres',
    logging:false,
  }

};