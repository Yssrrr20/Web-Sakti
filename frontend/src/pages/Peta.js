// src/pages/Peta.js

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Card from '../components/Card';
import Map from '../components/Map';
import ParameterTanahChart from '../components/ParameterTanahChart';
import MonitoringBlockTable from '../components/MonitoringBlockTable';
import StatusTongkat from '../components/StatusTongkat';
import StatusDrone from '../components/StatusDrone';

const PetaPage = () => {
  // State untuk daftar file yang tersedia dari backend
  const [availableMaps, setAvailableMaps] = useState([]);
  const [availableCsvs, setAvailableCsvs] = useState([]);

  // State untuk file yang sedang aktif/dipilih
  const [selectedMapUrl, setSelectedMapUrl] = useState(null);
  const [treeData, setTreeData] = useState([]);
  
  // Data dummy
  const monitoringData = [
    { blok: 'Blok A1', total: 120, sehat: 115, terinfeksi: 5, suhu: 28.5, ph: 6.5, kelembaban: 75 },
    { blok: 'Blok A2', total: 150, sehat: 142, terinfeksi: 8, suhu: 27.8, ph: 6.8, kelembaban: 72 },
    { blok: 'Blok B1', total: 130, sehat: 128, terinfeksi: 2, suhu: 28.2, ph: 6.2, kelembaban: 70 },
  ];

  // Mengambil daftar file dari backend saat halaman dimuat
  useEffect(() => {
    fetch('http://localhost:5000/api/receiver/hasil-peta')
      .then(res => res.json())
      .then(files => setAvailableMaps(files))
      .catch(err => console.error("Gagal fetch daftar peta:", err));

    fetch('http://localhost:5000/api/receiver/hasil-csv')
      .then(res => res.json())
      .then(files => setAvailableCsvs(files))
      .catch(err => console.error("Gagal fetch daftar csv:", err));
  }, []);

  const handleMapSelectionChange = (event) => {
    const selectedFile = event.target.value;
    setSelectedMapUrl(selectedFile ? `http://localhost:5000/public/maps_tif/${selectedFile}` : null);
  };

  const handleCsvSelectionChange = (event) => {
    const selectedFile = event.target.value;
    if (selectedFile) {
      const csvUrl = `http://localhost:5000/api/receiver/csv-content/${selectedFile}`;
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Berhasil mem-parsing ${results.data.length} data pohon.`);
          setTreeData(results.data);
        },
        error: (err) => console.error("Error parsing CSV dari URL:", err),
      });
    } else {
      setTreeData([]);
    }
  };

  const pusatPetaAwal = [-7.2846, 112.7964];
  const zoomAwal = 16;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Card 4 status di bagian atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Pohon" count={1234} icon="fa-solid fa-tree" color="bg-blue-500" />
        <Card title="Pohon Sehat" count={950} icon="fa-solid fa-leaf" color="bg-green-500" />
        <Card title="Pohon Terinfeksi" count={150} icon="fa-solid fa-virus" color="bg-red-500" />
        <Card title="Perangkat Aktif" count={23} icon="fa-solid fa-wifi" color="bg-purple-500" />
      </div>

      {/* Grid untuk Peta dan Parameter Tanah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Peta Overview Hasil Analisis</h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <select onChange={handleMapSelectionChange} className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Pilih Peta Analisis...</option>
                  {availableMaps.map(file => <option key={file} value={file}>{file}</option>)}
                </select>
                <select onChange={handleCsvSelectionChange} className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Pilih Data Pohon...</option>
                  {availableCsvs.map(file => <option key={file} value={file}>{file}</option>)}
                </select>
              </div>
            </div>
            <div className="h-[500px] w-full">
              <Map 
                geoTiffUrl={selectedMapUrl} 
                treeData={treeData}
                initialCenter={pusatPetaAwal}
                initialZoom={zoomAwal}
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <h2 className="text-xl font-semibold mb-4">Parameter Tanah</h2>
            <div className="h-[500px]"><ParameterTanahChart /></div>
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
        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-y-auto">
            <StatusTongkat />
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Status Drone</h2>
            <div className="space-y-6">
              <StatusDrone name="Drone Pemindai 1" model="DJI Phantom 4 RTK" status="Siap Terbang" lastFlight="2 jam yang lalu" area="3 Blok" battery={85} />
              <StatusDrone name="Drone Pemindai 2" model="DJI Mavic 2 Pro" status="Tidak Aktif" lastFlight="5 jam yang lalu" area="5 Blok" battery={65} />
              <StatusDrone name="Drone Pemindai 3" model="Autel EVO II" status="Siap Terbang" lastFlight="1 jam yang lalu" area="2 Blok" battery={90} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetaPage;