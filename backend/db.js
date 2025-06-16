// db.js

const mysql = require('mysql2/promise'); 

// Gunakan createPool, bukan createConnection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sakti',
  waitForConnections: true, // Akan menunggu jika semua koneksi sibuk
  connectionLimit: 10,      // Jumlah maksimum koneksi dalam pool
  queueLimit: 0             // Tidak ada batas antrian permintaan
});


console.log('Connection Pool ke database berhasil dibuat.');

// Ekspor pool-nya. Kode lain bisa langsung menggunakan pool.query()
module.exports = pool;