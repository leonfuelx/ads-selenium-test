const mysql = require('mysql');

module.exports = mysql.createConnection({
  host: 'fuelasset.db.fuel451.com',
  user: 'fuelx_read_only',
  password: 'u3B5*uRWqJXaO',
  database: 'fuelAsset'
})
