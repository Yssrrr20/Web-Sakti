// src/pages/Peta.js

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import DashboardStats from '../components/DashboardStats';
import Map from '../components/Map';
import StatusTongkat from '../components/StatusTongkat';
import StatusDrone from '../components/StatusDrone';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const PetaPage = () => {
  // --- STATE ---
  const [availableMaps, setAvailableMaps] = useState([]);
  const [availableTreeFiles, setAvailableTreeFiles] = useState([]);
  const [availableSoilFiles, setAvailableSoilFiles] = useState([]);
  const [selectedMapUrl, setSelectedMapUrl] = useState(null);
  const [selectedTreeFile, setSelectedTreeFile] = useState('');
  const [selectedSoilFile, setSelectedSoilFile] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [soilData, setSoilData] = useState([]);
  const [zones, setZones] = useState([]);
  const [isGeneratingZones, setIsGeneratingZones] = useState(false);
  
  // --- STATE BARU UNTUK VISIBILITAS ZONA ---
  const [showZones, setShowZones] = useState(true);

  // --- FUNGSI-FUNGSI ---
  const fetchZones = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/zones`);
        if (!response.ok) throw new Error('Gagal mengambil data zona');
        const data = await response.json();
        setZones(data);
    } catch (error) {
        console.error("Gagal fetch data zona:", error);
    }
  };

  useEffect(() => {
    fetchZones();
    fetch(`${API_BASE_URL}/api/receiver/hasil-peta`).then(res => res.json()).then(setAvailableMaps);
    fetch(`${API_BASE_URL}/api/receiver/hasil-csv`).then(res => res.json()).then(data => {
        setAvailableTreeFiles(data.treeFiles || []);
        setAvailableSoilFiles(data.soilFiles || []);
    });
  }, []);

  useEffect(() => {
    if (selectedTreeFile) {
      Papa.parse(`${API_BASE_URL}/api/receiver/csv-content/${selectedTreeFile}`, { download: true, header: true, skipEmptyLines: true, complete: (results) => setTreeData(results.data) });
    } else {
      setTreeData([]);
    }
  }, [selectedTreeFile]);

  useEffect(() => {
    if (selectedSoilFile) {
      Papa.parse(`${API_BASE_URL}/api/receiver/csv-content/${selectedSoilFile}`, { download: true, header: true, skipEmptyLines: true, complete: (results) => setSoilData(results.data) });
    } else {
      setSoilData([]);
    }
  }, [selectedSoilFile]);

  const handleMapSelectionChange = (event) => {
    const selectedFile = event.target.value;
    setSelectedMapUrl(selectedFile ? `${API_BASE_URL}/public/maps_tif/${selectedFile}` : null);
  };

  const handleGenerateZones = async () => {
    setIsGeneratingZones(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/zones/generate-grid`, { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal membuat zona.');
        alert(result.message);
        setShowZones(true); // Otomatis tampilkan zona setelah dibuat
        fetchZones();
    } catch (error) {
        alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
        setIsGeneratingZones(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6"><DashboardStats /></div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Kolom Peta */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Peta Overview</h2>
              <select onChange={handleMapSelectionChange} className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Pilih Peta Latar...</option>
                {availableMaps.map(file => <option key={file} value={file}>{file}</option>)}
              </select>
            </div>
            <div className="h-[500px] w-full">
              {/* Kirim data zona secara kondisional */}
              <Map geoTiffUrl={selectedMapUrl} treeData={treeData} soilData={soilData} zones={showZones ? zones : []} />
            </div>
          </div>
        </div>
        {/* Kolom Kontrol Lapisan & Aksi */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Kontrol Lapisan & Aksi</h2>
            <div className="space-y-4 flex-grow">
              {/* Dropdown Layers */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Lapisan Kesehatan Pohon</h3>
                <select onChange={(e) => setSelectedTreeFile(e.target.value)} value={selectedTreeFile} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Tidak Tampil</option>
                  {availableTreeFiles.map(file => <option key={file} value={file}>{file}</option>)}
                </select>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Lapisan Data Tanah</h3>
                <select onChange={(e) => setSelectedSoilFile(e.target.value)} value={selectedSoilFile} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Tidak Tampil</option>
                  {availableSoilFiles.map(file => <option key={file} value={file}>{file}</option>)}
                </select>
              </div>
              {/* Legenda Zona */}
              <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2">Legenda Zona</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#ef4444' }}></span><span>Prioritas Merah</span></li>
                      <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#eab308' }}></span><span>Tanah Asam</span></li>
                      <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#3b82f6' }}></span><span>Sehat</span></li>
                      <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#94a3b8' }}></span><span>Normal</span></li>
                  </ul>
              </div>

              {/* --- PENAMBAHAN DI SINI: Tombol Toggle Zona --- */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Tampilkan Lapisan Zona</h3>
                    <label htmlFor="toggle-zones" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="toggle-zones" className="sr-only" checked={showZones} onChange={() => setShowZones(!showZones)} />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showZones ? 'transform translate-x-6 bg-green-400' : ''}`}></div>
                        </div>
                    </label>
                </div>
              </div>

            </div>
            {/* Tombol Aksi */}
            <div className="mt-6 pt-4 border-t">
                 <h3 className="font-semibold text-gray-700 mb-2">Analisis Zona</h3>
                 <button onClick={handleGenerateZones} disabled={isGeneratingZones} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                    {isGeneratingZones ? 'Menganalisis...' : 'Buat Ulang Zona'}
                 </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Tabel Detail Zona --- */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex-shrink-0">Detail Analisis per Zona</h2>
          {/* Wrapper div untuk mengontrol tinggi dan scroll */}
          <div className="overflow-auto max-h-80">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Zona</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pohon</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sehat</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terinfeksi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potensial</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Suhu (°C)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. pH</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Lembap (%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.length > 0 ? zones.map(zone => (
                  <tr key={zone.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{zone.zone_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.label}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.tree_count_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{zone.tree_count_healthy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{zone.tree_count_infected}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-semibold">{zone.tree_count_potential}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.avg_temperature ? parseFloat(zone.avg_temperature).toFixed(2) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.avg_ph ? parseFloat(zone.avg_ph).toFixed(2) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.avg_humidity ? parseFloat(zone.avg_humidity).toFixed(2) : 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data zona. Silakan buat zona analisis terlebih dahulu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sisa halaman tidak berubah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div><StatusTongkat /></div>
        <div><StatusDrone name="Drone Pemindai 1" model="DJI Phantom 4 RTK" status="Siap Terbang" lastFlight="2 jam yang lalu" area="3 Blok" battery={85} /></div>
      </div>
    </div>
  );
};

export default PetaPage;