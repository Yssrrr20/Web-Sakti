import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

// Data untuk PieChart
const data = [
  { label: 'Pohon Sehat', value: 74 },
  { label: 'Pohon Terinfeksi', value: 26 },
];

const size = {
  width: 290,
  height: 290,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 40,
}));

const LabelContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px',
  gap: '20px',
});

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

export default function StatusKesehatan() {
  // Menghitung total nilai untuk persentase
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
  const healthyPercentage = ((data[0].value / totalValue) * 100);
  const infectedPercentage = ((data[1].value / totalValue) * 100);

  // Menghitung selisih persentase antara Pohon Sehat dan Pohon Terinfeksi, membulatkan ke integer
  const differencePercentage = Math.round(healthyPercentage - infectedPercentage);  // Membulatkan ke integer
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      {/* Judul di atas chart */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Status Kesehatan Pohon</h3>
      
      
      <PieChart
        series={[{
          data,
          innerRadius: 90,
          backgorundColors: ['#4CAF50', '#F44336'], 
        }]}
        {...size}
        hideLegend={true}
      >
        {/* Menampilkan selisih persentase di tengah chart */}
        <PieCenterLabel>{`${differencePercentage}%`}</PieCenterLabel>
      </PieChart>

      {/* Label untuk Pohon Sehat dan Pohon Terinfeksi */}
      <LabelContainer>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
          <p className="text-gray-700">Pohon Sehat</p>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-yellow-500 rounded-full mr-2"></div>
          <p className="text-gray-700">Pohon Terinfeksi</p>
        </div>
      </LabelContainer>
    </div>
  );
}
