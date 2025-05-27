import React from 'react';

const RiwayatAktivitas = () => {
  const aktivitasData = [
    { waktu: '09:45', aktivitas: 'Pembaruan Sensor', lokasi: 'Blok A', status: 'Selesai' },
    { waktu: '09:30', aktivitas: 'Kalibrasi pH', lokasi: 'Blok B', status: 'Proses' },
    { waktu: '09:15', aktivitas: 'Pengukuran Nutrisi', lokasi: 'Blok C', status: 'Selesai' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Riwayat Aktivitas</h3>

      {/* Wrapper untuk membuat tabel scrollable di perangkat mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-600">Waktu</th>
              <th className="py-2 px-4 text-left text-gray-600">Aktivitas</th>
              <th className="py-2 px-4 text-left text-gray-600">Lokasi</th>
              <th className="py-2 px-4 text-left text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {aktivitasData.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 text-gray-700">{item.waktu}</td>
                <td className="py-2 px-4 text-gray-700">{item.aktivitas}</td>
                <td className="py-2 px-4 text-gray-700">{item.lokasi}</td>
                <td className="py-2 px-4">
                  {/* Menambahkan warna berdasarkan status */}
                  <span
                    className={`inline-block px-3 py-1 text-white text-sm rounded-full ${
                      item.status === 'Selesai'
                        ? 'bg-green-500'
                        : item.status === 'Proses'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiwayatAktivitas;
