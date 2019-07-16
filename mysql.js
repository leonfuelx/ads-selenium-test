const mysql = require('mysql');

module.exports = mysql.createConnection({
  host: '162.222.180.40',
  user: 'root',
  password: 'fueladmin2014',
  database: 'fuelData'
})
