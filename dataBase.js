// DataBase 
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'pratice',
  multipleStatements: true
});
module.exports = pool;
