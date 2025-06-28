// pages/PerubahanParameter.js

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

// Helper function untuk format waktu relatif
function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);

    if (seconds < 60) {
        return `${seconds} detik yang lalu`;
    } else if (minutes < 60) {
        return `${minutes} menit yang lalu`;
    } else if (hours < 24) {
        return `${hours} jam yang lalu`;
    } else {
        return date.toLocaleDateString('id-ID');
    }
}

// Helper function untuk menentukan parameter mana yang paling menonjol
const getMostSignificantChange = (reading) => {
    // Anda bisa menambahkan logika lebih kompleks di sini,
    // untuk saat ini kita tampilkan saja semua.
    return `Suhu: ${reading.temperature.toFixed(1)}°C, pH: ${reading.ph.toFixed(2)}, Lembap: ${reading.humidity.toFixed(1)}%`;
};

export default function PerubahanParameter() {
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentReadings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/soil/recent`);
                if (!response.ok) {
                    throw new Error('Gagal mengambil data terkini');
                }
                const data = await response.json();
                setReadings(data);
            } catch (err) {
                setError(err.message);
                console.error("Gagal fetch data parameter terkini:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentReadings();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-500 py-4">Memuat...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-4">Gagal memuat data.</div>;
    }
    
    if (readings.length === 0) {
        return <div className="text-center text-gray-500 py-4">Tidak ada aktivitas terkini.</div>;
    }

    return (
        <div className="space-y-4">
            {readings.map((reading) => (
                <div key={reading.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <i className="fas fa-satellite-dish"></i>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-800">
                            {reading.serial_number || 'Sensor tidak dikenal'}
                        </p>
                        <p className="text-xs text-gray-600">
                            {getMostSignificantChange(reading)}
                        </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                            {formatTimeAgo(reading.timestamp)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
