// File: components/DashboardStats.jsx

import React, { useState, useEffect } from 'react';
import Card from './Card'; // Impor komponen Card Anda

const DashboardStats = () => {
    // State untuk menyimpan data statistik dari API
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fungsi untuk mengambil data dari backend
        const fetchStats = async () => {
            try {
                // Panggil endpoint yang baru kita buat
                const response = await fetch('http://localhost:5000/api/summary/stats');
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
    }, []); // Array dependensi kosong agar useEffect hanya berjalan sekali saat komponen dimuat

    // Tampilkan pesan loading saat data sedang diambil
    if (loading) {
        return <p className="text-center text-gray-500">Memuat statistik...</p>;
    }

    // Tampilkan pesan error jika terjadi kesalahan
    if (error) {
        return <p className="text-center text-red-500">Error: Gagal memuat data statistik.</p>;
    }

    // Tampilkan kartu jika data berhasil didapat
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
                title="Total Pohon" 
                count={stats.totalPohon} 
                icon="fa-tree" // Font Awesome icon
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
