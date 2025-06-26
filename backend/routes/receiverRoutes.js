// routes/receiverRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// --- KONFIGURASI ---
const EXPECTED_API_KEY = "HALO"; 
const MAP_UPLOAD_DIR = path.join(__dirname, '..', 'data_diterima', 'maps_tif');
const CSV_UPLOAD_DIR = path.join(__dirname, '..', 'data_diterima', 'csv_hasil');

fs.ensureDirSync(MAP_UPLOAD_DIR);
fs.ensureDirSync(CSV_UPLOAD_DIR);

const dbConnection = require('../db'); // Mengimpor koneksi database pool
const { processTreeCsvAndInsert } = require('../services/csvProcessor'); // Mengimpor service kita


// --- Konfigurasi Multer (Penanganan File Upload) ---
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
    limits: {
        fileSize: 200 * 1024 * 1024 // Batas per file: 200 Megabytes
    }
}).fields([
    { name: 'mapping_file', maxCount: 1 },
    { name: 'tree_csv_file', maxCount: 1 },
    { name: 'soil_csv_file', maxCount: 1 }
]);

// --- Endpoint untuk Menerima Hasil dari Python ---
// DISESUAIKAN DENGAN KODE TERBARU ANDA
router.post('/terima-hasil-lengkap', (req, res) => {
    upload(req, res, async function (err) {
        // 1. Penanganan Error Awal dari Multer
        if (err) {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: `File terlalu besar. Batas maksimal 200MB.` });
            }
            console.error("Error saat upload:", err.message);
            return res.status(500).json({ error: `Error saat upload: ${err.message}` });
        }

        // Blok try...catch untuk menangani semua logika setelah upload berhasil
        try {
            // 2. Validasi API Key dan Keberadaan File
            const apiKey = req.headers['x-api-key'];
            if (!apiKey || apiKey !== EXPECTED_API_KEY) {
                return res.status(401).json({ error: "Unauthorized: API Key tidak valid atau tidak ada." });
            }

            // Kita hanya butuh tree_csv_file untuk proses ini
            if (!req.files || !req.files.tree_csv_file || !req.files.tree_csv_file[0]) {
                return res.status(400).json({ error: "Bad Request: Pastikan 'tree_csv_file' dilampirkan." });
            }
            
            const treeCsvFile = req.files.tree_csv_file[0];
            console. log(`[PROCESS] Memulai pemrosesan untuk file: ${treeCsvFile.filename}`);
            console.log(`[PROCESS] Lokasi file: ${treeCsvFile.path}`);

            // 3. Panggil Service untuk Memproses CSV dan Insert ke DB
            // treeCsvFile.path berisi path lengkap ke file yang diupload
            const dbResult = await processTreeCsvAndInsert(treeCsvFile.path, dbConnection);

            // 4. Kirim Respon Sukses
            res.status(200).json({
                message: "File berhasil diterima dan data diproses ke database.",
                database_operation_result: dbResult,
                received_files: {
                    map_file: req.files.mapping_file ? req.files.mapping_file[0].filename : 'Tidak dilampirkan',
                    tree_csv_file: treeCsvFile.filename,
                    soil_csv_file: req.files.soil_csv_file ? req.files.soil_csv_file[0].filename : 'Tidak dilampirkan',
                }
            });

        } catch (processingError) {
            // 5. Tangani Error dari dalam blok try (misal dari DB atau CSV parser)
            console.error("[FATAL] Gagal memproses file setelah di-upload:", processingError);
            res.status(500).json({
                error: "Terjadi kesalahan internal saat memproses data.",
                details: processingError.message
            });
        }
    });
});

// --- PENAMBAHAN: Endpoint untuk memberikan daftar Peta ke Frontend ---
router.get('/hasil-peta', async (req, res) => {
  try {
    const files = await fs.readdir(MAP_UPLOAD_DIR);
    const tifFiles = files.filter(file => file.toLowerCase().endsWith('.tif') || file.toLowerCase().endsWith('.tiff'));
    console.log(`[INFO] Mengirim daftar ${tifFiles.length} file peta ke frontend.`);
    res.status(200).json(tifFiles);
  } catch (error) {
    console.error("[ERROR] Gagal membaca direktori peta:", error);
    res.status(500).json({ error: "Gagal mengambil daftar file peta." });
  }
});

// --- PENAMBAHAN: Endpoint untuk memberikan daftar CSV ke Frontend ---
router.get('/hasil-csv', async (req, res) => {
  try {
    const files = await fs.readdir(CSV_UPLOAD_DIR);
    const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    console.log(`[INFO] Mengirim daftar ${csvFiles.length} file CSV ke frontend.`);
    res.status(200).json(csvFiles);
  } catch (error) {
    console.error("[ERROR] Gagal membaca direktori CSV:", error);
    res.status(500).json({ error: "Gagal mengambil daftar file CSV." });
  }
});

// --- PENAMBAHAN: Endpoint untuk mengirim isi dari file CSV yang dipilih ---
router.get('/csv-content/:filename', (req, res) => {
  const { filename } = req.params;
  if (filename.includes('..')) {
    return res.status(400).send('Nama file tidak valid.');
  }
  const filePath = path.join(CSV_UPLOAD_DIR, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`[ERROR] Gagal mengirim file CSV ${filename}:`, err);
      res.status(404).send("File tidak ditemukan.");
    } else {
      console.log(`[INFO] Berhasil mengirim konten file ${filename}.`);
    }
  });
});

module.exports = router;