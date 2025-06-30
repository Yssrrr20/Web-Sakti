// src/components/MapOffline.js

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

// Fix default icon issue with Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- FUNGSI-FUNGSI STYLE ANDA (TIDAK ADA PERUBAHAN) ---
const getZoneStyle = (label) => {
    switch (label) {
        case 'Zona Prioritas Merah': return { color: '#ef4444', weight: 2, fillOpacity: 0.3, fillColor: '#ef4444' };
        case 'Zona Tanah Asam': return { color: '#eab308', weight: 2, fillOpacity: 0.3, fillColor: '#eab308' };
        case 'Zona Sehat': return { color: '#3b82f6', weight: 1, fillOpacity: 0.2, fillColor: '#3b82f6' };
        default: return { color: '#64748b', weight: 1, fillOpacity: 0.3, fillColor: '#94a3b8' };
    }
};
const getTreeMarkerOptions = (status) => {
    switch (String(status)) {
        case '1': return { color: "#16a34a", fillColor: "#22c55e", statusText: "Sehat" };
        case '0': return { color: "#dc2626", fillColor: "#ef4444", statusText: "Terinfeksi" };
        case '2': return { color: "#f97316", fillColor: "#fb923c", statusText: "Potensial" };
        default: return { color: "#6b7280", fillColor: "#9ca3af", statusText: "Tidak Diketahui" };
    }
};
const getSoilMarkerOptions = (statusPrediksi) => {
    const status = String(statusPrediksi).toLowerCase();
    switch (status) {
        case 'sehat': return { color: "#6d28d9", fillColor: "#8b5cf6" };
        case 'tidak sehat': return { color: "#78350f", fillColor: "#a16207" };
        default: return { color: "#4b5563", fillColor: "#6b7280" };
    }
};
// --- AKHIR FUNGSI STYLE ---


const MapOffline = ({ // Nama komponen diubah menjadi MapOffline
  geoTiffUrl,
  treeData,
  soilData,
  zones,
  userPosition,
  targetPosition,
  initialCenter = [-6.5511, 106.7166],
  initialZoom = 17,
  maxZoom = 22,
  onMapChange // Tetap ada jika Anda masih ingin mengirim posisi kembali ke Analisis.jsx untuk penyimpanan (meskipun peta statis)
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoRasterLayerRef = useRef(null);
  const treeMarkersLayerRef = useRef(null);
  const soilMarkersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const targetMarkerRef = useRef(null);

  // Set isInteractive menjadi false secara permanen untuk MapOffline
  const isInteractive = false; // Peta tidak interaktif untuk offline

  // Inisialisasi peta
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
        
      const mapOptions = isInteractive ? {
        maxZoom: maxZoom
      } : {
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, boxZoom: false,
        keyboard: false, tap: false
      };

      mapInstanceRef.current = L.map(mapRef.current, mapOptions).setView(initialCenter, initialZoom);
      
      // --- PERUBAHAN UTAMA: Menggunakan PATH LOKAL untuk ubin peta ---
      L.tileLayer('/offline_map_tiles/{z}/{x}/{y}.png', { // <-- GANTI DENGAN PATH ASLI FOLDER UBIN ANDA DI PUBLIC
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      zonesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      treeMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      soilMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
  }, [initialCenter, initialZoom, maxZoom, isInteractive]);

  // useEffect untuk memantau perubahan tampilan peta dan memanggil onMapChange
  // Anda mungkin ingin menghapus atau mengubah ini jika peta tidak interaktif
  useEffect(() => {
    if (mapInstanceRef.current && onMapChange && isInteractive) { // Hanya aktif jika peta interaktif
      const map = mapInstanceRef.current;
      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapChange([center.lat, center.lng], zoom);
      };
      map.on('moveend', handleMoveEnd);
      handleMoveEnd();
      return () => { map.off('moveend', handleMoveEnd); };
    }
  }, [onMapChange, isInteractive]);


  // ... (semua useEffect lainnya tetap sama persis) ...
  // useEffect untuk GeoTIFF
  useEffect(() => {
    if (mapInstanceRef.current && geoRasterLayerRef.current) {
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

  useEffect(() => {
    if (soilMarkersLayerRef.current) {
      soilMarkersLayerRef.current.clearLayers();
      if (soilData && soilData.length > 0) {
        soilData.forEach(soilPoint => {
          const markerStyle = getSoilMarkerOptions(soilPoint.status_prediksi);
          const lat = parseFloat(soilPoint.gps_lat);
          const lon = parseFloat(soilPoint.gps_long);
          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== -1) {
            L.circle([lat, lon], { radius: 5, ...markerStyle, weight: 1, fillOpacity: 0.8 })
             .bindTooltip(`<b>Data Tanah</b><br>Sensor: ${soilPoint.sensor_id}<br>Status: ${soilPoint.status_prediksi || 'Tidak Diketahui'}<br>pH: ${soilPoint.pH || 'N/A'}`)
             .addTo(soilMarkersLayerRef.current);
          }
        });
      }
    }
  }, [soilData]);

  useEffect(() => {
    if (zonesLayerRef.current) {
        zonesLayerRef.current.clearLayers();
        if (zones && zones.length > 0) {
            zones.forEach(zone => {
                const bounds = [[zone.bounds_sw_lat, zone.bounds_sw_lng], [zone.bounds_ne_lat, zone.bounds_ne_lng]];
                const tooltipContent = `<b>${zone.zone_name || 'Zona'}</b><br>Label: ${zone.label}<br>Total Pohon: ${zone.tree_count_total}`;
                L.rectangle(bounds, getZoneStyle(zone.label))
                 .bindTooltip(tooltipContent)
                 .addTo(zonesLayerRef.current);
            });
        }
    }
  }, [zones]);

  useEffect(() => {
    if (mapInstanceRef.current && userPosition) {
      const userLatLng = [userPosition.lat, userPosition.lon];
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, {
          icon: L.divIcon({ className: 'user-location-marker', html: '<div class="pulsing-dot"></div>', iconSize: [20, 20] })
        }).addTo(mapInstanceRef.current);
        
        if (isInteractive) { // Ini tetap menjaga logika jika isInteractive pernah diatur true
          mapInstanceRef.current.setView(userLatLng, 18);
        }
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
      }
    }
}, [userPosition, isInteractive]);

  useEffect(() => {
      if(mapInstanceRef.current && targetPosition && !isNaN(targetPosition.lat)) {
          const targetLatLng = [targetPosition.lat, targetPosition.lon];
          if(!targetMarkerRef.current) {
              const targetIcon = L.icon({ iconUrl: '/assets/target-icon.png', iconSize: [40, 40], iconAnchor: [20, 40] });
              targetMarkerRef.current = L.marker(targetLatLng, { icon: targetIcon }).addTo(mapInstanceRef.current);
          } else {
              targetMarkerRef.current.setLatLng(targetLatLng);
          }
      }
  }, [targetPosition]);


  return (
    <>
      <style>{`
        .user-location-marker .pulsing-dot { width: 20px; height: 20px; background-color: #007bff; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 rgba(0, 123, 255, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } }
        .leaflet-tooltip { background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.4); border-radius: 4px; }
      `}</style>
      <div ref={mapRef} className={`w-full h-full bg-gray-200 rounded-lg shadow-inner ${!isInteractive ? 'cursor-default' : ''}`}></div>
    </>
  );
};

export default MapOffline; // Nama ekspor juga diubah