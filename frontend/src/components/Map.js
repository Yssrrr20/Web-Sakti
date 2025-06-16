// src/components/Map.js

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

const Map = ({ 
  geoTiffUrl,
  treeData,
  initialCenter = [-7.2846, 112.7964], 
  initialZoom = 13,
  maxZoom = 22
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoRasterLayerRef = useRef(null);
  const treeMarkersLayerRef = useRef(null);

  // Inisialisasi peta
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { maxZoom: maxZoom }).setView(initialCenter, initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: maxZoom
      }).addTo(mapInstanceRef.current);
      treeMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
  }, [initialCenter, initialZoom, maxZoom]);

  // useEffect untuk GeoTIFF
  useEffect(() => {
    if (geoRasterLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoRasterLayerRef.current);
      geoRasterLayerRef.current = null;
    }
    if (geoTiffUrl && mapInstanceRef.current) {
      fetch(geoTiffUrl)
        .then(response => {
          if (!response.ok) throw new Error(`Network response was not ok`);
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          parseGeoraster(arrayBuffer).then(georaster => {
            const layer = new GeoRasterLayer({ georaster, resolution: 256, opacity: 0.8 });
            layer.addTo(mapInstanceRef.current);
            geoRasterLayerRef.current = layer;
            mapInstanceRef.current.fitBounds(layer.getBounds());
          });
        })
        .catch(error => {
          console.error("Gagal memuat atau mem-parsing GeoTIFF dari URL:", error);
          alert("Gagal memuat file peta dari server.");
        });
    }
  }, [geoTiffUrl]);

  // useEffect untuk data pohon
  useEffect(() => {
    if (treeMarkersLayerRef.current) {
      treeMarkersLayerRef.current.clearLayers();
      if (treeData && treeData.length > 0) {
        treeData.forEach(tree => {
          const lat = parseFloat(tree.gps_lat);
          const lon = parseFloat(tree.gps_long);
          if (!isNaN(lat) && !isNaN(lon)) {
            L.circleMarker([lat, lon], { radius: 5, color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.9, weight: 1 })
             .bindTooltip(`Pohon ID: ${tree.id_pohon}`)
             .addTo(treeMarkersLayerRef.current);
          }
        });
      }
    }
  }, [treeData]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-200 rounded-lg shadow-inner"></div>
  );
};

export default Map;