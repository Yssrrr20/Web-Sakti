// File: services/csvProcessor.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // Pastikan csv-parser diinstal (npm install csv-parser)

/**
 * Memproses file CSV berisi data pohon, mengubahnya sesuai aturan,
 * dan memasukkannya ke dalam database secara massal (insert/update).
 * @param {string} filePath - Path lengkap ke file CSV.
 * @param {object} dbConnection - Objek koneksi database pool.
 * @returns {Promise<object>}
 */

function processTreeCsvAndInsert(filePath, dbConnection) {
    return new Promise((resolve, reject) => {
        const results = [];
        let processedRowCount = 0;
        let skippedRowCount = 0;

        console.log(`[TREE PROCESS] Memulai pembacaan file: ${path.basename(filePath)}`);

        fs.createReadStream(filePath)
            .pipe(csv({ bom: true })) 
            .on('data', (row) => {
                let reason = '';
                
                // 1. Validasi ID Pohon
                const treeIdMatch = row.id_pohon ? String(row.id_pohon).match(/\d+$/) : null;
                const treeId = treeIdMatch ? parseInt(treeIdMatch[0], 10) : null;
                if (treeId === null) reason = 'id_pohon tidak valid';

                // 2. Validasi Status
                const statusKey = Object.keys(row).find(key => key.toLowerCase().includes('status'));
                const statusValue = statusKey ? row[statusKey] : null;
                let status;
                if (statusValue === '1') {
                    status = 'healthy';
                } else if (statusValue === '0') {
                    status = 'infected';
                } else if (statusValue === '2') {
                    status = 'potential';
                } else {
                    status = null;
                    if (!reason) reason = `nilai status '${statusValue}' tidak valid (harus 0, 1, atau 2)`;
                }

                // 3. Validasi GPS
                const lat = parseFloat(row.gps_lat);
                const lon = parseFloat(row.gps_long);
                if (isNaN(lat) || isNaN(lon)) {
                    if (!reason) reason = 'koordinat GPS tidak valid';
                }

                if (reason === '') {
                    results.push([treeId, lat, lon, status]);
                    processedRowCount++;
                } else {
                    console.warn(`[SKIP] Baris pohon dilewati. Alasan: ${reason}. Data Asli:`, row);
                    skippedRowCount++;
                }
            })
            .on('end', async () => {
                console.log(`[TREE PARSING] Selesai. Baris valid: ${processedRowCount}, Baris dilewati: ${skippedRowCount}.`);

                if (results.length === 0) {
                    console.error(`[TREE GAGAL] Tidak ada data pohon valid untuk dimasukkan. File '${path.basename(filePath)}' tidak dihapus.`);
                    return resolve({ 
                        message: "Proses data pohon gagal, tidak ada data valid. File disimpan untuk diperiksa.", 
                        processed_rows: 0,
                        skipped_rows: skippedRowCount
                    });
                }

                const sqlQuery = `
                    INSERT INTO trees (id, gps_lat, gps_long, status)
                    VALUES ?
                    ON DUPLICATE KEY UPDATE
                        gps_lat = VALUES(gps_lat),
                        gps_long = VALUES(gps_long),
                        status = VALUES(status)
                `;

                try {
                    console.log(`[TREE DB] Mencoba memasukkan/memperbarui ${results.length} baris...`);
                    const [dbResult] = await dbConnection.query(sqlQuery, [results]);
                    console.log("[TREE DB] Operasi database berhasil.", dbResult);

                    resolve({
                        message: "Operasi data pohon berhasil. File disimpan untuk arsip.",
                        affected_rows: dbResult.affectedRows,
                        processed_rows: processedRowCount,
                        skipped_rows: skippedRowCount
                    });
                } catch (dbError) {
                    console.error(`[TREE DB GAGAL] Gagal menjalankan query. File '${path.basename(filePath)}' disimpan.`, dbError);
                    reject(dbError);
                }
            })
            .on('error', (error) => {
                console.error(`[TREE PARSING GAGAL] Gagal membaca file CSV. File disimpan.`, error);
                reject(error);
            });
    });
}

/**
 * Memproses file CSV berisi data tanah dan memasukkannya ke database.
 * @param {string} filePath - Path lengkap ke file CSV data tanah.
 * @param {object} dbConnection - Objek koneksi database pool.
 * @returns {Promise<object>}
 */
