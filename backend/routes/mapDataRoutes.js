// File: routes/mapDataRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db'); // Mengimpor koneksi database Anda

/**
 * @route   GET /map-data/trees/all-health
 * @desc    Mengambil SEMUA data pohon dari database untuk visualisasi peta.
 * Ini akan mencakup koordinat GPS dan status kesehatan.
 * @access  Public
 */
router.get('/trees/all-health', async (req, res) => {
    try {
        console.log("[MapDataRoutes] Menerima permintaan untuk /trees/all-health");
        // Query untuk mengambil ID, koordinat GPS, dan status kesehatan pohon dari tabel 'trees'
        const [trees] = await dbConnection.query("SELECT id, gps_lat, gps_long, status FROM trees");
        res.json(trees);
        console.log(`[MapDataRoutes] Berhasil mengirim ${trees.length} data pohon.`);
    } catch (error) {
        console.error("[MapDataRoutes] Error fetching all tree health data:", error);
        res.status(500).json({ error: "Failed to fetch all tree health data." });
    }
});

/**
 * @route   GET /map-data/soil/all-data
 * @desc    Mengambil SEMUA data tanah dari database untuk visualisasi peta.
 * Ini akan mencakup koordinat GPS, pH, suhu, kelembaban, timestamp, dan status prediksi.
 * Mengambil dari tabel `soil_data` (sesuai klarifikasi terbaru).
 * @access  Public
 */
router.get('/soil/all-data', async (req, res) => {
    try {
        console.log("[MapDataRoutes] Menerima permintaan untuk /soil/all-data");
        // UBAH: Ambil data dari tabel `soil_data` dan sertakan `status_prediksi`
        const [soilData] = await dbConnection.query("SELECT id, sensor_id, temperature, humidity, ph, gps_lat, gps_long, timestamp, status_prediksi FROM soil_data ORDER BY timestamp DESC");
        res.json(soilData);
        console.log(`[MapDataRoutes] Berhasil mengirim ${soilData.length} data tanah.`);
    } catch (error) {
        console.error("[MapDataRoutes] Error fetching all soil data:", error);
        res.status(500).json({ error: "Failed to fetch all soil data." });
    }
});

module.exports = router;
