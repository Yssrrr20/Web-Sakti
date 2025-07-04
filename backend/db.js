// db.js

const mysql = require('mysql2/promise'); 

// Gunakan createPool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sakti',
  waitForConnections: true, 
  connectionLimit: 10,      
  queueLimit: 0             
});


console.log('Connection Pool ke database berhasil dibuat.');

module.exports = pool;