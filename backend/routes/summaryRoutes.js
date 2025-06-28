// File: routes/summaryRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db');

/**
 * @route   GET /api/summary/stats
 * @desc    Mengambil SEMUA data ringkasan untuk dashboard dalam satu query efisien.
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        // Query ini menggabungkan semua perhitungan ke dalam satu panggilan database
        const query = `
            SELECT
                (SELECT COUNT(*) FROM trees) AS totalPohon,
                (SELECT COUNT(*) FROM trees WHERE status = 'healthy') AS pohonSehat,
                (SELECT COUNT(*) FROM trees WHERE status = 'infected') AS pohonSakit,
                (SELECT COUNT(*) FROM trees WHERE status = 'potential') AS pohonPotensial,
                (SELECT COUNT(*) FROM sensors WHERE status = 'active') AS perangkatAktif,
                (SELECT AVG(temperature) FROM soil_data) as avgTemperature,
                (SELECT AVG(ph) FROM soil_data) as avgPh,
                (SELECT AVG(humidity) FROM soil_data) as avgHumidity
        `;
        
        const [results] = await dbConnection.query(query);
        const stats = results[0];

        res.json(stats);

    } catch (error) {
        console.error("Error saat mengambil data statistik dashboard:", error);
        res.status(500).json({ error: "Gagal mengambil data dari server." });
    }
});

module.exports = router;