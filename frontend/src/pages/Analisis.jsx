import React from 'react';
import Map from '../components/Map';
import NotificationCard from '../components/NotificationCard';
import NavigationPrompt from '../components/NavigationPrompt';

const Analisis = () => {
  return (
    <div className="p-6">
        {/* Petunjuk Navigasi */}
        <NavigationPrompt 
          message="Petugas mengikuti arahan sistem" 
        />

      {/* Card Peta Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Peta Analisis Perkebunan</h2>
        <div className="relative h-[600px] border rounded-lg overflow-hidden">
          <Map />
        </div>
      </div>

        {/* Status Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Card Posisi Petani Saat Ini */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-300">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Posisi Petani Saat Ini</h3>
            <p className="text-lg text-gray-700 mb-2">Petani saat ini berada di blok A7</p>
            <p className="text-sm text-gray-500 mt-2">Status: Mengambil data</p>
        </div>

        {/* Card Blok Berikutnya */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-green-300">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Blok Berikutnya</h3>
          <p className="text-lg text-gray-700 mb-2">Blok yang harus didatangi selanjutnya adalah blok B5 untuk pemeriksaan.</p>
          <p className="text-sm text-gray-500 mt-2">Status: Menunggu Instruksi</p>
        </div>
        </div>

      {/* Notifikasi */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NotificationCard
          type="info"
          title="Informasi Sistem"
          message="Sudah berada di lokasi sesuai"
        />
        <NotificationCard
          type="warning"
          title="Peringatan"
          message="Sensor belum menyimpan data"
        />
        <NotificationCard
          type="success"
          title="Sukses"
          message="Data berhasil disimpan lanjut ke lokasi berikutnya"
        />
     </div>
    </div>
  );
};

export default Analisis;
