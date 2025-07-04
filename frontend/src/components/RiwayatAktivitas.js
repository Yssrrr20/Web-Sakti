// pages/RiwayatAktivitas.js

import React, { useState, useEffect } from 'react';


// Helper function untuk format waktu relatif 
function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} detik yang lalu`;
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
}

// Helper function untuk ikon dan warna berdasarkan tipe kejadian
const getEventStyle = (eventType, level) => {
    switch (eventType) {
        case 'ZONE_ANALYSIS':
            return { icon: 'fa-solid fa-chart-area', color: 'text-purple-500' };
        case 'FILE_RECEIVED':
            return { icon: 'fa-solid fa-file-arrow-down', color: 'text-blue-500' };
        case 'DATA_SENT_TO_TRAINING':
            return { icon: 'fa-solid fa-file-arrow-up', color: 'text-orange-500' };
        default:
            switch (level) {
                case 'SUCCESS':
                    return { icon: 'fa-solid fa-check-circle', color: 'text-green-500' };
                case 'WARNING':
                    return { icon: 'fa-solid fa-triangle-exclamation', color: 'text-yellow-500' };
                default:
                    return { icon: 'fa-solid fa-circle-info', color: 'text-gray-500' };
            }
    }
};

export default function RiwayatAktivitas() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Panggil API baru kita
                const response = await fetch(`/api/activity/recent`);
                if (!response.ok) {
                    throw new Error('Gagal mengambil riwayat aktivitas');
                }
                const data = await response.json();
                setActivities(data);
            } catch (err) {
                setError(err.message);
                console.error("Gagal fetch riwayat aktivitas:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        // Set interval untuk me-refresh data secara otomatis setiap 1 menit
        const intervalId = setInterval(fetchActivities, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-gray-500 py-4">Memuat riwayat aktivitas...</p>;
        }

        if (error) {
            return <p className="text-center text-red-500 py-4">Gagal memuat data.</p>;
        }

        if (activities.length === 0) {
            return <p className="text-center text-gray-500 py-4">Tidak ada aktivitas tercatat.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kejadian</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activities.map((item) => {
                            const style = getEventStyle(item.event_type, item.level);
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-xl">
                                                <i className={`${style.icon} ${style.color}`}></i>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{item.event_type.replace(/_/g, ' ')}</div>
                                                <div className="text-sm text-gray-500">{item.message}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatTimeAgo(item.timestamp)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Riwayat Aktivitas Sistem</h3>
            {renderContent()}
        </div>
    );
};
