// index.js

const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const fs = require('fs-extra');
const path = require('path');
const { parse } = require('csv-parse');

const db = require('./db');
const sensorRoutes = require('./routes/sensorReadings');
const receiverRoutes = require('./routes/receiverRoutes');

// ... (semua kode inisialisasi express, cors, direktori tetap sama) ...
const app = express();
const port = 5000; 

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'data_diterima')));

const RAW_CSV_DIR = path.join(__dirname, 'data_csv', 'raw');
const PROCESSED_CSV_DIR = path.join(__dirname, 'data_csv', 'processed');
const ERROR_CSV_DIR = path.join(__dirname, 'data_csv', 'error');

fs.ensureDirSync(RAW_CSV_DIR);
fs.ensureDirSync(PROCESSED_CSV_DIR);
fs.ensureDirSync(ERROR_CSV_DIR);


// --- Konfigurasi MQTT (tetap sama) ---
const MQTT_BROKER_URL = 'mqtt://20.5.160.109:1883';
const MQTT_TOPIC_CSV = 'sensor/data/csv_raw';

console.log(`Mencoba terhubung ke MQTT Broker di ${MQTT_BROKER_URL}...`);
const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
    console.log('Terhubung ke MQTT Broker!');
    client.subscribe(MQTT_TOPIC_CSV, (err) => {
        if (!err) {
            console.log(`Berlangganan topik: ${MQTT_TOPIC_CSV}`);
        } else {
            console.error('Gagal berlangganan topik:', err);
        }
    });
});

client.on('error', (err) => console.error('Koneksi MQTT error:', err));
client.on('reconnect', () => console.log('Mencoba menghubungkan ulang ke MQTT Broker...'));
client.on('close', () => console.log('Koneksi MQTT ditutup.'));


// ===== LOGIKA BATCHING BARU =====

let messageBuffer = []; // Buffer untuk menampung pesan yang masuk
let processingTimeout = null; // Timer untuk memproses batch
const BATCH_WINDOW_MS = 3000; // Tunggu 3 detik untuk pesan lain sebelum memproses

