import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const Map = ({ useGps }) => {
  const mapRef = useRef(null);  // Referensi untuk peta
  const mapInstanceRef = useRef(null);  // Menyimpan instans peta agar tidak dibuat ulang

  useEffect(() => {
    // Cek apakah peta sudah ada
    if (mapRef.current && !mapInstanceRef.current) {
      // Inisialisasi peta hanya jika belum ada instans peta
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [5.548, 95.333], // Koordinat default
        zoom: 13,
      });

      // Menambahkan tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Jika useGps true, kita aktifkan geolocation
      if (useGps) {
        const getLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Update peta ke lokasi pengguna
                mapInstanceRef.current.setView([lat, lon], 13);

                // Tambahkan marker untuk lokasi pengguna
                L.marker([lat, lon]).addTo(mapInstanceRef.current)
                  .bindPopup('<b>Lokasi Anda</b><br>Ini adalah lokasi Anda sekarang.')
                  .openPopup();
              },
              (error) => {
                console.error("Error getting geolocation", error);
              },
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              }
            );
          } else {
            alert("Geolocation tidak tersedia di browser Anda.");
          }
        };

        // Dapatkan lokasi saat pertama kali load
        getLocation();
      }
    }

    // Cleanup map saat komponen unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;  // Reset instans peta
      }
    };
  }, [useGps]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-200 rounded-lg"></div>
  );
};

export default Map;
