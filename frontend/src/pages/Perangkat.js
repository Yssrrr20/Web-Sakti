// src/pages/Perangkat.js

import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import DeviceCard from '../components/DeviceCard';

const Perangkat = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State khusus untuk data ringkasan dari tabel sensors ---
  const [summaryData, setSummaryData] = useState({ total: 0, active: 0, inactive: 0 });

  const [logMessages, setLogMessages] = useState(['[INFO] Menunggu perintah pengiriman...']);

  useEffect(() => {
    // --- Fetch data ringkasan dari endpoint ---
    fetch(`/api/sensors/summary`)
      .then(res => res.json())
      .then(summary => setSummaryData(summary))
      .catch(err => console.error('Gagal fetch data ringkasan:', err));

    // Fetch data detail untuk DeviceCard 
    fetch(`/api/status_perangkat`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(dataFromApi => {
        const mappedDevices = dataFromApi.map(device => ({
          id: device.id,
          serial_number: device.serial_number,
          status: device.status,
          battery: device.battery || 85,
          pH: device.pH,
          temperature: device.temperature,
          kelembapan: device.kelembapan,
          timestamp: device.timestamp,
          history: device.history.map(hist => ({
            timestamp: hist.timestamp,
            temperature: hist.temperature,
            humidity: hist.kelembapan,
            ph: hist.pH,
            gps_lat: hist.gps_lat,
            gps_long: hist.gps_long
          })),
        }));
        
        setDevices(mappedDevices);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal fetch data perangkat:', err);
        setLoading(false);
      });
  }, []);

  const handleSendData = async () => {
    setLogMessages([`[${new Date().toLocaleTimeString()}] [INFO] Mengirim perintah ke backend untuk memulai pengiriman file CSV...`]);
    
    try {
      const response = await fetch(`/api/send_csv_to_training`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Server merespons dengan status: ${response.status}`);
      }

      const result = await response.json();

      setLogMessages(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] [SUCCESS] Backend merespons: ${result.message}`]);
      if (result.details) {
          setLogMessages(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] [DETAIL] File terkirim: ${result.details.sentCount}, Gagal: ${result.details.failedCount}`]);
      }

    } catch (error) {
      console.error('Gagal memicu pengiriman:', error);
      setLogMessages(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] [ERROR] Gagal terhubung ke backend: ${error.message}`]);
    }
  };

  if (loading && devices.length === 0) return <p className="text-center mt-8">Memuat data dari server...</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      {/* --- Card ringkasan menggunakan state summaryData --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Perangkat" count={summaryData.total} icon="fa-solid fa-laptop-code" color="bg-blue-500" />
        <Card title="Perangkat Online" count={summaryData.active} icon="fa-solid fa-wifi" color="bg-green-500" />
        <Card title="Perangkat Offline" count={summaryData.inactive} icon="fa-solid fa-laptop-medical" color="bg-red-500" />
        <Card title="Dalam Perawatan" count={0} icon="fa-solid fa-house-laptop" color="bg-purple-500" />
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            name={device.serial_number}
            block="Blok A-3"
            online={device.status === 'active'}
            battery={device.battery}
            ph={device.pH}
            temperature={device.temperature}
            humidity={device.kelembapan}
            lastUpdate={new Date(device.timestamp).toLocaleString('id-ID')}
            history={device.history}
          />
        ))}
      </div>

      {/* UI Pengiriman Data */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Kirim Data Pelatihan Model</h2>
        <p className="text-sm text-gray-600 mb-4">
          Tekan tombol di bawah untuk mengirim data terbaru dari semua perangkat ke server training. Snapshot data saat ini.
        </p>
        
        <button
          onClick={handleSendData}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <i className="fas fa-paper-plane mr-2"></i>
          Kirim Data Terbaru
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Log Pengiriman</h3>
          <div className="bg-slate-900 text-white font-mono text-xs rounded-lg p-4 max-h-64 overflow-y-auto">
            {logMessages.map((msg, index) => (
              <p key={index} className="whitespace-pre-wrap leading-relaxed">{msg}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perangkat;