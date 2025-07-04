// src/pages/Peta.js

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Tambahkan useRef
import Papa from 'papaparse';
import DashboardStats from '../components/DashboardStats';
import Map from '../components/Map';
import NotificationCard from '../components/NotificationCard';

// Pindahkan defaultMapCenter dan defaultMapZoom ke luar komponen agar referensinya stabil
const DEFAULT_MAP_CENTER = [-6.5517, 106.7166];
const DEFAULT_MAP_ZOOM = 17;

const PetaPage = () => {
  // --- STATE PETA ---
  const [posisiPetani, setPosisiPetani] = useState(null);
  // currentMapCenter dan currentMapZoom sekarang akan menjadi nilai Awal peta dan dikendalikan oleh handleMapChange
  const [currentMapCenter, setCurrentMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [currentMapZoom, setCurrentMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [notifikasi, setNotifikasi] = useState(null); 
  
  // --- STATE UNTUK SIMULASI GPS ---
  const [isGpsSimulationActive, setIsGpsSimulationActive] = useState(false);
  const [simulatedLat, setSimulatedLat] = useState('');
  const [simulatedLon, setSimulatedLon] = useState('');

  // --- STATE DATA PETA ---
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
  const [showZones, setShowZones] = useState(true);

  // --- STATE TAMBAHAN UNTUK AKSI PENGAMBILAN DATA  ---
  const [statusPengambilanData, setStatusPengambilanData] = useState('siap_ambil_data'); 

  // --- REFS UNTUK MENCEGAH LOOP NOTIFIKASI GPS ---
  const gpsNotifiedRef = useRef({ realGps: false, simulatedGps: false, errorGps: false });
  // Ref untuk menyimpan fungsi setView dari komponen Map
  const mapControlRef = useRef(null); 


  // --- FUNGSI FETCH DATA ---
  const fetchZones = () => fetch(`/api/zones`).then(res => res.json()).then(setZones).catch(console.error);
  
  // Mengambil daftar file dan zona saat komponen dimuat
  useEffect(() => {
    fetchZones();
    fetch(`/api/receiver/hasil-peta`).then(res => res.json()).then(setAvailableMaps).catch(console.error);
    fetch(`/api/receiver/hasil-csv`).then(res => res.json()).then(data => {
        setAvailableTreeFiles(data.treeFiles || []);
        setAvailableSoilFiles(data.soilFiles || []);
    }).catch(console.error);
  }, []);

  // Logika memuat data dari CSV
  useEffect(() => {
    if (selectedTreeFile) {
      Papa.parse(`/api/receiver/csv-content/${selectedTreeFile}`, {
          download: true, header: true, skipEmptyLines: true,
          complete: (results) => setTreeData(results.data),
          error: (err) => console.error("PapaParse error (Tree):", err)
      });
    } else {
      setTreeData([]);
    }
  }, [selectedTreeFile]);

  useEffect(() => {
    if (selectedSoilFile) {
      Papa.parse(`/api/receiver/csv-content/${selectedSoilFile}`, {
          download: true, header: true, skipEmptyLines: true,
          complete: (results) => setSoilData(results.data),
          error: (err) => console.error("PapaParse error (Soil):", err)
      });
    } else {
      setSoilData([]);
    }
  }, [selectedSoilFile]);
  
  // --- FUNGSI-FUNGSI UNTUK GPS & KONTROL PETA ---

  // Handler untuk mengubah tampilan peta dan mengupdate state di PetaPage
  const handleMapChange = useCallback((center, zoom) => {
    setCurrentMapCenter(center);
    setCurrentMapZoom(zoom);
  }, []); 

  // Hook untuk mengambil lokasi GPS petani 
  useEffect(() => {
    let watchId;

    const handleGpsSuccess = (position) => {
      const newPos = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy };
      setPosisiPetani(newPos);
      // Notifikasi hanya sekali saat GPS asli berhasil didapat setelah tidak ada atau error
      if (!gpsNotifiedRef.current.realGps) {
          setNotifikasi({ type: 'info', title: 'GPS Ditemukan', message: 'Lokasi Anda terdeteksi. Gunakan tombol crosshair untuk memusatkan peta.' });
          gpsNotifiedRef.current.realGps = true;
          gpsNotifiedRef.current.simulatedGps = false; 
          gpsNotifiedRef.current.errorGps = false; 
      }
    };

    const handleGpsError = (error) => {
      console.error("GPS Error:", error);
      if (!gpsNotifiedRef.current.errorGps) {
          setNotifikasi({ type: 'error', title: 'GPS Error', message: `Gagal mendapatkan lokasi GPS: ${error.message}. Mode simulasi tersedia.` });
          gpsNotifiedRef.current.errorGps = true;
          gpsNotifiedRef.current.realGps = false; 
          gpsNotifiedRef.current.simulatedGps = false; 
      }
      setPosisiPetani(null); 
    };

    if (!isGpsSimulationActive) { // MODE GPS ASLI
      watchId = navigator.geolocation.watchPosition(
        handleGpsSuccess,
        handleGpsError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    } else { // MODE SIMULASI GPS
      const latToUse = simulatedLat !== '' ? parseFloat(simulatedLat) : DEFAULT_MAP_CENTER[0];
      const lonToUse = simulatedLon !== '' ? parseFloat(simulatedLon) : DEFAULT_MAP_CENTER[1];
      
      const newPos = { lat: latToUse, lon: lonToUse, accuracy: 5 };
      setPosisiPetani(newPos);
      
      // Notifikasi hanya sekali saat simulasi aktif
      if (!gpsNotifiedRef.current.simulatedGps) {
          setNotifikasi({ type: 'info', title: 'GPS Simulasi Aktif', message: 'Peta siap dengan lokasi simulasi. Gunakan tombol crosshair untuk memusatkan.' });
          gpsNotifiedRef.current.simulatedGps = true;
          gpsNotifiedRef.current.realGps = false; 
          gpsNotifiedRef.current.errorGps = false; 
      }
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      // Reset notifikasi flags saat komponen di-unmount atau useEffect di-cleanup
      gpsNotifiedRef.current = { realGps: false, simulatedGps: false, errorGps: false };
    };
  }, [isGpsSimulationActive, simulatedLat, simulatedLon, DEFAULT_MAP_CENTER]); // Dependensi

  // Handler untuk tombol "Pusatkan ke GPS"
  const handleCenterMapToGps = () => {
      if (posisiPetani) {
          // Panggil fungsi setView dari komponen Map melalui ref
          if (mapControlRef.current) {
              mapControlRef.current(posisiPetani.lat, posisiPetani.lon, DEFAULT_MAP_ZOOM);
              setNotifikasi({ type: 'info', title: 'Peta Dipusatkan', message: 'Peta telah dipusatkan ke lokasi Anda saat ini.' });
          }
      } else {
          setNotifikasi({ type: 'warning', title: 'Lokasi Tidak Tersedia', message: 'Tidak dapat memusatkan peta. Lokasi GPS belum ditemukan.' });
          console.warn("Tidak dapat memusatkan: Posisi GPS petani belum tersedia."); // Konsol warn ini tetap ada
      }
  };


  // --- HANDLER UNTUK AKSI PENGAMBILAN DATA (DARI ANALISIS.JSX) ---
  const handleAksiPengambilanData = () => {
    if (posisiPetani) {
      // Cari zona terdekat
      let zonaTerdekat = 'Tidak Diketahui';
      if (zones.length > 0) {
          const findZoneByPosition = (lat, lon) => {
              for (const zone of zones) {
                  // Pastikan properti batas ada dan valid
                  if (zone.bounds_sw_lat && zone.bounds_sw_lng && zone.bounds_ne_lat && zone.bounds_ne_lng) {
                      const swLat = parseFloat(zone.bounds_sw_lat);
                      const swLng = parseFloat(zone.bounds_sw_lng);
                      const neLat = parseFloat(zone.bounds_ne_lat);
                      const neLng = parseFloat(zone.bounds_ne_lng);

                      if (lat >= swLat && lat <= neLat && lon >= swLng && lon <= neLng) {
                          return zone.zone_name;
                      }
                  }
              }
              return 'Tidak Diketahui';
          };
          zonaTerdekat = findZoneByPosition(posisiPetani.lat, posisiPetani.lon); // Perbaikan TYPO: posisiPetisi.lon
      }


      setStatusPengambilanData('mengambil_data');
      setNotifikasi({ 
          type: 'success', 
          title: 'Data Berhasil Dicatat!', 
          message: `Berhasil ambil data di zona ${zonaTerdekat} pada koordinat ${posisiPetani.lat.toFixed(6)}, ${posisiPetani.lon.toFixed(6)}.` 
      });
      // TODO: Implementasi logika pencatatan data aktual di sini (misalnya, kirim ke API)
    } else {
      setNotifikasi({ type: 'error', title: 'Gagal Ambil Data', message: 'Tidak dapat mencatat data, posisi GPS tidak tersedia.' });
      console.warn("Gagal mencatat data: posisi GPS tidak tersedia."); // Konsol warn ini tetap ada
    }
  };

  const handleSelesaiPengambilanData = () => {
    setStatusPengambilanData('selesai_ambil_data');
    setNotifikasi({ type: 'success', title: 'Sesi Selesai', message: 'Anda telah menyelesaikan sesi pencatatan data.' });
  };

  // Menentukan teks dan status tombol aksi pengambilan data
  const getTombolPengambilanData = () => {
    const disabled = !posisiPetani || statusPengambilanData === 'selesai_ambil_data';
    switch (statusPengambilanData) {
      case 'siap_ambil_data': return { text: 'Ambil Data', disabled: disabled };
      case 'mengambil_data': return { text: 'Ambil Data Lagi', disabled: disabled };
      case 'selesai_ambil_data': return { text: 'Sesi Selesai', disabled: true };
      default: return { text: 'Ambil Data', disabled: disabled };
    }
  };


  // Handler untuk memilih peta latar GeoTIFF
  const handleMapSelectionChange = (event) => {
    const selectedFile = event.target.value;
    setSelectedMapUrl(selectedFile ? `/public/maps_tif/${selectedFile}` : null);
  };

  // Handler untuk tombol "Buat Ulang Zona Analisis"
  const handleGenerateZones = async () => {
    setIsGeneratingZones(true);
    try {
        const response = await fetch('/api/zones/generate-grid', { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal membuat zona.');
        
        alert(result.message);
        setShowZones(true);
        fetchZones(); 
    } catch (error) {
        alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
        setIsGeneratingZones(false);
    }
  };

  const mapCenterToUse = currentMapCenter; // Initial center for Map component
  const tombolPengambilanData = getTombolPengambilanData();

  // Callback untuk menerima fungsi kontrol peta dari komponen Map
  const setMapControl = useCallback((controlFunction) => {
      mapControlRef.current = controlFunction;
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6"><DashboardStats /></div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Kolom Peta */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Peta Overview</h2>
              <select onChange={handleMapSelectionChange} className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Pilih Peta Latar (GeoTIFF)...</option>
                {availableMaps.map(file => <option key={file} value={file}>{file}</option>)}
              </select>
            </div>
            <div className="h-[500px] w-full border rounded-lg overflow-hidden bg-gray-200">
              <Map
                geoTiffUrl={selectedMapUrl}
                treeData={treeData}
                soilData={soilData}
                zones={showZones ? zones : []}
                isInteractive={true}
                initialCenter={mapCenterToUse} 
                initialZoom={currentMapZoom} 
                userPosition={posisiPetani}
                targetPosition={null}
                onMapChange={handleMapChange}
                setMapCenterAndZoom={setMapControl} 
              />
              {/* Tombol Pusatkan ke GPS */}
              <button
                onClick={handleCenterMapToGps}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-[1000] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                title="Pusatkan Peta ke Lokasi GPS Anda"
                disabled={!posisiPetani}
              >
                <i className="fas fa-crosshairs text-lg"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Kolom Kontrol Lapisan & Aksi */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Layer Control & Actions</h2>
            {/* Kontrol Simulasi GPS */}
            <div className="space-y-4 mb-4 pb-4 border-b">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <i className="fas fa-satellite-dish mr-2 text-blue-500"></i> Kontrol GPS (Simulasi)
                </h3>
                <div className="flex items-center justify-between">
                    <label htmlFor="toggle-gps-simulation" className="flex items-center cursor-pointer">Aktifkan Simulasi GPS:</label>
                    <label htmlFor="toggle-gps-simulation" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="toggle-gps-simulation"
                                className="sr-only"
                                checked={isGpsSimulationActive}
                                onChange={() => {
                                    setIsGpsSimulationActive(!isGpsSimulationActive);
                                }}
                            />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isGpsSimulationActive ? 'transform translate-x-6 bg-green-400' : ''}`}></div>
                        </div>
                    </label>
                </div>

                {isGpsSimulationActive && (
                    <div className="space-y-2">
                        <div>
                            <label htmlFor="simulatedLat" className="block text-sm font-medium text-gray-700">Simulasi Lintang (Lat):</label>
                            <input
                                type="number"
                                id="simulatedLat"
                                value={simulatedLat}
                                onChange={(e) => setSimulatedLat(e.target.value)}
                                placeholder={posisiPetani ? posisiPetani.lat.toString() : DEFAULT_MAP_CENTER[0].toString()}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                step="0.000001"
                            />
                        </div>
                        <div>
                            <label htmlFor="simulatedLon" className="block text-sm font-medium text-gray-700">Simulasi Bujur (Lon):</label>
                            <input
                                type="number"
                                id="simulatedLon"
                                value={simulatedLon}
                                onChange={(e) => setSimulatedLon(e.target.value)}
                                placeholder={posisiPetani ? posisiPetani.lon.toString() : DEFAULT_MAP_CENTER[1].toString()}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                step="0.000001"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-grow">
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
              <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2">Legenda Zona</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#ef4444' }}></span><span>Prioritas Merah</span></li>
                    <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#eab308' }}></span><span>Tanah Asam</span></li>
                    <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#3b82f6' }}></span><span>Sehat</span></li>
                    <li className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#94a3b8' }}></span><span>Normal</span></li>
                  </ul>
              </div>
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
            <div className="mt-6 pt-4 border-t">
                 <h3 className="font-semibold text-gray-700 mb-2">Analisis Zona</h3>
                 <button onClick={handleGenerateZones} disabled={isGeneratingZones} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                    {isGeneratingZones ? 'Menganalisis...' : 'Buat Ulang Zona'}
                 </button>
                 <p className="text-xs text-gray-500 mt-2">Aksi ini akan menghapus zona lama dan membuat yang baru berdasarkan data terkini.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kolom Aksi Pengambilan Data */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Aksi Pengambilan Data</h2>
          <div className="space-y-4">
            <button
              onClick={handleAksiPengambilanData}
              disabled={tombolPengambilanData.disabled}
              className={`w-full text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-colors text-lg ${
                tombolPengambilanData.disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {tombolPengambilanData.text}
            </button>

            <button
              onClick={handleSelesaiPengambilanData}
              disabled={statusPengambilanData === 'selesai_ambil_data'}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors text-md ${
                  statusPengambilanData === 'selesai_ambil_data'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Selesai Mengambil Data
            </button>
          </div>
        </div>
      </div>

      {/* Notifikasi Sistem di Bagian Bawah */}
      {notifikasi && (
        <div className="mt-4">
          <NotificationCard type={notifikasi.type} title={notifikasi.title} message={notifikasi.message} />
        </div>
      )}

      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Detail Analisis per Zona</h2>
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
      
    </div>
  );
};

export default PetaPage;