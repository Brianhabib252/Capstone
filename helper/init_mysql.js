const mysql = require('mysql');

function createConnection() {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.message);
      return;
    }
    console.log('Connected to MySQL');
  });

  connection.on('error', (err) => {
    console.error('MySQL connection error:', err.message);
  });

  process.on('SIGINT', () => {
    connection.end((err) => {
      console.log('MySQL connection is disconnected.');
      process.exit(err ? 1 : 0);
    });
  });

  return connection;
}

module.exports = createConnection;