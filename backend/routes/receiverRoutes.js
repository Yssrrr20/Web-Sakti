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
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: `File terlalu besar. Batas maksimal adalah 200MB.` });
            }
            return res.status(400).json({ error: `Error Multer: ${err.message}` });
        } else if (err) {
            console.error("Error upload tidak dikenal:", err.message);
            return res.status(500).json({ error: `Error saat upload: ${err.message}` });
        }
        
        console.log("[MONITORING] Multer selesai memproses upload. Menganalisis file yang diterima...");
        if (req.files) {
            Object.keys(req.files).forEach(fieldname => {
                if (req.files[fieldname] && req.files[fieldname].length > 0) {
                    console.log(`  -> Field '${fieldname}': Diterima file '${req.files[fieldname][0].filename}'`);
                }
            });
        }

        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== EXPECTED_API_KEY) {
            return res.status(401).json({ error: "Unauthorized: API Key tidak valid atau tidak ada." });
        }

        if (!req.files || !req.files.mapping_file || !req.files.tree_csv_file || !req.files.soil_csv_file) {
            return res.status(400).json({ error: "Bad Request: Pastikan semua 3 file dilampirkan." });
        }

        const mapFile = req.files.mapping_file[0];
        const treeCsvFile = req.files.tree_csv_file[0];
        const soilCsvFile = req.files.soil_csv_file[0];

        console.log(" Bundle hasil analisis lengkap berhasil divalidasi!");
        
        res.status(200).json({
            message: "Bundle 3 file berhasil diterima oleh server Node.js.",
            received_files: {
                map_file: mapFile.filename,
                tree_csv_file: treeCsvFile.filename,
                soil_csv_file: soilCsvFile.filename,
            }
        });
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