import React from 'react';
import Card from '../components/Card';
import Map from '../components/Map';
import ParameterTanahChart from '../components/ParameterTanahChart';
import MonitoringBlockTable from '../components/MonitoringBlockTable';
import StatusTongkat from '../components/StatusTongkat';
import StatusDrone from '../components/StatusDrone';

const PetaPage = () => {
  // Data untuk Monitoring Blok
  const monitoringData = [
    { blok: 'Blok A1', total: 120, sehat: 115, terinfeksi: 5, suhu: 28.5, ph: 6.5, kelembaban: 75 },
    { blok: 'Blok A2', total: 150, sehat: 142, terinfeksi: 8, suhu: 27.8, ph: 6.8, kelembaban: 72 },
    { blok: 'Blok B1', total: 130, sehat: 128, terinfeksi: 2, suhu: 28.2, ph: 6.2, kelembaban: 70 },
  ];

  return (
    <div className="min-h-screen bg-white-100 p-6">
      {/* Card 4 status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Pohon" count={1234} icon="fa-tree" color="bg-blue-500" />
        <Card title="Pohon Sehat" count={950} icon="fa-leaf" color="bg-green-500" />
        <Card title="Pohon Terinfeksi" count={150} icon="fa-virus" color="bg-red-500" />
        <Card title="Perangkat Aktif" count={23} icon="fa-wifi" color="bg-purple-500" />
      </div>

      {/* Peta Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Peta Overview</h2>
            <div className="h-[500px]">
              <Map />
            </div>
          </div>
        </div>

        {/* Card Parameter Tanah */}
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Parameter Tanah</h2>
            <div className="h-[500px]">
              <ParameterTanahChart />
            </div>
          </div>
        </div>
      </div>

      {/* Card Monitoring Blok */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Monitoring Blok</h2>
          <MonitoringBlockTable data={monitoringData} />
        </div>
      </div>

      {/* Grid for Status Tongkat & Status Drone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status Tongkat */}
        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-y-auto">
            <StatusTongkat />
          </div>
        </div>

        {/* Status Drone */}
        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Status Drone</h2>
            <div className="space-y-6">
              <StatusDrone
                name="Drone Pemindai 1"
                model="DJI Phantom 4 RTK"
                status="Siap Terbang"
                lastFlight="2 jam yang lalu"
                area="3 Blok"
                battery={85}
              />
              <StatusDrone
                name="Drone Pemindai 2"
                model="DJI Mavic 2 Pro"
                status="Tidak Aktif"
                lastFlight="5 jam yang lalu"
                area="5 Blok"
                battery={65}
              />
              <StatusDrone
                name="Drone Pemindai 3"
                model="Autel EVO II"
                status="Siap Terbang"
                lastFlight="1 jam yang lalu"
                area="2 Blok"
                battery={90}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetaPage;