async function processBatch() {
    if (messageBuffer.length === 0) return;

    console.log(`\n--- Memproses Batch ---`);
    console.log(`Waktu tunggu habis. Memproses ${messageBuffer.length} pesan yang terkumpul.`);

    const batchToProcess = [...messageBuffer];
    messageBuffer = [];
    
    const combinedCsvData = batchToProcess.join('\n');
    const timestampFile = new Date().toISOString().replace(/[:.]/g, '-');
    const rawFileName = `raw_batch_${timestampFile}.csv`;
    const rawFilePath = path.join(RAW_CSV_DIR, rawFileName);
    const processedFileName = `processed_batch_${timestampFile}.csv`;
    const processedFilePath = path.join(PROCESSED_CSV_DIR, processedFileName);

    try {
        await fs.writeFile(rawFilePath, combinedCsvData);
        console.log(`File batch mentah disimpan: ${rawFilePath}`);

        const finalRecords = [];
        const stringParser = parse({
            columns: ['sensor_id', 'temperature', 'kelembapan', 'pH', 'gps_lat', 'gps_long', 'timestamp'],
            skip_empty_lines: true, trim: true,
            cast: (value, context) => { 
                if (['temperature', 'kelembapan', 'pH', 'gps_lat', 'gps_long'].includes(context.column)) { const num = parseFloat(value); return isNaN(num) ? null : num; }
                if (context.column === 'timestamp') { const date = new Date(value); if (isNaN(date.getTime())) { return null; } return date.toISOString().slice(0, 19).replace('T', ' '); }
                return value;
            }
        });
        stringParser.on('readable', function(){ let rec; while ((rec = stringParser.read()) !== null) { finalRecords.push(rec); }});
        stringParser.on('error', function(err){ throw new Error(`Parsing error: ${err.message}`); });
        stringParser.write(combinedCsvData);
        stringParser.end();
        await new Promise((resolve, reject) => { stringParser.on('error', reject); stringParser.on('finish', resolve); });
        
        console.log(`Selesai parsing batch, ditemukan total ${finalRecords.length} baris data.`);

        for (const record of finalRecords) {
            if (!record.sensor_id || !record.timestamp) { continue; }
            const [sensorResultRows] = await db.query('SELECT id FROM sensors WHERE serial_number = ?', [record.sensor_id]);
            if (sensorResultRows.length === 0) { console.warn(`Sensor dengan serial_number ${record.sensor_id} tidak ditemukan.`); continue; }
            const sensorId = sensorResultRows[0].id;
            const queryText = `INSERT INTO sensor_readings (sensor_id, temperature, kelembapan, pH, gps_lat, gps_long, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const values = [sensorId, record.temperature, record.kelembapan, record.pH, record.gps_lat, record.gps_long, record.timestamp];
            await db.query(queryText, values);
        }
        console.log(`Selesai menyimpan ${finalRecords.length} record dari batch ke database.`);
        
        // ===== PERUBAHAN DI SINI =====
        // Membuat file CSV bersih dari batch ini TANPA HEADER
        const csvRows = finalRecords.map(row => [row.sensor_id, row.temperature, row.kelembapan, row.pH, row.gps_lat, row.gps_long, new Date(row.timestamp).toISOString()].join(','));
        // Langsung gabungkan baris-baris data, tanpa variabel header
        const csvContent = csvRows.join('\n');
        await fs.writeFile(processedFilePath, csvContent);
        // ============================

        console.log(`File CSV batch (tanpa header) berhasil disimpan di: ${processedFilePath}`);

        await fs.unlink(rawFilePath);
        console.log(`File batch mentah ${rawFileName} telah dihapus.`);

    } catch (error) {
        console.error(`Gagal memproses batch dari file ${rawFileName}:`, error.message);
        try {
            if (await fs.pathExists(rawFilePath)) {
                await fs.move(rawFilePath, path.join(ERROR_CSV_DIR, rawFileName), { overwrite: true });
                console.log(`File batch mentah dipindahkan ke 'error': ${rawFileName}`);
            }
        } catch (moveError) {
            console.error(`Gagal memindahkan file batch ${rawFileName} ke direktori error:`, moveError);
        }
    }
}

client.on('message', async (topic, message) => {
    if (topic === MQTT_TOPIC_CSV) {
        // 1. Tambahkan pesan ke buffer
        messageBuffer.push(message.toString());
        console.log(`Pesan diterima dan dimasukkan ke buffer (Total di buffer: ${messageBuffer.length})`);

        // 2. Hapus timer lama jika ada
        if (processingTimeout) {
            clearTimeout(processingTimeout);
        }

        // 3. Set timer baru. Jika tidak ada pesan lain dalam 3 detik, proses batch.
        processingTimeout = setTimeout(processBatch, BATCH_WINDOW_MS);
    }
});
// ===== AKHIR LOGIKA BATCHING BARU =====


// --- Pendaftaran Routing HTTP ---
app.get('/', (req, res) => {
    res.send('Backend API dan Listener MQTT Aktif!');
});

app.use('/api', sensorRoutes);
app.use('/api/receiver', receiverRoutes);


// --- Jalankan Server & Penanganan Sinyal Cleanup ---
app.listen(port, () => {
    console.log(`Backend API aktif di http://localhost:${port}`);
});

// ... (fungsi cleanup tetap sama) ...
const cleanup = async (signal) => {
    console.log(`\nMenerima sinyal ${signal}. Memulai proses cleanup...`);
    if(processingTimeout) clearTimeout(processingTimeout);
    await processBatch(); // Coba proses sisa buffer sebelum keluar
    
    const cleanupTimeout = 3000;

    const cleanupPromise = new Promise(async (resolve, reject) => {
        // ... (isi cleanup promise tetap sama) ...
        try {
            await Promise.allSettled([
                new Promise((resolve_mqtt, reject_mqtt) => {
                    if (client && client.connected) {
                        console.log('Mencoba menutup koneksi MQTT...');
                        client.end(false, (err) => {
                            if (err) return reject_mqtt(err);
                            console.log('Koneksi MQTT berhasil ditutup.');
                            resolve_mqtt();
                        });
                    } else {
                        resolve_mqtt();
                    }
                }),
                new Promise((resolve_db, reject_db) => {
                    if (db) {
                        console.log('Mencoba menutup koneksi database pool...');
                        db.end(err => {
                            if (err) return reject_db(err);
                            console.log('Koneksi database pool ditutup.');
                            resolve_db();
                        });
                    } else {
                        resolve_db();
                    }
                })
            ]);
            resolve();
        } catch (e) {
            reject(e);
        }
    });

    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`Cleanup timeout setelah ${cleanupTimeout}ms`));
        }, cleanupTimeout);
    });

    try {
        await Promise.race([cleanupPromise, timeoutPromise]);
        console.log("Cleanup selesai secara normal.");
    } catch (e) {
        console.error("Cleanup gagal atau timeout:", e.message);
    } finally {
        console.log("Menutup proses sekarang.");
        process.exit(0);
    }
};

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));