// File: routes/zoneRoutes.js

const express = require('express');
const router = express.Router();
const dbConnection = require('../db'); 

/**
 * @route   GET /api/zones
 * @desc    Mengambil daftar semua zona (blok) dari database.
 * Data ini akan digunakan sebagai daftar tugas di halaman Analisis.
 * Mengambil dari tabel `map_zones` dan memetakan untuk frontend.
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Query untuk mengambil data dari tabel 'map_zones'.
        const query = `
            SELECT
                id,
                zone_name,
                label,
                bounds_sw_lat,
                bounds_sw_lng,
                bounds_ne_lat,
                bounds_ne_lng,
                (bounds_sw_lat + bounds_ne_lat) / 2 AS lat,    -- Menghitung titik tengah lintang
                (bounds_sw_lng + bounds_ne_lng) / 2 AS \`long\`, -- Menghitung titik tengah bujur
                tree_count_total,
                tree_count_healthy,
                tree_count_infected,
                tree_count_potential,
                avg_ph,
                avg_temperature,
                avg_humidity
            FROM map_zones
            ORDER BY id ASC;
        `;

        const [results] = await dbConnection.query(query);

        
        if (results.length > 0) {
            res.json(results);
        } else {
            // Jika tidak ada zona ditemukan
            res.status(200).json([]); // Kirim array kosong jika tidak ada data
        }

    } catch (error) {
        console.error("Error saat mengambil data zona:", error);
        res.status(500).json({ error: "Gagal mengambil data zona dari server." });
    }
});


/**
 * @route   POST /api/zones/generate-grid
 * @desc    Endpoint untuk MEMBUAT zona baru berdasarkan data pohon dan tanah.
 * Logika ini berasal dari kode yang Anda berikan sebelumnya.
 * @access  Public
 */
router.post('/generate-grid', async (req, res) => {
    try {
        console.log("[ZONING] Proses pembuatan zona dimulai...");
        const GRID_SIZE_METERS = 50;

        const [trees] = await dbConnection.query("SELECT gps_lat, gps_long, status FROM trees");
        const [soils] = await dbConnection.query("SELECT gps_lat, gps_long, ph, temperature, humidity FROM soil_data");

        if (trees.length === 0) {
            return res.status(400).json({ message: "Tidak ada data pohon untuk dianalisis." });
        }

        const latitudes = trees.map(t => t.gps_lat);
        const longitudes = trees.map(t => t.gps_long);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const lat_degree_per_meter = 1 / 111111;
        const gridHeight = GRID_SIZE_METERS * lat_degree_per_meter;

        const zoneData = [];
        let zoneCounter = 1;

        for (let lat = minLat; lat < maxLat; lat += gridHeight) {
            const lng_degree_per_meter = 1 / (111320 * Math.cos(lat * Math.PI/180));
            const gridWidth = GRID_SIZE_METERS * lng_degree_per_meter;

            for (let lng = minLng; lng < maxLng; lng += gridWidth) {
                const zoneBounds = { sw_lat: lat, sw_lng: lng, ne_lat: lat + gridHeight, ne_lng: lng + gridWidth };
                const treesInZone = trees.filter(t => t.gps_lat >= zoneBounds.sw_lat && t.gps_lat < zoneBounds.ne_lat && t.gps_long >= zoneBounds.sw_lng && t.gps_long < zoneBounds.ne_lng);

                if (treesInZone.length > 0) {
                    const soilsInZone = soils.filter(s => s.gps_lat >= zoneBounds.sw_lat && s.gps_lat < zoneBounds.ne_lat && s.gps_long >= zoneBounds.sw_lng && s.gps_long < zoneBounds.ne_lng);

                    const healthy = treesInZone.filter(t => t.status === 'healthy').length;
                    const infected = treesInZone.filter(t => t.status === 'infected').length;
                    const potential = treesInZone.filter(t => t.status === 'potential').length;

                    let avg_ph = null, avg_temp = null, avg_humidity = null;
                    if (soilsInZone.length > 0) {
                        avg_ph = soilsInZone.reduce((sum, s) => sum + (s.ph || 0), 0) / soilsInZone.length;
                        avg_temp = soilsInZone.reduce((sum, s) => sum + (s.temperature || 0), 0) / soilsInZone.length;
                        avg_humidity = soilsInZone.reduce((sum, s) => sum + (s.humidity || 0), 0) / soilsInZone.length;
                    }

                    let label = "Normal";
                    const infected_percentage = (infected / treesInZone.length) * 100;

                    if (infected_percentage > 10) {
                        label = "Zona Prioritas Merah";
                    } else if (avg_ph && avg_ph < 5.5) {
                        label = "Zona Tanah Asam";
                    } else if (infected_percentage === 0 && potential === 0) {
                        label = "Zona Sehat";
                    }

                    zoneData.push([
                        `Zona ${zoneCounter}`,
                        label,
                        zoneBounds.sw_lat, zoneBounds.sw_lng, zoneBounds.ne_lat, zoneBounds.ne_lng,
                        treesInZone.length, healthy, infected, potential,
                        avg_ph, avg_temp, avg_humidity
                    ]);
                    zoneCounter++;
                }
            }
        }

        const zonesCreatedCount = zoneData.length;
        console.log(`[ZONING] Menyiapkan ${zonesCreatedCount} zona untuk disimpan...`);

        // Hapus zona lama dan masukkan yang baru
        await dbConnection.query("TRUNCATE TABLE map_zones");
        if (zonesCreatedCount > 0) {
            const sql = `
                INSERT INTO map_zones (zone_name, label, bounds_sw_lat, bounds_sw_lng, bounds_ne_lat, bounds_ne_lng, tree_count_total, tree_count_healthy, tree_count_infected, tree_count_potential, avg_ph, avg_temperature, avg_humidity)
                VALUES ?
            `;
            await dbConnection.query(sql, [zoneData]);
        }
        console.log(`[ZONING] Proses penyimpanan zona selesai.`);

        const logMessage = `Analisis zona baru berhasil dibuat, menghasilkan ${zonesCreatedCount} zona.`;
        const logDetails = JSON.stringify({ zones_created: zonesCreatedCount });
        await dbConnection.query(
            "INSERT INTO activity_log (level, event_type, message, details) VALUES (?, ?, ?, ?)",
            ['SUCCESS', 'ZONE_ANALYSIS', logMessage, logDetails]
        );
        console.log("[LOGGING] Aktivitas analisis zona berhasil dicatat.");

        res.status(201).json({ message: logMessage });

    } catch (error) {
        console.error("Gagal membuat zona:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Gagal melakukan analisis zona." });
        }
    }
});

module.exports = router;