function processSoilCsvAndInsert(filePath, dbConnection) {
    return new Promise((resolve, reject) => {
        const dataToInsert = [];
        let processedRowCount = 0;
        let skippedRowCount = 0;

        console.log(`[SOIL PROCESS] Memulai pembacaan file data tanah: ${path.basename(filePath)}`);

        fs.createReadStream(filePath)
            .pipe(csv({ bom: true }))
            .on('data', (row) => {
                const sensorSerialNumber = row.sensor_id;
                const timestamp = row.timestamp ? new Date(row.timestamp) : null;

                const statusPrediksi = row.status_prediksi || null; // Ambil kolom status_prediksi

                if (!sensorSerialNumber || !timestamp || isNaN(timestamp.getTime())) {
                    console.warn(`[SOIL SKIP] Baris dilewati karena sensor_id atau timestamp tidak valid.`, row);
                    skippedRowCount++;
                    return;
                }

                dataToInsert.push({
                    serial_number: sensorSerialNumber,
                    temperature: parseFloat(row.temperature),
                    humidity: parseFloat(row.kelembapan), 
                    ph: parseFloat(row.pH),
                    gps_lat: parseFloat(row.gps_lat),
                    gps_long: parseFloat(row.gps_long),
                    timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' '),
                    status_prediksi: statusPrediksi 
                });
                processedRowCount++;
            })
            .on('end', async () => {
                console.log(`[SOIL PARSING] Selesai. Baris valid: ${processedRowCount}, Baris dilewati: ${skippedRowCount}.`);

                if (dataToInsert.length === 0) {
                    console.error(`[SOIL GAGAL] Tidak ada data valid untuk dimasukkan.`);
                    return resolve({ 
                        message: "Proses data tanah gagal, tidak ada data valid.",
                        processed_rows: 0,
                        skipped_rows: skippedRowCount
                    });
                }

                try {
                    const uniqueSerials = [...new Set(dataToInsert.map(item => item.serial_number))];
                    const [sensorRows] = await dbConnection.query('SELECT id, serial_number FROM sensors WHERE serial_number IN (?)', [uniqueSerials]);
                    
                    const sensorIdMap = new Map();
                    sensorRows.forEach(sensor => {
                        sensorIdMap.set(sensor.serial_number, sensor.id);
                    });

                    const values = dataToInsert
                        .map(item => {
                            const sensorId = sensorIdMap.get(item.serial_number);
                            if (!sensorId) {
                                console.warn(`[SOIL SKIP] Sensor dengan serial number ${item.serial_number} tidak ditemukan di database.`);
                                return null;
                            }
        
                            return [
                                sensorId,
                                item.temperature,
                                item.humidity,
                                item.ph,
                                item.gps_lat,
                                item.gps_long,
                                item.timestamp,
                                item.status_prediksi 
                            ];
                        })
                        .filter(item => item !== null);

                    if (values.length === 0) {
                        console.error(`[SOIL GAGAL] Tidak ada data yang bisa dimasukkan setelah validasi sensor.`);
                        return resolve({ message: "Gagal, semua data sensor tidak terdaftar di database." });
                    }
                    
                    const sqlQuery = `
                        INSERT INTO soil_data (sensor_id, temperature, humidity, ph, gps_lat, gps_long, timestamp, status_prediksi)
                        VALUES ?
                    `;

                    console.log(`[SOIL DB] Mencoba memasukkan ${values.length} baris ke tabel soil_data...`);
                    const [dbResult] = await dbConnection.query(sqlQuery, [values]);
                    console.log("[SOIL DB] Operasi database berhasil.", dbResult);

                    resolve({
                        message: "Operasi data tanah berhasil.",
                        inserted_rows: dbResult.affectedRows
                    });

                } catch (dbError) {
                    console.error(`[SOIL DB GAGAL] Gagal menjalankan query.`, dbError);
                    reject(dbError);
                }
            })
            .on('error', (error) => {
                console.error(`[SOIL PARSING GAGAL] Gagal membaca file CSV.`, error);
                reject(error);
            });
    });
}


module.exports = {
    processTreeCsvAndInsert,
    processSoilCsvAndInsert
};
