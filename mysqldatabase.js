// get the client
const mysql = require('mysql2');

// create the connection to util
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'rikoldebijvank',
  database: '2202811',
  port: 3306
});

// simple query
connection.query(
  'SELECT `id`, `name` FROM `meal`',
  function (err, results, fields) {
    if (err) {
      console.log(err.sqlMessage, ' ', err.errno, '', err.code);
    }
    console.log('results: ', results);
  }
);

connection.end();