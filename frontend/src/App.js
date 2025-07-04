// src/App.js

import React, { useState, useEffect } from 'react'; // PERUBAHAN 1: Impor useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard.jsx';
import PetaPage from './pages/Peta.js';
import Perangkat from './pages/Perangkat.js';

function App() {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  // hook useEffect untuk pre-caching data API
  useEffect(() => {
    // Fungsi ini akan dijalankan satu kali setelah komponen App pertama kali dimuat
    const preCacheApiData = () => {
      console.log('Memulai pre-caching data API penting untuk mode offline...');
      
      const essentialApis = [
        '/api/summary/stats',
        '/api/zones',
        '/api/status_perangkat',
        '/api/sensors/summary',
        '/api/receiver/hasil-peta',
        '/api/receiver/hasil-csv',
        '/api/activity/recent',
        '/api/map-data/trees/all-health', 
        '/api/map-data/soil/all-data',    
        '/api/soil/recent',               
        '/api/receiver/csv-content'       
      ];

      essentialApis.forEach(apiPath => {
        fetch(apiPath)
          .then(response => {
            if (response.ok) {
              console.log(`[Pre-cache] Sukses mengambil dan caching: ${apiPath}`);
            } else {
              console.warn(`[Pre-cache] Gagal mengambil: ${apiPath}`);
            }
          })
          .catch(err => {
            console.log(`[Pre-cache] Gagal fetch (kemungkinan offline): ${apiPath}`);
          });
      });
    };

    const timer = setTimeout(() => {
      preCacheApiData();
    }, 3000); // Jeda 3 detik

    return () => clearTimeout(timer); 
  }, []); // Array kosong `[]` memastikan efek ini hanya berjalan sekali saat aplikasi pertama kali dimuat.


  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header setIsMenuOpen={setIsHeaderMenuOpen} />
        
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/peta" element={<PetaPage />} />
            <Route path="/perangkat" element={<Perangkat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;