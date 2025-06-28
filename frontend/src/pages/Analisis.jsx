import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map'; // Asumsi komponen Map Anda bisa menampilkan posisi
import NotificationCard from '../components/NotificationCard';
import NavigationPrompt from '../components/NavigationPrompt';

// --- DATA DUMMY ---
// Data ini nantinya akan disinkronkan dari server dan disimpan di IndexedDB saat online.
const initialTugas = [
  { id: 1, namaBlok: 'Blok A7', koordinat: { lat: -6.550272, lon: 106.716429 }, status: 'menunggu' },
  { id: 2, namaBlok: 'Blok B5', koordinat: { lat: -6.550874, lon: 106.716757 }, status: 'menunggu' },
  { id: 3, namaBlok: 'Blok C1', koordinat: { lat: -6.550929, lon: 106.716844 }, status: 'menunggu' },
];

// Helper function untuk menghitung jarak (rumus Haversine)
const getDistanceInMeters = (pos1, pos2) => {
  const R = 6371e3; // Jari-jari Bumi dalam meter
  const lat1 = pos1.lat * Math.PI/180;
  const lat2 = pos2.lat * Math.PI/180;
  const deltaLat = (pos2.lat-pos1.lat) * Math.PI/180;
  const deltaLon = (pos2.lon-pos1.lon) * Math.PI/180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Jarak dalam meter
};


const Analisis = () => {
  // State untuk seluruh alur kerja
  const [daftarTugas, setDaftarTugas] = useState(initialTugas);
  const [tugasIndex, setTugasIndex] = useState(0); // Index tugas yang sedang aktif
  const [posisiPetani, setPosisiPetani] = useState(null); // {lat, lon}
  const [statusAplikasi, setStatusAplikasi] = useState('menuju_lokasi'); // 'menuju_lokasi', 'siap_ambil_data', 'mengambil_data'
  const [notifikasi, setNotifikasi] = useState({ type: 'info', message: 'Mulai tugas, menuju lokasi pertama.' });
  
  const tugasSaatIni = daftarTugas[tugasIndex];
  const RADIUS_KEDATANGAN = 20; // Jarak dalam meter untuk dianggap 'tiba'

  // Hook untuk mengambil lokasi GPS petani secara periodik
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosisiPetani({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => console.error("GPS Error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    // Cleanup saat komponen dibongkar
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Hook utama untuk logika aplikasi
  useEffect(() => {
    if (!posisiPetani || !tugasSaatIni) return;

    const jarak = getDistanceInMeters(posisiPetani, tugasSaatIni.koordinat);

    // Cek jika petani tiba di lokasi dan status masih 'menuju_lokasi'
    if (jarak < RADIUS_KEDATANGAN && statusAplikasi === 'menuju_lokasi') {
      setStatusAplikasi('siap_ambil_data');
      setNotifikasi({ type: 'info', title: 'Anda Telah Tiba', message: `Anda berada di dekat ${tugasSaatIni.namaBlok}. Tekan tombol untuk konfirmasi.` });
      // Di aplikasi nyata, bisa juga memicu getaran (vibration API)
      if ('vibrate' in navigator) navigator.vibrate(200);
    }
  }, [posisiPetani, tugasSaatIni, statusAplikasi]);


  // Handler untuk tombol aksi utama
  const handleAksiUtama = () => {
    switch (statusAplikasi) {
      case 'siap_ambil_data':
        setStatusAplikasi('mengambil_data');
        setNotifikasi({ type: 'info', title: 'Siap Mengambil Data', message: 'Silakan gunakan sensor. Tekan tombol lagi jika sudah selesai.' });
        break;
      case 'mengambil_data':
        // Tandai tugas saat ini sebagai selesai
        const newDaftarTugas = [...daftarTugas];
        newDaftarTugas[tugasIndex].status = 'selesai';
        setDaftarTugas(newDaftarTugas);

        // Cek jika masih ada tugas berikutnya
        if (tugasIndex < daftarTugas.length - 1) {
          setTugasIndex(tugasIndex + 1);
          setStatusAplikasi('menuju_lokasi');
          setNotifikasi({ type: 'success', title: 'Data Disimpan!', message: `Tugas di ${tugasSaatIni.namaBlok} selesai. Menuju lokasi berikutnya.` });
        } else {
          setStatusAplikasi('semua_selesai');
          setNotifikasi({ type: 'success', title: 'Semua Tugas Selesai!', message: 'Anda telah menyelesaikan semua pekerjaan hari ini.' });
        }
        break;
      default:
        break;
    }
  };
  
  // Menentukan teks dan status tombol aksi
  const getTombolAksi = () => {
    switch (statusAplikasi) {
      case 'menuju_lokasi':
        return { text: 'Menuju Lokasi...', disabled: true };
      case 'siap_ambil_data':
        return { text: 'Konfirmasi Tiba & Siap Ambil Data', disabled: false };
      case 'mengambil_data':
        return { text: 'Selesai Ambil Data & Lanjutkan', disabled: false };
      case 'semua_selesai':
         return { text: 'Pekerjaan Selesai', disabled: true };
      default:
        return { text: '...', disabled: true };
    }
  };

  const tombolAksi = getTombolAksi();

  if (!tugasSaatIni) {
    return <div className="p-6 text-center text-xl">Memuat tugas...</div>
  }
  
  return (
    <div className="p-6">
      <NavigationPrompt 
        message={
            statusAplikasi === 'semua_selesai' 
            ? 'Semua tugas telah selesai!' 
            : `Tugas Saat Ini: Menuju ${tugasSaatIni.namaBlok}`
        }
      />

      {/* Card Peta Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Peta Analisis Lapangan</h2>
        <div className="relative h-[400px] border rounded-lg overflow-hidden">
          <Map 
            // Kirim data yang relevan ke komponen Map
            userPosition={posisiPetani}
            targetPosition={tugasSaatIni.koordinat}
          />
        </div>
      </div>

      {/* Tombol Aksi Utama */}
      <div className="mb-6">
        <button
          onClick={handleAksiUtama}
          disabled={tombolAksi.disabled}
          className={`w-full text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-colors text-lg ${
            tombolAksi.disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {tombolAksi.text}
        </button>
      </div>

      {/* Status Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-300">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Posisi Petani</h3>
            <p className="text-lg text-gray-700 mb-2">
              {posisiPetani ? `${posisiPetani.lat.toFixed(6)}, ${posisiPetani.lon.toFixed(6)}` : 'Mencari sinyal GPS...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Status: {statusAplikasi.replace('_', ' ')}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-green-300">
            <h3 className="text-xl font-semibold mb-4 text-green-600">Tujuan Berikutnya</h3>
            <p className="text-lg text-gray-700 mb-2">{tugasSaatIni.namaBlok}</p>
            <p className="text-sm text-gray-500 mt-2">Koordinat: {tugasSaatIni.koordinat.lat}, {tugasSaatIni.koordinat.lon}</p>
          </div>
      </div>

      {/* Notifikasi */}
      <div className="mt-4">
        <NotificationCard
          key={notifikasi.message} // ganti key agar animasi berjalan setiap ada notif baru
          type={notifikasi.type}
          title={notifikasi.title || "Informasi"}
          message={notifikasi.message}
        />
     </div>
    </div>
  );
};

export default Analisis;
