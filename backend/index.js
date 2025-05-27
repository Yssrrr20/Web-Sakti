// index.js
const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt'); 
const fs = require('fs-extra'); 
const path = require('path'); 
const { parse } = require('csv-parse'); 

const app = express();
const db = require('./db'); // Sudah ada
const sensorRoutes = require('./routes/sensorReadings'); // Sudah ada

const port = 3001; 

app.use(cors()); //
app.use(express.json()); //

// --- Konfigurasi Direktori 
const RAW_CSV_DIR = path.join(__dirname, 'data_csv', 'raw');
const PROCESSED_CSV_DIR = path.join(__dirname, 'data_csv', 'processed');
const ERROR_CSV_DIR = path.join(__dirname, 'data_csv', 'error');

fs.ensureDirSync(RAW_CSV_DIR);
fs.ensureDirSync(PROCESSED_CSV_DIR);
fs.ensureDirSync(ERROR_CSV_DIR);

// --- Konfigurasi MQTT 
const MQTT_BROKER_URL = 'mqtt://localhost:1883'; // GANTI dengan URL broker MQTT 
const MQTT_TOPIC_CSV = 'sensor/data/csv_raw';    // GANTI dengan topik MQTT 

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

client.on('error', (err) => {
    console.error('Koneksi MQTT error:', err);
});

client.on('reconnect', () => {
    console.log('Mencoba menghubungkan ulang ke MQTT Broker...');
});

client.on('close', () => {
    console.log('Koneksi MQTT ditutup.');
});

// --- Handler Pesan MQTT 
client.on('message', async (topic, message) => {
    if (topic === MQTT_TOPIC_CSV) {
        console.log(`Menerima pesan dari topik ${topic}`);
        const csvData = message.toString();
        // Membuat nama file unik berdasarkan timestamp
        const timestampFile = new Date().toISOString().replace(/[:.]/g, '-');
        const rawFileName = `raw_data_${timestampFile}.csv`;
        const rawFilePath = path.join(RAW_CSV_DIR, rawFileName);

        try {
            // Simpan file CSV 
            await fs.writeFile(rawFilePath, csvData);
            console.log(`File CSV mentah disimpan: ${rawFilePath}`);

            // 2. Parsing CSV
            const finalRecords = [];
            const stringParser = parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
                cast: (value, context) => {
                    if (['temp', 'humidity', 'ph', 'N', 'P', 'K', 'lat', 'long'].includes(context.column)) {
                        const num = parseFloat(value);
                        return isNaN(num) ? null : num;
                    }
                    if (context.column === 'timestamp_sensor') {
                        const date = new Date(value);
                        if (isNaN(date.getTime())) {
                            return null; 
                        }
                        return date.toISOString().slice(0, 19).replace('T', ' ');
                    }
                    return value;
                }
            });

            stringParser.on('readable', function(){ let rec; while ((rec = stringParser.read()) !== null) { finalRecords.push(rec); }});
            stringParser.on('error', function(err){
                // Lempar error agar ditangkap oleh try-catch luar
                console.error(`Detail error parsing CSV untuk ${rawFileName}:`, err.message);
                throw new Error(`Parsing error: ${err.message}`);
            });
            stringParser.on('end', function(){
                console.log(`Selesai parsing ${rawFileName}, ditemukan ${finalRecords.length} baris data.`);
            });

            stringParser.write(csvData);
            stringParser.end();
            await new Promise((resolve, reject) => {
                 stringParser.on('error', reject); 
                 stringParser.on('finish', resolve); 
            });

            //  Validasi dan Simpan ke Database
            for (const record of finalRecords) {
                if (!record.serial_number || !record.timestamp_sensor) {
                    console.warn(`Data tidak lengkap (serial_number atau timestamp_sensor kosong) di ${rawFileName}:`, record);
                    continue;
                }

                try {
                    const sensorResult = await db.query('SELECT id FROM sensors WHERE serial_number = ?', [record.serial_number]);
                    if (sensorResult.length === 0) {
                        console.warn(`Sensor dengan serial_number ${record.serial_number} tidak ditemukan. File: ${rawFileName}`);
                        continue;
                    }
                    const sensorId = sensorResult[0].id;

                    const queryText = `
                        INSERT INTO sensor_readings
                        (sensor_id, timestamp, temperature, kelembapan, pH, nitrogen, phosphor, kalium, gps_lat, gps_long, source_file)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const values = [
                        sensorId,
                        record.timestamp_sensor,
                        record.temp !== undefined ? record.temp : null,
                        record.humidity !== undefined ? record.humidity : null,
                        record.ph !== undefined ? record.ph : null,
                        record.N !== undefined ? record.N : null,
                        record.P !== undefined ? record.P : null,
                        record.K !== undefined ? record.K : null,
                        record.lat !== undefined ? record.lat : null,
                        record.long !== undefined ? record.long : null,
                        rawFileName
                    ];
                    await db.query(queryText, values);

                } catch (dbError) {
                    console.error(`Error menyimpan data ke DB untuk ${rawFileName}, sensor: ${record.serial_number}, timestamp: ${record.timestamp_sensor}`, dbError.message);
                }
            }
             console.log(`Selesai memproses ${finalRecords.length} record dari ${rawFileName}`);

            //  Pindahkan file ke direktori processed
            await fs.move(rawFilePath, path.join(PROCESSED_CSV_DIR, rawFileName), { overwrite: true });
            console.log(`File CSV dipindahkan ke processed: ${rawFileName}`);

        } catch (error) {
            console.error(`Gagal memproses keseluruhan file CSV ${rawFileName}:`, error.message);
            try {
                if (await fs.pathExists(rawFilePath)) {
                    await fs.move(rawFilePath, path.join(ERROR_CSV_DIR, rawFileName), { overwrite: true });
                    console.log(`File CSV dipindahkan ke error: ${rawFileName}`);
                } else {
                    console.warn(`File ${rawFilePath} tidak ditemukan untuk dipindahkan ke error, mungkin sudah dipindahkan atau ada error sebelumnya.`);
                }
            } catch (moveError) {
                console.error(`Gagal memindahkan file CSV ${rawFileName} ke direktori error:`, moveError);
            }
        }
    }
});

// --- ROUTING HTTP 
app.use('/api', sensorRoutes); 

// Endpoint root sederhana
app.get('/', (req, res) => {
    res.send('Backend API dan Listener MQTT Aktif!');
});

app.listen(port, () => {
    console.log(`Backend API aktif di http://localhost:${port}`); //
});

// --- Penanganan Sinyal untuk graceful shutdown 
const cleanup = (signal) => {
    console.log(`\nMenerima sinyal ${signal}. Melakukan cleanup...`);
    client.end(true, () => {
        console.log('Koneksi MQTT berhasil ditutup.');
        if (db && db.pool && typeof db.pool.end === 'function') {
            db.pool.end(err => {
                if (err) console.error('Error menutup pool database:', err);
                else console.log('Pool database ditutup.');
                process.exit(0);
            });
        } else {
            console.log('Tidak ada pool database untuk ditutup atau db.pool.end bukan fungsi.');
            process.exit(0);
        }
    });
};

process.on('SIGINT', () => cleanup('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => cleanup('SIGTERM')); // Perintah kill