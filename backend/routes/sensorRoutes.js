// routes/sensorRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/summary', async (req, res) => {
    try {
        // Query mengambil data dari tabel sensors
        const query = "SELECT status, COUNT(*) as count FROM sensors GROUP BY status";
        const [rows] = await db.query(query);

        // Proses hasil query menjadi format yang mudah digunakan di frontend
        let summary = {
            total: 0,
            active: 0,
            inactive: 0
        };

        rows.forEach(row => {
            if (row.status === 'active') {
                summary.active = row.count;
            } else if (row.status === 'inactive') {
                summary.inactive = row.count;
            }
            summary.total += row.count;
        });

        res.status(200).json(summary);

    } catch (error) {
        console.error('Gagal mengambil ringkasan sensor:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;