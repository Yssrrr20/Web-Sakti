// File: routes/activityLogRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db');

/**
 * @route   GET /api/activity/recent
 * @desc    Mengambil 10 data aktivitas terakhir dari tabel activity_log.
 * @access  Public
 */
router.get('/recent', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                timestamp,
                level,
                event_type,
                message
            FROM 
                activity_log
            ORDER BY 
                timestamp DESC
            LIMIT 10;
        `;

        const [activities] = await dbConnection.query(query);
        res.json(activities);

    } catch (error) {
        console.error("Gagal mengambil riwayat aktivitas:", error);
        res.status(500).json({ error: "Gagal mengambil data dari server." });
    }
});

module.exports = router;
