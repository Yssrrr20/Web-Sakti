// routes/sensorReadings.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // koneksi database

// Endpoint untuk ambil status terbaru perangkat (per sensor_id)
router.get('/status_perangkat', (req, res) => {
  const query = `
            SELECT 
                s.id, 
                s.serial_number, 
                s.status,               
                sr.temperature, 
                sr.kelembapan, 
                sr.pH,
                sr.nitrogen, 
                sr.phosphor, 
                sr.kalium, 
                sr.timestamp
            FROM sensors s
            JOIN (
            SELECT sensor_id, MAX(timestamp) AS latest_time
            FROM sensor_readings
            GROUP BY sensor_id
            ) latest ON s.id = latest.sensor_id
            JOIN sensor_readings sr 
            ON sr.sensor_id = latest.sensor_id 
            AND sr.timestamp = latest.latest_time;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Query gagal:', err);
      return res.status(500).json({ error: 'Query gagal' });
    }
    res.json(results);
  });
});

module.exports = router;
