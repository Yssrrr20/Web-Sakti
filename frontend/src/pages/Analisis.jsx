import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import NotificationCard from '../components/NotificationCard';
import NavigationPrompt from '../components/NavigationPrompt';

// --- FUNGSI HELPER INDEXEDDB ---
const DB_NAME = 'SaktiAppDB';
const DB_VERSION = 2;
const STORE_NAMES = {
  treeData: 'treeDataStore',
  soilData: 'soilDataStore',
  zones: 'zonesStore',
  tasks: 'tasksStore', // Dibiarkan ada, tapi tidak digunakan
  mapView: 'mapViewStore'
};

const openDb = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      Object.values(STORE_NAMES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'key' });
        }
      });
      // console.log(`[IndexedDB] Database '${DB_NAME}' upgraded to version ${DB_VERSION}. Stores created/checked.`);
    };
    request.onsuccess = (event) => {
      // console.log(`[IndexedDB] Database '${DB_NAME}' opened successfully.`);
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      console.error(`[IndexedDB] Error opening database '${DB_NAME}':`, event.target.error);
      reject(event.target.error);
    };
  });
};

const saveData = async (storeName, key, value) => {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put({ key: key, value: value });
      transaction.oncomplete = () => {
        // console.log(`[IndexedDB] Data saved to '${storeName}' with key '${key}'.`);
        resolve();
      };
      transaction.onerror = (event) => {
        console.error(`Transaction error (${storeName}):`, event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error(`Error saving data to IndexedDB (${storeName}):`, error);
  }
};

const loadData = async (storeName, key = 'data') => {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = (event) => {
        const result = event.target.result ? event.target.result.value : null;
        // console.log(`[IndexedDB] Data loaded from '${storeName}' with key '${key}':`, result);
        resolve(result);
      };
      request.onerror = (event) => {
        console.error(`Request error (${storeName}):`, event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error(`Error loading data from IndexedDB (${storeName}):`, error);
    return null;
  }
};
// --- AKHIR FUNGSI HELPER INDEXEDDB ---


// Helper function (tidak relevan tanpa tugas target)
const getDistanceInMeters = (pos1, pos2) => {
  if (!pos1 || !pos2 || isNaN(pos1.lat) || isNaN(pos1.lon) || isNaN(pos2.lat) || isNaN(pos2.lon)) {
    return Infinity;
  }
  const R = 6371e3;
  const lat1 = pos1.lat * Math.PI/180;
  const lat2 = pos2.lat * Math.PI/180;
  const deltaLat = (pos2.lat-pos1.lat) * Math.PI/180;
  const deltaLon = (pos2.lon-pos1.lon) * Math.PI/180;
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


const Analisis = () => {
  // State aplikasi yang disederhanakan
  const [posisiPetani, setPosisiPetani] = useState(null);
  const [statusAplikasi, setStatusAplikasi] = useState('memuat_gps_peta');
  const [notifikasi, setNotifikasi] = useState({ type: 'info', message: 'Mencari lokasi GPS dan memuat peta...' });

  // --- STATE DATA PETA (Default langsung agar peta tampil) ---
  const defaultMapCenter = [-6.5517, 106.7166];
  const defaultMapZoom = 17;
  const [currentMapCenter, setCurrentMapCenter] = useState(defaultMapCenter);
  const [currentMapZoom, setCurrentMapZoom] = useState(defaultMapZoom);
  const [followGps, setFollowGps] = useState(true); // Default follow GPS aktif

  // Data peta (pohon, tanah, zona) akan dimuat secara latar belakang, tidak memblokir tampilan awal
  const [treeData, setTreeData] = useState([]);
  const [soilData, setSoilData] = useState([]);
  const [zonesData, setZonesData] = useState([]);
  const [offlineMapView, setOfflineMapView] = useState(null);
  
  // State dummy untuk tugas
  const [daftarTugas, setDaftarTugas] = useState([]);
  const [tugasIndex, setTugasIndex] = useState(0);
  const tugasSaatIni = null; // Tidak ada tugas spesifik

  // State untuk Simulasi GPS
  const [isGpsSimulationActive, setIsGpsSimulationActive] = useState(false);
  const [simulatedLat, setSimulatedLat] = useState('');
  const [simulatedLon, setSimulatedLon] = useState('');

  // RADIUS_KEDATANGAN tidak lagi relevan
  // const RADIUS_KEDATANGAN = 20;

  // Handler untuk mengubah tampilan peta dan menyimpannya ke IndexedDB
  const handleMapChange = useCallback((center, zoom) => {
    // console.log("[Map] Peta digeser/zoom. New Center:", center, "New Zoom:", zoom);
    setCurrentMapCenter(center);
    setCurrentMapZoom(zoom);
    saveData(STORE_NAMES.mapView, 'view', { center, zoom })
      .then(() => { /* ... */ })
      .catch(err => console.error("[Map] Gagal menyimpan tampilan peta ke IndexedDB:", err));
    
    // Jika pengguna secara manual menggeser peta, matikan follow GPS
    setFollowGps(false);
    // console.log("[Map] setFollowGps(false) karena interaksi pengguna.");
  }, []); // Dependensi dikosongkan untuk mengatasi error "changed size" dan "maximum update depth"

  // useEffect untuk memuat tampilan peta dari IndexedDB (latar belakang)
  useEffect(() => {
    const loadSavedMapView = async () => {
      // console.log("[Analisis Init] Mencoba memuat tampilan peta tersimpan dari IndexedDB...");
      const savedView = await loadData(STORE_NAMES.mapView, 'view');
      if (savedView && savedView.center && savedView.zoom) {
        // console.log("[Analisis Init] Tampilan peta offline ditemukan:", savedView);
        setOfflineMapView(savedView);
        // Perbarui currentMapCenter/Zoom hanya jika posisi GPS belum ditemukan atau followGps tidak aktif
        if (!posisiPetani || !followGps) {
          setCurrentMapCenter(savedView.center);
          setCurrentMapZoom(savedView.zoom);
          // console.log("[Analisis Init] Peta diatur ke tampilan tersimpan.");
        }
      } else {
        // console.log("[Analisis Init] Tidak ada tampilan peta offline yang disimpan.");
      }
    };
    loadSavedMapView();
  }, [posisiPetani, followGps]); // Tambahkan posisiPetani dan followGps agar bereaksi jika kondisi berubah

  // useEffect untuk memuat data peta (pohon, tanah, zona) di latar belakang
  useEffect(() => {
    const fetchAndCacheMapData = async () => {
      // console.log("[Map Data Init] Memulai pemuatan data peta (latar belakang)...");
      setNotifikasi({ type: 'info', message: 'Memuat data pohon, tanah, dan zona...' });

      // Data Pohon
      try {
        let loadedTreeData = await loadData(STORE_NAMES.treeData, 'data');
        if (loadedTreeData) {
          setTreeData(loadedTreeData);
          // console.log("[Map Data Init] Data pohon dimuat dari IndexedDB.");
        } else {
          const response = await fetch(`/api/map-data/trees/all-health`);
          if (!response.ok) throw new Error(`Gagal memuat data pohon. Status: ${response.status}`);
          const data = await response.json();
          setTreeData(data);
          await saveData(STORE_NAMES.treeData, 'data', data);
          // console.log("[Map Data Init] Data pohon dimuat dari jaringan & disimpan ke IndexedDB.");
        }
      } catch (err) {
        console.error("[Map Data Init] Gagal memuat data pohon:", err);
        setNotifikasi(prev => ({ ...prev, type: 'error', title: 'Data Peta', message: `Gagal memuat data pohon: ${err.message}` }));
      }

      // Data Tanah
      try {
        let loadedSoilData = await loadData(STORE_NAMES.soilData, 'data');
        if (loadedSoilData) {
          setSoilData(loadedSoilData);
          // console.log("[Map Data Init] Data tanah dimuat dari IndexedDB.");
        } else {
          const response = await fetch(`/api/map-data/soil/all-data`);
          if (!response.ok) throw new Error(`Gagal memuat data tanah. Status: ${response.status}`);
          const data = await response.json();
          setSoilData(data);
          await saveData(STORE_NAMES.soilData, 'data', data);
          // console.log("[Map Data Init] Data tanah dimuat dari jaringan & disimpan ke IndexedDB.");
        }
      } catch (err) {
        console.error("[Map Data Init] Gagal memuat data tanah:", err);
        setNotifikasi(prev => ({ ...prev, type: 'error', title: 'Data Peta', message: `Gagal memuat data tanah: ${err.message}` }));
      }

      // Data Zona
      try {
        let loadedZonesData = await loadData(STORE_NAMES.zones, 'data');
        if (loadedZonesData) {
          setZonesData(loadedZonesData);
          // console.log("[Map Data Init] Data zona untuk peta dimuat dari IndexedDB.");
        } else {
          const response = await fetch(`/api/zones`);
          if (!response.ok) throw new Error(`Gagal memuat data zona untuk peta. Status: ${response.status}`);
          const data = await response.json();
          setZonesData(data);
          await saveData(STORE_NAMES.zones, 'data', data);
          // console.log("[Map Data Init] Data zona untuk peta dimuat dari jaringan & disimpan ke IndexedDB.");
        }
      } catch (err) {
        console.error("[Map Data Init] Gagal memuat data zona untuk peta:", err);
        setNotifikasi(prev => ({ ...prev, type: 'error', title: 'Data Peta', message: `Gagal memuat data zona untuk peta: ${err.message}` }));
      }
      
      setNotifikasi(prev => {
        if (prev.type === 'info' && prev.message === 'Memuat data pohon, tanah, dan zona...') {
          return { type: 'success', title: 'Data Peta Siap', message: 'Data pohon, tanah, dan zona telah dimuat.' };
        }
        return prev;
      });
      // console.log("[Map Data Init] Pemuatan data peta latar belakang selesai.");
    };

    fetchAndCacheMapData();
  }, []);


  // Hook untuk mengambil lokasi GPS petani secara periodik atau mensimulasikannya
  useEffect(() => {
    let watchId;

    if (!isGpsSimulationActive) { // MODE GPS ASLI
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy };
          setPosisiPetani(newPos);
          // console.log("[GPS Effect] Posisi GPS diperbarui:", newPos);
          if (followGps) {
              setCurrentMapCenter([newPos.lat, newPos.lon]);
              // console.log("[GPS Effect] Peta dipusatkan ke GPS (followGps aktif).");
          }
          setStatusAplikasi('siap');
          setNotifikasi({ type: 'info', title: 'GPS Ditemukan', message: 'Lokasi Anda terdeteksi. Peta siap digunakan.' });
        },
        (error) => {
          console.error("GPS Error:", error);
          setNotifikasi({ type: 'error', title: 'GPS Error', message: `Gagal mendapatkan lokasi GPS: ${error.message}. Mode simulasi tersedia.` });
          setStatusAplikasi('siap'); // Tetap izinkan aplikasi siap meskipun GPS error
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    } else { // MODE SIMULASI GPS
      const latToUse = simulatedLat !== '' ? parseFloat(simulatedLat) : defaultMapCenter[0];
      const lonToUse = simulatedLon !== '' ? parseFloat(simulatedLon) : defaultMapCenter[1];
      
      const newPos = { lat: latToUse, lon: lonToUse, accuracy: 5 };
      setPosisiPetani(newPos);
      
      // Saat simulasi aktif, selalu paksakan followGps untuk memusatkan peta
      // dan perbarui currentMapCenter
      setFollowGps(true);
      setCurrentMapCenter([newPos.lat, newPos.lon]);
      
      setStatusAplikasi('siap');
      setNotifikasi({ type: 'info', title: 'GPS Simulasi Aktif', message: 'Peta siap digunakan dengan lokasi simulasi.' });
    }
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        // console.log("[GPS Effect] GPS watch dibersihkan.");
      }
    };
  }, [isGpsSimulationActive, simulatedLat, simulatedLon, followGps]);


  // Handler untuk tombol aksi utama (Ambil Data - ad-hoc)
  const handleAksiUtama = async () => {
    if (posisiPetani) {
        setStatusAplikasi('mengambil_data');
        setNotifikasi({ type: 'success', title: 'Data Berhasil Dicatat!', message: `Data telah dicatat di ${posisiPetani.lat.toFixed(4)}, ${posisiPetani.lon.toFixed(4)}. Anda bisa mencatat lagi.` });
    } else {
        setNotifikasi({ type: 'error', title: 'Gagal Ambil Data', message: 'Tidak dapat mencatat data, posisi GPS tidak tersedia.' });
        console.warn("Gagal mencatat data: posisi GPS tidak tersedia.");
    }
  };

  // Handler untuk tombol "Selesai Mengambil Data"
  const handleSelesaiMengambilData = async () => {
    setStatusAplikasi('siap');
    setNotifikasi({ type: 'success', title: 'Sesi Selesai', message: 'Anda telah menyelesaikan sesi pencatatan data.' });
    await saveData(STORE_NAMES.tasks, 'currentTasks', []);
  };

  // Menentukan teks dan status tombol aksi "Ambil Data"
  const getTombolAmbilData = () => {
    const disabled = !posisiPetani || (statusAplikasi !== 'siap' && statusAplikasi !== 'mengambil_data');
    switch (statusAplikasi) {
      case 'memuat_gps_peta': return { text: 'Memuat Peta & GPS...', disabled: true };
      case 'siap': return { text: 'Ambil Data', disabled: disabled };
      case 'mengambil_data': return { text: 'Ambil Data Lagi', disabled: disabled };
      default: return { text: 'Ambil Data', disabled: disabled };
    }
  };

  const tombolAmbilData = getTombolAmbilData();

  // Ini adalah render awal yang paling cepat
  if (statusAplikasi === 'memuat_gps_peta') {
    return <div className="p-6 text-center text-xl text-gray-700">{notifikasi.message}</div>;
  }

  // Map center logic
  const mapCenterToUse = (followGps && posisiPetani) ? [posisiPetani.lat, posisiPetani.lon] : currentMapCenter;

  // Handler untuk tombol "Pusatkan ke GPS"
  const handleCenterMapToGps = () => {
      if (posisiPetani) {
          setCurrentMapCenter([posisiPetani.lat, posisiPetani.lon]);
          setCurrentMapZoom(17);
          setFollowGps(true);
          setNotifikasi({ type: 'info', title: 'Peta Dipusatkan', message: 'Peta telah dipusatkan ke lokasi Anda saat ini.' });
      } else {
          setNotifikasi({ type: 'warning', title: 'Lokasi Tidak Tersedia', message: 'Tidak dapat memusatkan peta. Lokasi GPS belum ditemukan.' });
          console.warn("Tidak dapat memusatkan: Posisi GPS petani belum tersedia.");
      }
  };


  return (
    <div className="p-4 sm:p-6 space-y-6">
      <NavigationPrompt
        message={`Status Aplikasi: ${statusAplikasi.replace('_', ' ')}`}
      />

      {/* Kontrol Simulasi GPS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <i className="fas fa-satellite-dish mr-2 text-blue-500"></i> Kontrol GPS (Simulasi)
        </h2>
        <div className="flex items-center justify-between mb-4">
          <label className="text-gray-700">Aktifkan Simulasi GPS:</label>
          <label htmlFor="toggle-gps-simulation" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="toggle-gps-simulation"
                className="sr-only"
                checked={isGpsSimulationActive}
                onChange={() => {
                    setIsGpsSimulationActive(!isGpsSimulationActive);
                    // Saat toggle simulasi, paksakan peta untuk memusat ke lokasi baru
                    setFollowGps(true); 
                }}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isGpsSimulationActive ? 'transform translate-x-6 bg-green-400' : ''}`}></div>
            </div>
          </label>
        </div>

        {isGpsSimulationActive && (
          <div className="space-y-4">
            <div>
              <label htmlFor="simulatedLat" className="block text-sm font-medium text-gray-700">Simulasi Lintang (Lat):</label>
              <input
                type="number"
                id="simulatedLat"
                value={simulatedLat}
                onChange={(e) => setSimulatedLat(e.target.value)}
                placeholder={posisiPetani ? posisiPetani.lat.toString() : defaultMapCenter[0].toString()}
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
                placeholder={posisiPetani ? posisiPetani.lon.toString() : defaultMapCenter[1].toString()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                step="0.000001"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Peta Analisis Lapangan */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Peta Analisis Lapangan</h2>
        <div className="relative h-[400px] border rounded-lg overflow-hidden bg-gray-200">
          {/* Peta akan selalu dirender karena currentMapCenter/Zoom punya default */}
          <Map
            isInteractive={true}
            center={mapCenterToUse}
            zoom={currentMapZoom}
            userPosition={posisiPetani}
            targetPosition={null}
            treeData={treeData}
            soilData={soilData}
            zones={zonesData}
            geoTiffUrl={null}
            onMapChange={handleMapChange}
          />

          {/* Tombol Pusatkan ke GPS - SELALU RENDER */}
          <button
            onClick={handleCenterMapToGps}
            className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-[1000] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            title="Pusatkan Peta ke Lokasi GPS Anda"
            disabled={!posisiPetani} // Hanya disabled jika GPS belum tersedia
          >
            <i className="fas fa-crosshairs text-lg"></i>
          </button>
        </div>
      </div>

      {/* Tombol Aksi Utama */}
      <div className="mb-6 space-y-4">
        <button
          onClick={handleAksiUtama}
          disabled={tombolAmbilData.disabled}
          className={`w-full text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-colors text-lg ${
            tombolAmbilData.disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {tombolAmbilData.text}
        </button>

        <button
          onClick={handleSelesaiMengambilData}
          disabled={statusAplikasi === 'memuat_gps_peta'}
          className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors text-md ${
              statusAplikasi === 'memuat_gps_peta'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Selesai Mengambil Data
        </button>
      </div>

      {/* Status Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-300">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Posisi Petani</h3>
            <p className="text-lg text-gray-700 mb-2">
              {posisiPetani ? `${posisiPetani.lat.toFixed(6)}, ${posisiPetani.lon.toFixed(6)}` : 'Mencari sinyal GPS...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Status: {statusAplikasi.replace('_', ' ')}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-green-300">
            <h3 className="text-xl font-semibold mb-4 text-green-600">Info Aplikasi</h3>
            <p className="text-lg text-gray-700 mb-2">Siap untuk analisis lapangan.</p>
            <p className="text-sm text-gray-500 mt-2">Mode: Interaktif</p>
          </div>
      </div>

      {/* Notifikasi */}
      <div className="mt-4">
        <NotificationCard
          key={notifikasi.message}
          type={notifikasi.type}
          title={notifikasi.title || "Informasi"}
          message={notifikasi.message}
        />
     </div>
    </div>
  );
};

export default Analisis;