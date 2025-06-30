// File: components/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';


const DashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Gunakan API_BASE_URL
                const response = await fetch(`/api/summary/stats`); // Ubah di sini
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data: ${response.statusText}`);
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Memuat statistik...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error: Gagal memuat data statistik.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
                title="Total Pohon"
                count={stats.totalPohon}
                icon="fa-tree"
                color="bg-blue-500"
            />
            <Card
                title="Pohon Sehat"
                count={stats.pohonSehat}
                icon="fa-heart-pulse"
                color="bg-green-500"
            />
            <Card
                title="Pohon Sakit"
                count={stats.pohonSakit}
                icon="fa-virus"
                color="bg-red-500"
            />
            <Card
                title="Perangkat Aktif"
                count={stats.perangkatAktif}
                icon="fa-broadcast-tower"
                color="bg-purple-500"
            />
        </div>
    );
};

export default DashboardStats;