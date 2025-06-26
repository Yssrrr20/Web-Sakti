// File: routes/summaryRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db'); // Impor koneksi database pool Anda

/**
 * @route   GET /api/summary/stats
 * @desc    Mengambil data ringkasan statistik dari database
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        // Jalankan semua query secara paralel untuk efisiensi
        const [
            totalPohonResult,
            pohonSehatResult,
            pohonSakitResult,
            perangkatAktifResult
        ] = await Promise.all([
            dbConnection.query("SELECT COUNT(*) as count FROM trees"),
            dbConnection.query("SELECT COUNT(*) as count FROM trees WHERE status = 'healthy'"),
            dbConnection.query("SELECT COUNT(*) as count FROM trees WHERE status = 'infected'"),
            // Asumsi tabel perangkat Anda bernama 'devices' dan status aktifnya 'active'
            // Sesuaikan jika nama tabel atau kolomnya berbeda
            dbConnection.query("SELECT COUNT(*) as count FROM sensors WHERE status = 'active'")
        ]);

        // Ekstrak hasil dari setiap query
        const stats = {
            totalPohon: totalPohonResult[0][0].count,
            pohonSehat: pohonSehatResult[0][0].count,
            pohonSakit: pohonSakitResult[0][0].count,
            perangkatAktif: perangkatAktifResult[0][0].count
        };

        res.json(stats);

    } catch (error) {
        console.error("Error saat mengambil data statistik:", error);
        res.status(500).json({ error: "Gagal mengambil data dari server." });
    }
});

module.exports = router;
