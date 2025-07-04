// pages/KondisiTanah.js

import React, { useState, useEffect } from 'react';


// Helper function untuk warna dan teks status 
const getZoneStyle = (label) => {
    switch (label) {
        case 'Zona Prioritas Merah':
            return { color: '#ef4444', text: 'Perlu Perhatian' };
        case 'Zona Tanah Asam':
            return { color: '#eab308', text: 'Tanah Asam' };
        case 'Zona Sehat':
            return { color: '#22c55e', text: 'Optimal' };
        default: // Zona Normal
            return { color: '#64748b', text: 'Normal' };
    }
};

export default function KondisiTanah() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchZoneData = async () => {
            try {
                const response = await fetch(`/api/zones`);
                if (!response.ok) {
                    throw new Error('Gagal mengambil data zona');
                }
                const data = await response.json();

                data.sort((a, b) => {
                    // Ekstrak angka dari string "Zona X"
                    const numA = parseInt(a.zone_name.split(' ')[1] || 0);
                    const numB = parseInt(b.zone_name.split(' ')[1] || 0);
                    return numA - numB;
                });

                setZones(data);
            } catch (err) {
                setError(err.message);
                console.error("Gagal fetch data zona untuk list:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchZoneData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p className="text-gray-500">Memuat data kondisi zona...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full"><p className="text-red-500">Gagal memuat data.</p></div>;
    }

    if (zones.length === 0) {
        return <div className="flex justify-center items-center h-full"><p className="text-gray-500">Belum ada zona yang dianalisis.</p></div>;
    }

    return (

        <div className="space-y-3 overflow-y-auto h-full pr-2 flex-grow">
            {zones.map(zone => {
                const style = getZoneStyle(zone.label);
                return (
                    <div key={zone.id} className="bg-slate-100 p-4 rounded-lg flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
                        <div>
                            <p className="text-lg font-semibold text-gray-800">{zone.zone_name}</p>
                            <p className="text-gray-600">
                                Status: <span style={{ color: style.color }} className="font-bold">{style.text}</span>
                            </p>
                            <p className="text-sm text-gray-500">Total Pohon: {zone.tree_count_total}</p>
                        </div>
                        {/* Indikator titik warna */}
                        <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: style.color }}></div>
                    </div>
                );
            })}
        </div>
    );
}
