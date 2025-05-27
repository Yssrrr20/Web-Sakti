import React from 'react';

const PerubahanParameter = () => {
  const perubahanData = [
    { lokasi: 'Blok A', parameter: 'Suhu', perubahan: '27°C → 28°C' },
    { lokasi: 'Blok B', parameter: 'Kelembaban', perubahan: '70% → 75%' },
    { lokasi: 'Blok C', parameter: 'pH', perubahan: '6.2 → 6.5' },
    { lokasi: 'Blok A', parameter: 'Suhu', perubahan: '27°C → 28°C' },
    { lokasi: 'Blok B', parameter: 'Kelembaban', perubahan: '70% → 75%' },
    { lokasi: 'Blok C', parameter: 'pH', perubahan: '6.2 → 6.5' },
    { lokasi: 'Blok A', parameter: 'Suhu', perubahan: '27°C → 28°C' },
    { lokasi: 'Blok B', parameter: 'Kelembaban', perubahan: '70% → 75%' },
    { lokasi: 'Blok C', parameter: 'pH', perubahan: '6.2 → 6.5' },
  ];

  return (
    <div>
      {/* Table untuk perubahan parameter */}
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left text-gray-600">Lokasi</th>
            <th className="py-2 px-4 text-left text-gray-600">Parameter</th>
            <th className="py-2 px-4 text-left text-gray-600">Perubahan</th>
          </tr>
        </thead>
        <tbody>
          {perubahanData.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="py-2 px-4 text-gray-700">{item.lokasi}</td>
              <td className="py-2 px-4 text-gray-700">{item.parameter}</td>
              <td className="py-2 px-4 text-gray-700">{item.perubahan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
 

export default PerubahanParameter;
