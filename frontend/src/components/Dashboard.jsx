// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardStats from '../components/DashboardStats';
import StatusKesehatan from './StatusKesehatan';
import KondisiTanah from './KondisiTanah';
import PerubahanParameter from './PerubahanParameter';
import RiwayatAktivitas from './RiwayatAktivitas';
import ParameterLingkungan from '../components/ParameterLingkungan';



const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                // Gunakan API_BASE_URL
                const response = await fetch(`/api/summary/stats`); 
                if (!response.ok) {
                    throw new Error('Gagal memuat data dashboard');
                }
                const data = await response.json();
                setSummaryData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaryData();
    }, []);

    if (loading) {
        return <div className="text-center p-10 text-gray-500">Memuat data dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <DashboardStats data={summaryData} />

            <div className="flex flex-col lg:flex-row mt-8 gap-6">
                <div className="w-full lg:w-1/2">
                    <ParameterLingkungan
                        temperature={summaryData?.avgTemperature}
                        ph={summaryData?.avgPh}
                        humidity={summaryData?.avgHumidity}
                    />
                </div>
                <div className="w-full lg:w-1/2">
                    <div className="w-full flex justify-center items-center">
                        <StatusKesehatan data={summaryData} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row mt-8 gap-6">
                <div className="w-full lg:w-1/2">
                    <div className="bg-white p-6 rounded-lg shadow-lg h-[450px] flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex-shrink-0">Ringkasan Kondisi Zona</h3>
                        <div className="overflow-y-auto flex-grow">
                            <KondisiTanah />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2">
                    <div className="bg-white p-6 rounded-lg shadow-lg h-[450px] flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex-shrink-0">Perubahan Parameter Terkini</h3>
                        <div className="overflow-y-auto flex-grow">
                            <PerubahanParameter />
                        </div>
                    </div>
                </div>
            </div>

            <RiwayatAktivitas />
        </div>
    );
};

export default Dashboard;