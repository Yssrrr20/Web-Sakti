// File: routes/soilRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db');

/**
 * @route   GET /api/soil/recent
 * @desc    Mengambil 10 data tanah terakhir yang tercatat di database
 * @access  Public
 */
router.get('/recent', async (req, res) => {
    try {
        // Query untuk mengambil 10 data terakhir dari soil_data,
        // dan menggabungkannya dengan nama sensor dari tabel sensors.
        const query = `
            SELECT 
                sd.id,
                sd.temperature,
                sd.humidity,
                sd.ph,
                sd.timestamp,
                s.serial_number
            FROM 
                soil_data sd
            JOIN 
                sensors s ON sd.sensor_id = s.id
            ORDER BY 
                sd.timestamp DESC
            LIMIT 10;
        `;

        const [readings] = await dbConnection.query(query);
        res.json(readings);

    } catch (error) {
        console.error("Gagal mengambil data tanah terkini:", error);
        res.status(500).json({ error: "Gagal mengambil data dari server." });
    }
});

module.exports = router;
