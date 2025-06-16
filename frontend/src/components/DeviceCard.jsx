import React, { useState } from 'react';

// Komponen lokal untuk baris data (tidak berubah)
const SensorRow = ({ icon, label, value, valueColor = "text-gray-900" }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <i className={`${icon} fa-fw text-blue-500`}></i>
      <span>{label}</span>
    </div>
    <span className={`text-sm font-bold ${valueColor}`}>{value}</span>
  </div>
);

export default function DeviceCard({
  name,
  block,
  online,
  battery,
  ph,
  temperature,
  humidity,
  lastUpdate,
  history, // Prop history ditambahkan kembali
}) {
  // State untuk mengontrol tampilan riwayat
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi untuk toggle state saat kartu diklik
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const batteryColor =
    battery > 50 ? "text-green-500" : battery > 20 ? "text-yellow-500" : "text-red-500";

  return (
    <div 
      className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={handleToggle} // Tambahkan onClick di kartu utama
    >
      {/* Header Kartu */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{block}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <i className={`fas fa-circle text-xs ${online ? "text-green-500 animate-pulse" : "text-gray-400"}`}></i>
          <span className={`${online ? "text-gray-700" : "text-gray-500"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Daftar data sensor vertikal */}
      <div className="bg-gray-50/50 rounded-lg p-3 mb-4">
        <SensorRow icon="fas fa-battery-half" label="Baterai" value={`${battery}%`} valueColor={batteryColor} />
        <SensorRow icon="fas fa-temperature-half" label="Suhu" value={`${temperature}°C`} />
        <SensorRow icon="fas fa-droplet" label="Kelembaban" value={`${humidity}%`} />
        <SensorRow icon="fas fa-flask" label="pH Tanah" value={ph} />
      </div>

      {/* BAGIAN BARU: Tampilan Riwayat (muncul saat isOpen true) */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-bold text-sm text-gray-700 mb-2">Riwayat Pengambilan Data</h4>
          <div className="overflow-y-auto max-h-48 text-xs">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2">Waktu</th>
                  <th className="p-2">Suhu</th>
                  <th className="p-2">Lembab</th>
                  <th className="p-2">pH</th>
                  <th className="p-2">Lokasi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {history && history.length > 0 ? (
                  history.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-2 whitespace-nowrap">{record.timestamp}</td>
                      <td className="p-2">{record.temperature}°C</td>
                      <td className="p-2">{record.humidity}%</td>
                      <td className="p-2">{record.ph}</td>
                      <td className="p-2 whitespace-nowrap">{`${record.gps_lat}, ${record.gps_long}`}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-400">
                      Tidak ada riwayat data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* AKHIR BAGIAN RIWAYAT */}

      {/* Footer Kartu */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4">
        <div className="flex items-center gap-2">
            <i className="far fa-clock"></i>
            <span>Pembaruan: {lastUpdate}</span>
        </div>
        <div className="flex items-center gap-3 text-base">
          <button className="hover:text-blue-500 focus:outline-none"><i className="fas fa-repeat"></i></button>
          <button className="hover:text-blue-500 focus:outline-none"><i className="fas fa-gear"></i></button>
          {/* Ikon panah sebagai indikator buka/tutup */}
          <i className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>
      </div>
    </div>
  );
}