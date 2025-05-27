const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sakti'
});

connection.connect((err) => {
  if (err) {
    console.error('Gagal konek ke database:', err);
  } else {
    console.log('Terkoneksi ke database MySQL!');
  }
});

module.exports = connection;  // ini harus tepat seperti ini
