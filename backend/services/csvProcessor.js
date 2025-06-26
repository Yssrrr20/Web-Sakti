// File: services/csvProcessor.js

const fs = require('fs');
const csv = require('csv-parser');

/**
 * Memproses file CSV berisi data pohon, mengubahnya sesuai aturan,
 * dan memasukkannya ke dalam database secara massal (bulk insert/update).
 * @param {string} filePath - Path lengkap ke file CSV yang di-upload.
 * @param {object} dbConnection - Objek koneksi database pool dari mysql2/promise.
 * @returns {Promise<object>} - Promise yang akan resolve dengan hasil operasi.
 */
function processTreeCsvAndInsert(filePath, dbConnection) {
    return new Promise((resolve, reject) => {
        const results = [];
        let processedRowCount = 0;
        let skippedRowCount = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Logika transformasi data...
                const treeIdMatch = row.id_pohon ? row.id_pohon.match(/\d+$/) : null;
                const treeId = treeIdMatch ? parseInt(treeIdMatch[0], 10) : null;

                let status;
                if (row.status_kesehatan === '1') {
                    status = 'healthy';
                } else if (row.status_kesehatan === '0') {
                    status = 'infected';
                } else {
                    status = null;
                }

                if (treeId !== null && status !== null) {
                    results.push({
                        id: treeId,
                        location_id: 1,
                        gps_lat: parseFloat(row.gps_lat),
                        gps_long: parseFloat(row.gps_long),
                        status: status,
                    });
                    processedRowCount++;
                } else {
                    skippedRowCount++;
                }
            })
            .on('end', async () => {
                console.log(`[CSV Parsing] Selesai. Baris valid: ${processedRowCount}, Baris dilewati: ${skippedRowCount}.`);
                
                try {
                    fs.unlinkSync(filePath); // Hapus file sementara setelah diproses
                } catch (err) {
                    console.error(`[CLEANUP FAILED] Gagal hapus file sementara: ${filePath}`);
                }

                if (results.length === 0) {
                    return resolve({ message: "Tidak ada data valid untuk dimasukkan." });
                }

                const values = results.map(r => [r.id, r.location_id, r.gps_lat, r.gps_long, r.status]);
                const sqlQuery = `
                    INSERT INTO trees (id, location_id, gps_lat, gps_long, status) VALUES ? 
                    ON DUPLICATE KEY UPDATE gps_lat = VALUES(gps_lat), gps_long = VALUES(gps_long), status = VALUES(status)
                `;

                try {
                    const [dbResult] = await dbConnection.query(sqlQuery, [values]);
                    resolve({
                        message: `Operasi database berhasil.`,
                        affected_rows: dbResult.affectedRows,
                        details: dbResult.info
                    });
                } catch (dbError) {
                    reject(dbError);
                }
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Ekspor fungsi agar bisa di-import di file lain
module.exports = {
    processTreeCsvAndInsert
};