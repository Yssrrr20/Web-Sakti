// src/components/Map.js

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

// --- FUNGSI PEMBANTU UNTUK GAYA VISUALISASI ---

// Fungsi untuk menentukan warna ZONA
const getZoneStyle = (label) => {
    switch (label) {
        case 'Zona Prioritas Merah':
            // Merah: Tetap, sudah bagus untuk prioritas tinggi
            return { color: '#ef4444', weight: 2, fillOpacity: 0.3, fillColor: '#ef4444' };
        case 'Zona Tanah Asam':
            // Kuning/Oranye: Tetap, bagus untuk peringatan
            return { color: '#eab308', weight: 2, fillOpacity: 0.3, fillColor: '#eab308' };
        case 'Zona Sehat':
            // Biru: Kontras tinggi di atas latar hijau/coklat
            return { color: '#3b82f6', weight: 1, fillOpacity: 0.2, fillColor: '#3b82f6' };
        default: // Zona Normal
            // Ungu: Menonjol tanpa memberi sinyal bahaya, bagus untuk info netral
             return { color: '#64748b', weight: 1, fillOpacity: 0.3, fillColor: '#94a3b8' };
    }
}

// Fungsi untuk style marker POHON
const getTreeMarkerOptions = (status) => {
  switch (String(status)) {
    case '1': return { color: "#16a34a", fillColor: "#22c55e", statusText: "Sehat" };
    case '0': return { color: "#dc2626", fillColor: "#ef4444", statusText: "Terinfeksi" };
    case '2': return { color: "#f97316", fillColor: "#fb923c", statusText: "Potensial" };
    default: return { color: "#6b7280", fillColor: "#9ca3af", statusText: "Tidak Diketahui" };
  }
};

const getSoilMarkerOptions = (statusPrediksi) => {
  // Pastikan statusPrediksi adalah string dan ubah ke lowercase untuk perbandingan yang lebih aman
  const status = String(statusPrediksi).toLowerCase();
  switch (status) {
    case 'sehat': // Sesuai dengan nilai "Sehat" dari kolom status_prediksi di CSV
      return { color: "#6d28d9", fillColor: "#8b5cf6" }; // Ungu
    case 'tidak sehat': // Sesuai dengan nilai "Tidak Sehat" dari kolom status_prediksi di CSV
      return { color: "#78350f", fillColor: "#a16207" }; // Coklat
    default:
      // Default jika status_prediksi tidak dikenali atau null/empty
      return { color: "#4b5563", fillColor: "#6b7280" }; // Abu-abu default
  }
};


