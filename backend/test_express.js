// test_express.js

const express = require('express');
const app = express();
const port = 5000; // Gunakan port yang sama untuk konsistensi

app.get('/', (req, res) => {
    console.log("--- LOG TEST_EXPRESS: Permintaan diterima di root (/) ---");
    res.send('Hello from minimal Express server!');
});

app.get('/test-ping', (req, res) => {
    console.log("--- LOG TEST_EXPRESS: Permintaan diterima di /test-ping ---");
    res.send('Ping successful from minimal server!');
});

app.listen(port, () => {
    console.log(`--- TEST_EXPRESS: Server minimal aktif di http://localhost:${port}`);
});

// === TAMBAHKAN KODE INI UNTUK MENANGKAP ERROR ===
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception Caught:', err.stack);
    process.exit(1); // Keluar dari proses setelah logging
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection Caught:', reason);
    process.exit(1); // Keluar dari proses setelah logging
});
// ===============================================