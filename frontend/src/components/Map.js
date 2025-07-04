// src/components/Map.js

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

// Fix default icon issue with Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- FUNGSI-FUNGSI STYLE ANDA ---
const getZoneStyle = (label) => {
    switch (label) {
        case 'Zona Prioritas Merah': return { color: '#ef4444', weight: 2, fillOpacity: 0.3, fillColor: '#ef4444' };
        case 'Zona Tanah Asam': return { color: '#eab308', weight: 2, fillOpacity: 0.3, fillColor: '#eab308' };
        case 'Zona Sehat': return { color: '#3b82f6', weight: 1, fillOpacity: 0.2, fillColor: '#3b82f6' };
        default: return { color: '#64748b', weight: 1, fillOpacity: 0.3, fillColor: '#94a3b8' };
    }
};
const getTreeMarkerOptions = (status) => {
    switch (String(status).toLowerCase()) {
        case '1': case 'healthy': return { color: "#16a34a", fillColor: "#22c55e", statusText: "Sehat" };
        case '0': case 'infected': return { color: "#dc2626", fillColor: "#ef4444", statusText: "Terinfeksi" };
        case '2': case 'potential': return { color: "#f97316", fillColor: "#fb923c", statusText: "Potensial" };
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


const Map = ({
  geoTiffUrl,
  treeData,
  soilData,
  zones,
  userPosition,
  targetPosition,
  initialCenter = [-6.5511, 106.7166],
  initialZoom = 17,
  maxZoom = 22,
  isInteractive = true,
  onMapChange, 
  setMapCenterAndZoom 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoRasterLayerRef = useRef(null);
  const treeMarkersLayerRef = useRef(null);
  const soilMarkersLayerRef = useRef(null);
  const userGpsLayerRef = useRef(null); 
  const zonesLayerRef = useRef(null);
  const targetMarkerRef = useRef(null);

  // Inisialisasi peta Leaflet (berjalan sekali saat mount)
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapOptions = {
        maxZoom: maxZoom,
        zoomControl: isInteractive,
        dragging: isInteractive,
        scrollWheelZoom: isInteractive,
        doubleClickZoom: isInteractive,
        touchZoom: isInteractive,
        boxZoom: isInteractive,
        keyboard: isInteractive,
        tap: isInteractive,
      };

      mapInstanceRef.current = L.map(mapRef.current, mapOptions).setView(initialCenter, initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      if(isInteractive) { 
          L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
      }

      // Initialize layer groups (add to map only once)
      zonesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      treeMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      soilMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      userGpsLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current); 

      // Set fungsi ke ref agar bisa dipanggil dari parent (Peta.js)
      if (setMapCenterAndZoom) {
          setMapCenterAndZoom((lat, lon, zoomLevel) => {
              if (mapInstanceRef.current && !mapInstanceRef.current._animating) { 
                  mapInstanceRef.current.setView([lat, lon], zoomLevel);
              }
          });
      }
    }

    // Cleanup: Pastikan peta di-remove saat komponen di-unmount
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [initialCenter, initialZoom, maxZoom, isInteractive, setMapCenterAndZoom]);


  // useEffect for onMapChange callback (if map is interactive)
  useEffect(() => {
    if (mapInstanceRef.current && onMapChange && isInteractive) {
      const map = mapInstanceRef.current;

      const handleMoveEnd = () => {
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        onMapChange([currentCenter.lat, currentCenter.lng], currentZoom);
      };

      map.on('moveend', handleMoveEnd);

      return () => {
        map.off('moveend', handleMoveEnd); 
      };
    }
  }, [onMapChange, isInteractive]);


  // useEffect for GeoTIFF
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (geoRasterLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoRasterLayerRef.current);
        geoRasterLayerRef.current = null;
    }

    if (geoTiffUrl) {
        fetch(geoTiffUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const layer = new GeoRasterLayer({ georaster, resolution: 256, opacity: 0.8 });
                layer.addTo(mapInstanceRef.current);
                geoRasterLayerRef.current = layer;
            });
        }).catch(error => console.error("Gagal memuat GeoTIFF:", error));
    }
  }, [geoTiffUrl]); 

  // useEffect for TREE data
  useEffect(() => {
    if (!mapInstanceRef.current || !treeMarkersLayerRef.current) return;
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
  }, [treeData]);

  // useEffect for SOIL data
  useEffect(() => {
    if (!mapInstanceRef.current || !soilMarkersLayerRef.current) return;
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
  }, [soilData]);

  // useEffect for ZONE data
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesLayerRef.current) return;
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
  }, [zones]);


  // useEffect for USER POSITION (Farmer)
  useEffect(() => {
    if (!mapInstanceRef.current || !userGpsLayerRef.current) return; 

    userGpsLayerRef.current.clearLayers(); 
    
    if (userPosition && typeof userPosition.lat === 'number' && typeof userPosition.lon === 'number' && !isNaN(userPosition.lat) && !isNaN(userPosition.lon)) {
      const userLatLng = [userPosition.lat, userPosition.lon];
      L.circleMarker(userLatLng, {
        radius: 10, // Ukuran dot
        color: "#007bff", // Warna border
        fillColor: "#007bff", // Warna isi
        fillOpacity: 0.7,
        weight: 2,
        className: 'user-location-marker-circle' // Kelas untuk gaya tambahan
      })
      .bindTooltip(`<b>Posisi Anda:</b><br>Lat: ${userPosition.lat.toFixed(6)}<br>Lon: ${userPosition.lon.toFixed(6)}<br>Akurasi: ${userPosition.accuracy ? userPosition.accuracy.toFixed(1) + 'm' : 'N/A'}`)
      .addTo(userGpsLayerRef.current);

      L.marker(userLatLng, {
        icon: L.divIcon({ className: 'user-location-marker', html: '<div class="pulsing-dot"></div>', iconSize: [20, 20] })
      }).addTo(userGpsLayerRef.current);

    } else if (userGpsLayerRef.current) {
        userGpsLayerRef.current.clearLayers();
    }
  }, [userPosition]); // Dependensi userPosition


  // useEffect for TARGET POSITION
  useEffect(() => {
      if (!mapInstanceRef.current || !targetMarkerRef.current) return; 
      targetMarkerRef.current.clearLayers(); 

      if(targetPosition && typeof targetPosition.lat === 'number' && typeof targetPosition.lon === 'number' && !isNaN(targetPosition.lat) && !isNaN(targetPosition.lon)) {
          const targetLatLng = [targetPosition.lat, targetPosition.lon];
          const targetIcon = L.icon({ iconUrl: '/assets/target-icon.png', iconSize: [40, 40], iconAnchor: [20, 40] });
          L.marker(targetLatLng, { icon: targetIcon }).addTo(targetMarkerRef.current);
      } else if (targetMarkerRef.current) {
          targetMarkerRef.current.clearLayers();
      }
  }, [targetPosition]);


  return (
    <>
      <style>{`
        /* Gaya untuk lingkaran GPS pengguna */
        .user-location-marker-circle {
          box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.3); /* Efek halo */
          animation: gpsPulse 2s infinite;
        }
        @keyframes gpsPulse {
          0% { box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.3); }
          70% { box-shadow: 0 0 0 15px rgba(0, 123, 255, 0); }
          100% { box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.3); }
        }

        /* Gaya untuk dot pulsing internal (jika digunakan bersama lingkaran) */
        .user-location-marker .pulsing-dot { 
          width: 20px; height: 20px; background-color: #007bff; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 rgba(0, 123, 255, 0.4); 
          animation: dotPulse 2s infinite; /* Ubah nama animasi agar tidak konflik */
        }
        @keyframes dotPulse { 
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); } 
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } 
        }

        .leaflet-tooltip { background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.4); border-radius: 4px; }
        /* Ensure Leaflet attribution is readable on all backgrounds */
        .leaflet-control-attribution a { color: #007bff !important; }
      `}</style>
      <div ref={mapRef} className={`w-full h-full bg-gray-200 rounded-lg shadow-inner ${!isInteractive ? 'cursor-default' : ''}`}></div>
    </>
  );
};

export default Map;