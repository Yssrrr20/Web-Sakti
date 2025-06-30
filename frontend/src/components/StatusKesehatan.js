// pages/StatusKesehatan.js

import React, { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';


const size = {
  width: 290,
  height: 290,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 40,
  fontWeight: 'bold',
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

export default function StatusKesehatan() {
  const [chartData, setChartData] = useState([]);
  const [totalPohon, setTotalPohon] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        // Panggil endpoint statistik kita (menggunakan proxy)
        const response = await fetch(`/api/summary/stats`);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }
        const data = await response.json();

        // Siapkan data untuk pie chart
        const formattedData = [
          { label: 'Sehat', value: parseInt(data.pohonSehat) || 0, color: '#22c55e' },
          { label: 'Terinfeksi', value: parseInt(data.pohonSakit) || 0, color: '#ef4444' },
          { label: 'Potensial', value: parseInt(data.pohonPotensial) || 0, color: '#f97316' },
        ];

        setChartData(formattedData);
        setTotalPohon(data.totalPohon || 0);

      } catch (err) {
        setError(err.message);
        console.error("Gagal mengambil data kesehatan pohon:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []); // Array dependensi kosong agar hanya berjalan sekali

  // Tampilkan pesan loading
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full flex justify-center items-center" style={{height: `${size.height + 100}px`}}>
        <p className="text-gray-500">Memuat data chart...</p>
      </div>
    );
  }

  // Tampilkan pesan error
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full flex justify-center items-center" style={{height: `${size.height + 100}px`}}>
        <p className="text-red-500">Gagal memuat data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Status Kesehatan Pohon</h3>
      
      <div style={{ position: 'relative', width: size.width, height: size.height, margin: '0 auto' }}>
        <PieChart
          series={[{
            data: chartData,
            innerRadius: 90,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 80, additionalRadius: -10, color: 'gray' },
          }]}
          {...size}
          hideLegend={true}
        >
          {/* Menampilkan jumlah total pohon di tengah chart */}
          <PieCenterLabel>{totalPohon}</PieCenterLabel>
        </PieChart>
      </div>

      {/* Legenda Dinamis di bawah chart */}
      <div className="flex justify-center mt-4 gap-4 flex-wrap">
        {chartData.map((item) => (
          <div key={item.label} className="flex items-center">
            <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            <span className="text-sm text-gray-700">{`${item.label} (${item.value})`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
