// routes/receiverRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const dbConnection = require('../db');
const { 
    processTreeCsvAndInsert,
    processSoilCsvAndInsert
} = require('../services/csvProcessor');

const EXPECTED_API_KEY = "HALO"; 
const MAP_UPLOAD_DIR = path.join(__dirname, '..', 'data_diterima', 'maps_tif');
const CSV_UPLOAD_DIR = path.join(__dirname, '..', 'data_diterima', 'csv_hasil');

fs.ensureDirSync(MAP_UPLOAD_DIR);
fs.ensureDirSync(CSV_UPLOAD_DIR);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'mapping_file') {
            cb(null, MAP_UPLOAD_DIR);
        } else if (file.fieldname === 'tree_csv_file' || file.fieldname === 'soil_csv_file') {
            cb(null, CSV_UPLOAD_DIR);
        } else {
            cb(new Error('Field file tidak dikenal'), null);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }
}).fields([
    { name: 'mapping_file', maxCount: 1 },
    { name: 'tree_csv_file', maxCount: 1 },
    { name: 'soil_csv_file', maxCount: 1 }
]);

router.post('/terima-hasil-lengkap', (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error("Error saat upload:", err.message);
            return res.status(500).json({ error: `Error saat upload: ${err.message}` });
        }
        try {
            const apiKey = req.headers['x-api-key'];
            if (!apiKey || apiKey !== EXPECTED_API_KEY) {
                return res.status(401).json({ error: "Unauthorized: API Key tidak valid atau tidak ada." });
            }

            // --- PERBAIKAN 1: Definisikan dan isi array receivedFiles ---
            const receivedFiles = [];
            if (req.files.tree_csv_file) receivedFiles.push(req.files.tree_csv_file[0].filename);
            if (req.files.soil_csv_file) receivedFiles.push(req.files.soil_csv_file[0].filename);
            if (req.files.mapping_file) receivedFiles.push(req.files.mapping_file[0].filename);
            
            const processingPromises = [];
            if (req.files.tree_csv_file) {
                processingPromises.push(processTreeCsvAndInsert(req.files.tree_csv_file[0].path, dbConnection));
            }
            if (req.files.soil_csv_file) {
                processingPromises.push(processSoilCsvAndInsert(req.files.soil_csv_file[0].path, dbConnection));
            }

            if (processingPromises.length === 0) {
                return res.status(400).json({ error: "Tidak ada file CSV yang valid untuk diproses." });
            }

            const results = await Promise.allSettled(processingPromises);
            console.log("[PROCESS] Semua proses file selesai.");

            // --- PERBAIKAN 2: Lakukan logging SEBELUM mengirim respons ---
            if (receivedFiles.length > 0) {
                const logMessage = `Berhasil menerima ${receivedFiles.length} file: ${receivedFiles.join(', ')}.`;
                const logDetails = JSON.stringify({ files: receivedFiles });
                await dbConnection.query(
                    "INSERT INTO activity_log (level, event_type, message, details) VALUES (?, ?, ?, ?)",
                    ['INFO', 'FILE_RECEIVED', logMessage, logDetails]
                );
                console.log("[LOGGING] Aktivitas penerimaan file berhasil dicatat.");
            }

            // Kirim respons di akhir
            res.status(200).json({
                message: "Semua file yang diterima telah selesai diproses.",
                results: results.map(result => result.status === 'fulfilled' ? { status: 'success', data: result.value } : { status: 'failed', error: result.reason.message })
            });
        } catch (processingError) {
            console.error("[FATAL] Gagal memproses file setelah di-upload:", processingError);
            if (!res.headersSent) {
                res.status(500).json({ error: "Terjadi kesalahan internal.", details: processingError.message });
            }
        }
    });
});

// Endpoint lainnya (tidak perlu diubah)
router.get('/hasil-peta', async (req, res) => {
  try {
    const files = await fs.readdir(MAP_UPLOAD_DIR);
    res.status(200).json(files.filter(file => file.toLowerCase().endsWith('.tif') || file.toLowerCase().endsWith('.tiff')));
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar file peta." });
  }
});

router.get('/hasil-csv', async (req, res) => {
  try {
    const files = await fs.readdir(CSV_UPLOAD_DIR);
    const allCsvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    const treeFiles = allCsvFiles.filter(file => file.toLowerCase().includes('pohon') || file.toLowerCase().includes('kesehatan'));
    const soilFiles = allCsvFiles.filter(file => file.toLowerCase().includes('tanah'));

    res.status(200).json({ treeFiles, soilFiles });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar file CSV." });
  }
});

router.get('/csv-content/:filename', (req, res) => {
  const { filename } = req.params;
  if (filename.includes('..')) {
    return res.status(400).send('Nama file tidak valid.');
  }
  const filePath = path.join(CSV_UPLOAD_DIR, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File tidak ditemukan.");
    }
  });
});

module.exports = router;