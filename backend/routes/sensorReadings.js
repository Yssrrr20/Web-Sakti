const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream'); 

// Endpoint untuk mengambil data perangkat 
router.get('/status_perangkat', async (req, res) => {
  // --- LOG AWAL ---
  console.log(`[${new Date().toISOString()}] Menerima permintaan untuk /status_perangkat...`);

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

  try {
    // --- LOG SEBELUM QUERY 1 ---
    console.log("[DEBUG] Mencoba menjalankan query utama untuk data terbaru...");
    const [devices] = await db.query(latestReadingsQuery);
    // --- LOG SETELAH QUERY 1 ---
    console.log(`[DEBUG] SUKSES. Query utama menemukan ${devices.length} perangkat.`);

    if (devices.length === 0) {
      console.log("[INFO] Tidak ada perangkat yang ditemukan, mengirim respons kosong.");
      return res.json([]);
    }

    const deviceIds = devices.map(d => d.id);

    // --- LOG SEBELUM QUERY 2 ---
    const historyQuery = `
      SELECT sensor_id, timestamp, temperature, kelembapan, pH, gps_lat, gps_long 
      FROM sensor_readings 
      WHERE sensor_id IN (?) 
      ORDER BY timestamp DESC
    `;
    console.log(`[DEBUG] Mencoba menjalankan query riwayat untuk ${deviceIds.length} ID perangkat...`);
    const [allHistory] = await db.query(historyQuery, [deviceIds]);
    // --- LOG SETELAH QUERY 2 ---
    console.log(`[DEBUG] SUKSES. Query riwayat menemukan total ${allHistory.length} data.`);

    // --- LOG SEBELUM PEMROSESAN DATA ---
    console.log("[DEBUG] Mulai mengelompokkan data riwayat di aplikasi...");
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
    console.log("[DEBUG] Selesai mengelompokkan data.");

    // --- LOG SEBELUM MENGIRIM RESPONS ---
    const finalResponse = devices.map(device => ({
      ...device,
      history: historyMap.get(device.id) || []
    }));
    console.log(`[${new Date().toISOString()}] SUKSES TOTAL. Siap mengirim respons JSON ke frontend.`);
    
    res.json(finalResponse);

  } catch (err) {
    // --- LOG JIKA TERJADI ERROR ---
    console.error(`[!!! ERROR !!!] Terjadi kesalahan fatal di endpoint /status_perangkat.`);
    console.error('ERROR DETAIL:', err);
    return res.status(500).json({ error: 'Gagal mengambil data perangkat', details: err.message });
  }
});


// Definisikan path direktori
const PROCESSED_CSV_DIR = path.join(__dirname, '..', 'data_csv', 'processed');
const SENT_DIR = path.join(__dirname, '..', 'data_csv', 'sent_to_training');

// Endpoint memicu pengiriman file CSV ke server training
router.post('/send_csv_to_training', async (req, res) => {
  console.log('[TRAINING] Menerima perintah untuk mengirim file CSV...');
  
  // URL SERVER TRAINING 
  const trainingServerUrl = 'http://192.168.186.6:9000/api/upload-soil';

  try {
    await fs.ensureDir(SENT_DIR);
    const allFiles = await fs.readdir(PROCESSED_CSV_DIR);

    if (allFiles.length === 0) {
      const msg = 'Tidak ada file baru di folder "processed" untuk dikirim.';
      console.log(`[TRAINING] ${msg}`);
      return res.json({ message: msg });
    }

    allFiles.sort();
    const latestFile = allFiles[allFiles.length - 1];
    const filePath = path.join(PROCESSED_CSV_DIR, latestFile);
    console.log(`[TRAINING] Ditemukan file terbaru untuk diproses: ${latestFile}`);

    const originalContent = await fs.readFile(filePath, 'utf8');
    const header = 'sensor_id,temperature,kelembapan,pH,gps_lat,gps_long,timestamp\n';
    const contentWithHeader = header + originalContent;
    
    
    const stream = Readable.from(contentWithHeader);
    
    const form = new FormData();
    form.append('file', stream, latestFile);

    console.log(`[TRAINING] Mengirim data ${latestFile} dari memori ke ${trainingServerUrl}...`);
    const response = await axios.post(trainingServerUrl, form, { headers: form.getHeaders() });
    
    await fs.move(filePath, path.join(SENT_DIR, latestFile), { overwrite: true });
    
    console.log(`[TRAINING] Berhasil dikirim. Respons server training:`, response.data.message);
    res.status(200).json({ 
        message: `File ${latestFile} berhasil dikirim dan server training merespons.`,
        details: response.data 
    });

  } catch (error) {
    let errorMessage = 'Terjadi error di server saat mencoba mengirim file.';
    if (error.response) {
      // Error dari server training
      console.error('[TRAINING] Server training mengembalikan error:', error.response.data);
      errorMessage = `Server training gagal memproses: ${error.response.data.detail || 'Error tidak diketahui'}`;
    } else if (error.request) {
      // Error koneksi
      console.error('[TRAINING] Gagal terhubung ke server training:', error.message);
      errorMessage = 'Tidak dapat terhubung ke server training. Pastikan URL dan port sudah benar & server berjalan.';
    } else {
      console.error('[TRAINING] Terjadi error fatal saat proses pengiriman:', error);
    }
    res.status(500).json({ message: errorMessage });
  }
});


module.exports = router;