import React, { useEffect, useState } from 'react';
import Card from '../components/Card'; 
import FilterBar from '../components/FilterBar';
import DeviceCard from '../components/DeviceCard';

const Perangkat = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch('http://localhost:3001/api/status_perangkat')
    .then(res => res.json())
    .then(data => {
      const mappedDevices = data.map(d => ({
        ...d,
        online: d.status === 'active'  // jika status 'active' maka online true
      }));
      setDevices(mappedDevices);
      setLoading(false);
    })
    .catch(err => {
      console.error('Gagal fetch data perangkat:', err);
      setLoading(false);
    });
}, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-white-100 px-4 py-6 sm:px-6">
      {/* Card 4 status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Perangkat" count={devices.length} icon="fa-solid fa-laptop-code" color="bg-blue-500" />
        <Card title="Perangkat Online" count={devices.filter(d => d.online).length} icon="fa-solid fa-wifi" color="bg-green-500" />
        <Card title="Perangkat Offline" count={devices.filter(d => !d.online).length} icon="fa-solid fa-laptop-medical" color="bg-red-500" />
        <Card title="Dalam Perawatan" count={0} icon="fa-solid fa-house-laptop" color="bg-purple-500" /> {/* Contoh statis */}
      </div>

      <div className="p-6">
        <FilterBar />
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {devices.map(device => (
          <DeviceCard
          key={device.id}
          name={device.serial_number}
          block="Blok A-3"
          online={device.status === 'active'}  // cek status di backend
          battery={85}  // bisa diganti kalau ada data baterai
          ph={device.pH}
          temperature={device.temperature}
          humidity={device.kelembapan}
          npk={{ n: device.nitrogen, p: device.phosphor, k: device.kalium }}
          lastUpdate={new Date(device.timestamp).toLocaleString()}
          />
        ))}
      </div>
    </div>
  );
};

export default Perangkat;
