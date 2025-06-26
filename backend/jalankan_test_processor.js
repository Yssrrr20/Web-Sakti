// File: jalankan_tes_processor.js
// Skrip ini digunakan untuk menguji csvProcessor.js secara manual
// dengan file yang SUDAH ADA di dalam folder data_diterima/csv_hasil.

const path = require('path');
const fs = require('fs');

// Import fungsi yang mau kita tes
const { processTreeCsvAndInsert } = require('./services/csvProcessor');
// Import koneksi database
const dbConnection = require('./db');

// ======================================================================
// --- ANDA HANYA PERLU MENGUBAH BARIS DI BAWAH INI ---
//
// Ganti 'nama_file.csv' dengan nama file yang ingin Anda tes.
// Pastikan file tersebut ada di dalam folder 'data_diterima/csv_hasil'.
const fileNameToTest = 'hasil_analisis_pohon.csv';
//
// ======================================================================

// Fungsi utama untuk menjalankan tes
async function runManualTest() {
    console.log("--- MEMULAI TES MANUAL UNTUK CSV PROCESSOR ---");

    // Membangun path lengkap ke file yang akan dites
    const testFilePath = path.join(__dirname, 'data_diterima', 'csv_hasil', fileNameToTest);
    
    console.log(`[INFO] Menargetkan file tes: ${testFilePath}`);

    // Pengecekan awal: Pastikan file benar-benar ada sebelum diproses
    if (!fs.existsSync(testFilePath)) {
        console.error(`\n❌ --- TES GAGAL --- ❌`);
        console.error(`Error: File tidak ditemukan di lokasi tersebut.`);
        console.error(`Pastikan nama file '${fileNameToTest}' sudah benar dan file tersebut ada di dalam folder 'data_diterima/csv_hasil'.`);
        await dbConnection.end(); // Tutup koneksi sebelum keluar
        return;
    }

    // PENTING:
    // Fungsi processTreeCsvAndInsert akan menghapus file setelah selesai.
    // Agar file asli Anda tidak hilang, kita buat salinan sementaranya.
    const tempFilePath = path.join(__dirname, `temp_test_${Date.now()}.csv`);
    fs.copyFileSync(testFilePath, tempFilePath);
    console.log(`[INFO] File asli telah disalin ke file sementara: ${tempFilePath}`);


    try {
        // Jalankan prosesor pada FILE SEMENTARA, bukan file asli.
        const result = await processTreeCsvAndInsert(tempFilePath, dbConnection);

        // Tampilkan hasilnya di konsol
        console.log("\n✅ --- HASIL TES --- ✅");
        console.log("Proses selesai dengan sukses!");
        console.log("Hasil dari operasi database:");
        console.log(result);
        console.log("\n[VERIFIKASI] Silakan cek tabel 'trees' di database Anda. File asli Anda aman dan tidak terhapus.");

    } catch (error) {
        // Jika ada error, tampilkan di sini
        console.error("\n❌ --- TES GAGAL --- ❌");
        console.error("Terjadi error saat menjalankan proses:");
        console.error(error);
    } finally {
        // Penting: Tutup koneksi pool agar skrip bisa berhenti sepenuhnya setelah selesai.
        await dbConnection.end();
        console.log("\n--- Tes Selesai, Koneksi Database Ditutup ---");
    }
}

// Jalankan fungsi tes
runManualTest();
