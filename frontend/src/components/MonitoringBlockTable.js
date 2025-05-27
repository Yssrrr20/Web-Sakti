import React from 'react';

const MonitoringBlockTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left">Blok</th>
            <th className="py-3 px-4 text-left">Total Pohon</th>
            <th className="py-3 px-4 text-left">Sehat</th>
            <th className="py-3 px-4 text-left">Terinfeksi</th>
            <th className="py-3 px-4 text-left">Suhu (°C)</th>
            <th className="py-3 px-10 text-left">pH</th>
            <th className="py-3 px-4 text-left">Kelembaban (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((block, index) => (
            <tr key={index} className="border-t">
              <td className="py-3 px-4">{block.blok}</td>
              <td className="py-3 px-4">{block.total}</td>
              <td className="py-3 px-4 text-green-500">{block.sehat}</td>
              <td className="py-3 px-4 text-red-500">{block.terinfeksi}</td>
              <td className="py-3 px-4">{block.suhu}</td>
              <td className="py-3 px-4">{block.ph}</td>
              <td className="py-3 px-4">{block.kelembaban}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonitoringBlockTable;
