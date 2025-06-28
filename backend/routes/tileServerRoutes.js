// File: routes/tileServerRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const TILES_DIR = path.join(__dirname, '..', 'public', 'map_tiles');

/**
 * @route   GET /api/tiles/:tilesetId/:z/:x/:y.png
 * @desc    Menyajikan satu gambar tile peta
 * @access  Public
 */
router.get('/:tilesetId/:z/:x/:y.png', (req, res) => {
    const { tilesetId, z, x, y } = req.params;

    // Keamanan dasar untuk mencegah directory traversal
    if (tilesetId.includes('..') || z.includes('..') || x.includes('..') || y.includes('..')) {
        return res.status(400).send('Invalid path');
    }

    const filePath = path.join(TILES_DIR, tilesetId, z, x, `${y}.png`);

    // Kirim file jika ada, atau kirim 404 jika tidak ditemukan
    res.sendFile(filePath, (err) => {
        if (err) {
            // Sembunyikan pesan error detail dari klien
            res.status(404).send('Tile not found');
        }
    });
});

// Endpoint untuk mendapatkan daftar tileset yang sudah selesai diproses
router.get('/list', async (req, res) => {
    try {
        const dbConnection = require('../db');
        const [tilesets] = await dbConnection.query(
            "SELECT tileset_id, original_filename FROM map_tilesets WHERE status = 'completed'"
        );
        res.json(tilesets);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil daftar peta.' });
    }
});

module.exports = router;