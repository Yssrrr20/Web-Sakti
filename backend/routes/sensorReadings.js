// routes/sensorReadings.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream'); 

// Endpoint untuk mengambil data perangkat (tidak berubah)
router.get('/status_perangkat', async (req, res) => {
  try {
    const latestReadingsQuery = `
        SELECT
            s.id, s.serial_number, s.status,
            sr.temperature, sr.kelembapan, sr.pH, sr.timestamp
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
    const [devices] = await db.query(latestReadingsQuery);

    if (devices.length === 0) {
      return res.json([]);
    }

    const deviceIds = devices.map(d => d.id);
    const historyQuery = `
      SELECT sensor_id, timestamp, temperature, kelembapan, pH, gps_lat, gps_long 
      FROM sensor_readings 
      WHERE sensor_id IN (?) 
      ORDER BY timestamp DESC
    `;
    const [allHistory] = await db.query(historyQuery, [deviceIds]);
    
    const historyMap = new Map();
    allHistory.forEach(record => {
      if (!historyMap.has(record.sensor_id)) {
        historyMap.set(record.sensor_id, []);
      }
      if (historyMap.get(record.sensor_id).length < 10) {
        historyMap.get(record.sensor_id).push({
          ...record,
          timestamp: new Date(record.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }).replace('.',':'),
        });
      }
    });

    const finalResponse = devices.map(device => ({
      ...device,
      history: historyMap.get(device.id) || []
    }));
    
    res.json(finalResponse);
  } catch (err) {
    console.error('Gagal mengambil data perangkat:', err);
    return res.status(500).json({ error: 'Gagal mengambil data perangkat', details: err.message });
  }
});

// Endpoint memicu pengiriman file CSV ke server training
router.post('/send_csv_to_training', async (req, res) => {
  console.log('[TRAINING] Menerima perintah untuk mengirim file CSV...');
  
  const trainingServerUrl = 'http://192.168.79.6:9000/api/upload-soil';
  const PROCESSED_CSV_DIR = path.join(__dirname, '..', 'data_csv', 'processed');
  const SENT_DIR = path.join(__dirname, '..', 'data_csv', 'sent_to_training');

  try {
    await fs.ensureDir(SENT_DIR);
    const allFiles = await fs.readdir(PROCESSED_CSV_DIR);

    if (allFiles.length === 0) {
      return res.status(200).json({ message: 'Tidak ada file baru untuk dikirim.' });
    }

    allFiles.sort();
    const latestFile = allFiles[allFiles.length - 1];
    const filePath = path.join(PROCESSED_CSV_DIR, latestFile);
    console.log(`[TRAINING] Ditemukan file terbaru untuk dikirim: ${latestFile}`);

    const originalContent = await fs.readFile(filePath, 'utf8');
    const header = 'sensor_id,temperature,kelembapan,pH,gps_lat,gps_long,timestamp\n';
    const contentWithHeader = header + originalContent;
    
    const stream = Readable.from(contentWithHeader);
    const form = new FormData();
    form.append('file', stream, latestFile);

    const response = await axios.post(trainingServerUrl, form, { headers: form.getHeaders() });
    
    await fs.move(filePath, path.join(SENT_DIR, latestFile), { overwrite: true });
    
    // --- MENCATAT AKTIVITAS SUKSES ---
    const logMessage = `Berhasil mengirim file '${latestFile}' ke server training.`;
    const logDetails = JSON.stringify({ filename: latestFile, serverResponse: response.data });
    await db.query(
        "INSERT INTO activity_log (level, event_type, message, details) VALUES (?, ?, ?, ?)",
        ['INFO', 'DATA_SENT_TO_TRAINING', logMessage, logDetails]
    );

    console.log(`[TRAINING] Pengiriman berhasil dan aktivitas tercatat.`);
    res.status(200).json({ 
        message: `File ${latestFile} berhasil dikirim.`,
        details: response.data 
    });

  } catch (error) {
    let errorMessage = 'Terjadi error saat mencoba mengirim file.';
    if (error.response) {
      errorMessage = `Server training gagal memproses: ${error.response.data.detail || 'Error tidak diketahui'}`;
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar.';
    }
    console.error(`[TRAINING GAGAL] ${errorMessage}`, error.message);

    // --- MENCATAT AKTIVITAS GAGAL ---
    await db.query(
        "INSERT INTO activity_log (level, event_type, message) VALUES (?, ?, ?)",
        ['WARNING', 'DATA_SENT_FAILURE', errorMessage]
    );

    if (!res.headersSent) {
      res.status(500).json({ message: errorMessage });
    }
  }
});

module.exports = router;
