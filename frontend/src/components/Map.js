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
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
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
  center = [-6.5511, 106.7166], // Replaced initialCenter with center
  zoom = 17,                     // Replaced initialZoom with zoom
  maxZoom = 22,
  isInteractive = true,
  onMapChange // Prop for parent to listen to map changes
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoRasterLayerRef = useRef(null);
  const treeMarkersLayerRef = useRef(null);
  const soilMarkersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const targetMarkerRef = useRef(null);

  // Inisialisasi peta Leaflet
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapOptions = {
        maxZoom: maxZoom,
        zoomControl: isInteractive, // Show zoom controls only if interactive
        dragging: isInteractive,
        scrollWheelZoom: isInteractive,
        doubleClickZoom: isInteractive,
        touchZoom: isInteractive,
        boxZoom: isInteractive,
        keyboard: isInteractive,
        tap: isInteractive,
      };

      // Use the 'center' and 'zoom' props for initial view
      mapInstanceRef.current = L.map(mapRef.current, mapOptions).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      if(isInteractive) { // Add zoom control explicitly if interactive
          L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
      }

      // Initialize layer groups
      zonesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      treeMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      soilMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      // User and target markers are managed directly, not in layer groups in this version for simplicity
    }

    // Cleanup function for map instance
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []); // Empty dependency array means this runs only once on mount

  // useEffect to dynamically update map view (center and zoom) if props change
  // This is key for the map to follow userPosition from Analisis.jsx
  useEffect(() => {
    if (mapInstanceRef.current && center && zoom) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]); // Reruns when center or zoom props change

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

      // Trigger once on mount to provide initial view
      handleMoveEnd();

      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }
  }, [onMapChange, isInteractive]); // Dependency: re-run if onMapChange or isInteractive prop changes


  // useEffect for GeoTIFF
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
                // Only fit bounds if map is interactive, otherwise it might override initial view
                if (isInteractive) {
                    mapInstanceRef.current.fitBounds(layer.getBounds());
                }
            });
        }).catch(error => console.error("Gagal memuat GeoTIFF:", error));
    }
  }, [geoTiffUrl, isInteractive]);

  // useEffect for TREE data
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

  // useEffect for SOIL data
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

  // useEffect for ZONE data
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


  // useEffect for USER POSITION (Farmer)
  useEffect(() => {
    if (mapInstanceRef.current && userPosition) {
      const userLatLng = [userPosition.lat, userPosition.lon];
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, {
          icon: L.divIcon({ className: 'user-location-marker', html: '<div class="pulsing-dot"></div>', iconSize: [20, 20] })
        }).addTo(mapInstanceRef.current);
        // Only set view if map is interactive or if it's the very first time user position is available
        // We defer to the main `center` prop for non-interactive maps now, driven by Analisis.jsx
        // if (isInteractive) {
        //   mapInstanceRef.current.setView(userLatLng, mapInstanceRef.current.getZoom()); // Keep current zoom
        // }
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
      }
    } else if (userMarkerRef.current) {
        // Remove marker if userPosition becomes null
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
    }
}, [userPosition]); // Only depends on userPosition


  // useEffect for TARGET POSITION (specifically for Analisis page)
  useEffect(() => {
      if(mapInstanceRef.current && targetPosition && !isNaN(targetPosition.lat)) {
          const targetLatLng = [targetPosition.lat, targetPosition.lon];
          if(!targetMarkerRef.current) {
              const targetIcon = L.icon({ iconUrl: '/assets/target-icon.png', iconSize: [40, 40], iconAnchor: [20, 40] });
              targetMarkerRef.current = L.marker(targetLatLng, { icon: targetIcon }).addTo(mapInstanceRef.current);
          } else {
              targetMarkerRef.current.setLatLng(targetLatLng);
          }
      } else if (targetMarkerRef.current) {
          // Remove marker if targetPosition becomes null
          mapInstanceRef.current.removeLayer(targetMarkerRef.current);
          targetMarkerRef.current = null;
      }
  }, [targetPosition]);

  return (
    <>
      <style>{`
        .user-location-marker .pulsing-dot { width: 20px; height: 20px; background-color: #007bff; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 rgba(0, 123, 255, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } }
        .leaflet-tooltip { background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.4); border-radius: 4px; }
        /* Ensure Leaflet attribution is readable on all backgrounds */
        .leaflet-control-attribution a { color: #007bff !important; }
      `}</style>
      <div ref={mapRef} className={`w-full h-full bg-gray-200 rounded-lg shadow-inner ${!isInteractive ? 'cursor-default' : ''}`}></div>
    </>
  );
};

export default Map;