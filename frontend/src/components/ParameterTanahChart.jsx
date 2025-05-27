import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

// Mendaftarkan semua elemen yang diperlukan untuk Chart.js v4
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const ParameterTanahChart = () => {
  const data = {
    labels: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    datasets: [
      {
        label: 'Parameter Tanah 1',
        data: [22, 24, 20, 19, 23, 25],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Parameter Tanah 2',
        data: [20, 22, 18, 16, 20, 21],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  return <Line data={data} />;
};

export default ParameterTanahChart;