const Map = ({ 
  geoTiffUrl,
  treeData,
  soilData,
  zones, // Prop baru untuk data zona
  userPosition,
  initialCenter = [-7.2846, 112.7964], 
  initialZoom = 13,
  maxZoom = 22
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoRasterLayerRef = useRef(null);
  const treeMarkersLayerRef = useRef(null);
  const soilMarkersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const zonesLayerRef = useRef(null); // Ref baru untuk lapisan zona

  // Inisialisasi peta
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { maxZoom: maxZoom }).setView(initialCenter, initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: maxZoom
      }).addTo(mapInstanceRef.current);
      // Buat semua layer group saat inisialisasi
      zonesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      treeMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      soilMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
  }, [initialCenter, initialZoom, maxZoom]);

  // useEffect untuk GeoTIFF (tidak berubah)
  useEffect(() => {
    if (geoRasterLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoRasterLayerRef.current);
        geoRasterLayerRef.current = null;
    }
    if (geoTiffUrl && mapInstanceRef.current) {
        fetch(geoTiffUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
            const layer = new GeoRasterLayer({ georaster, resolution: 256, opacity: 0.8 });
            layer.addTo(mapInstanceRef.current);
            geoRasterLayerRef.current = layer;
            mapInstanceRef.current.fitBounds(layer.getBounds());
            });
        }).catch(error => console.error("Gagal memuat GeoTIFF:", error));
    }
  }, [geoTiffUrl]);

  // useEffect untuk data POHON (tidak berubah)
  useEffect(() => {
    if (treeMarkersLayerRef.current) {
      treeMarkersLayerRef.current.clearLayers();
      if (treeData && treeData.length > 0) {
        treeData.forEach(tree => {
          const statusKey = Object.keys(tree).find(key => key.toLowerCase().includes('status'));
          const status = statusKey ? tree[statusKey] : null;
          const markerStyle = getTreeMarkerOptions(status);
          const lat = parseFloat(tree.gps_lat);
          const lon = parseFloat(tree.gps_long);
          if (!isNaN(lat) && !isNaN(lon)) {
            L.circleMarker([lat, lon], { ...markerStyle, radius: 5, weight: 1, fillOpacity: 0.9 })
             .bindTooltip(`<b>Pohon ID:</b> ${tree.id_pohon}<br><b>Status:</b> ${markerStyle.statusText}`)
             .addTo(treeMarkersLayerRef.current);
          }
        });
      }
    }
  }, [treeData]);

  // useEffect untuk data TANAH (tidak berubah)
  useEffect(() => {
    if (soilMarkersLayerRef.current) {
      soilMarkersLayerRef.current.clearLayers();
      if (soilData && soilData.length > 0) {
        soilData.forEach(soilPoint => {
          // Ambil status_prediksi dari data yang diparsing dari CSV
          const markerStyle = getSoilMarkerOptions(soilPoint.status_prediksi);

          const lat = parseFloat(soilPoint.gps_lat);
          const lon = parseFloat(soilPoint.gps_long);

          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== -1) {
            L.circle([lat, lon], { radius: 5, ...markerStyle, weight: 1, fillOpacity: 0.8 })
             // Ubah tooltip untuk menampilkan status_prediksi
             .bindTooltip(`<b>Data Tanah</b><br>Sensor: ${soilPoint.sensor_id}<br>Status: ${soilPoint.status_prediksi || 'Tidak Diketahui'}<br>pH: ${soilPoint.pH || 'N/A'}`)
             .addTo(soilMarkersLayerRef.current);
          }
        });
      }
    }
  }, [soilData]);

  // --- PERUBAHAN DI SINI ---
  // useEffect untuk ZONA, tooltip diperbarui
  useEffect(() => {
    if (zonesLayerRef.current) {
        zonesLayerRef.current.clearLayers();
        if (zones && zones.length > 0) {
            zones.forEach(zone => {
                const bounds = [
                    [zone.bounds_sw_lat, zone.bounds_sw_lng],
                    [zone.bounds_ne_lat, zone.bounds_ne_lng]
                ];
                
                // Membuat konten tooltip yang lebih informatif dan aman
                const tooltipContent = `
                    <b>${zone.zone_name || 'Zona Tanpa Nama'}</b><br>
                    Label: ${zone.label}<br>
                    <hr class="my-1" style="border-top: 1px solid #ddd; margin: 4px 0;">
                    Total Pohon: ${zone.tree_count_total}<br>
                `;
                L.rectangle(bounds, getZoneStyle(zone.label))
                 .bindTooltip(tooltipContent) // Menggunakan konten yang sudah dibuat
                 .addTo(zonesLayerRef.current);
            });
        }
    }
  }, [zones]);

  // useEffect untuk posisi PETANI (tidak berubah)
  useEffect(() => {
    if (mapInstanceRef.current && userPosition) {
      const userLatLng = [userPosition.lat, userPosition.lon];
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, {
          icon: L.divIcon({ className: 'user-location-marker', html: '<div class="pulsing-dot"></div>', iconSize: [20, 20] })
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView(userLatLng, 18);
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
      }
    }
  }, [userPosition]);

  return (
    <>
      <style>{`
        .user-location-marker .pulsing-dot {
          width: 20px;
          height: 20px;
          background-color: #007bff;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 0 0 rgba(0, 123, 255, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } }
        
        .leaflet-tooltip {
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #ccc;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          border-radius: 4px;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full bg-gray-200 rounded-lg shadow-inner"></div>
    </>
  );
};

export default Map;