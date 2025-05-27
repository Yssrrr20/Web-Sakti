import React from 'react';
import Card from '../components/Card';
import StatusKesehatan from './StatusKesehatan';
import KondisiTanah from './KondisiTanah';
import PerubahanParameter from './PerubahanParameter';
import RiwayatAktivitas from './RiwayatAktivitas';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white-100 p-6">
      {/* Card 4 status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card 
          title="Total Pohon" 
          count={1234} 
          icon="fa-tree" 
          color="bg-blue-500" 
        />
        <Card 
          title="Pohon Sehat" 
          count={950} 
          icon="fa-leaf" 
          color="bg-green-500" 
        />
        <Card 
          title="Pohon Terinfeksi" 
          count={150} 
          icon="fa-virus" 
          color="bg-red-500" 
        />
        <Card 
          title="Perangkat Aktif" 
          count={23} 
          icon="fa-wifi" 
          color="bg-purple-500" 
        />
      </div>

      {/* Parameter Lingkungan dan Status Kesehatan Pohon */}
      <div className="flex flex-col lg:flex-row mt-8 gap-6">
        {/* Kolom kiri untuk Parameter Lingkungan */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Parameter Lingkungan</h3>
            
            {/* Parameter Suhu */}
            <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-thermometer-half text-xl"></i>
               </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Suhu</p>
                <p className="text-2xl font-bold text-blue-500">28 °C</p>
              </div>
            </div>

            {/* Parameter pH Tanah */}
            <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-flask text-xl"></i>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">pH Tanah</p>
                <p className="text-2xl font-bold text-blue-500">6.5</p>
              </div>
            </div>

            {/* Parameter Kelembaban */}
            <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-tint text-xl"></i>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Kelembaban</p>
                <p className="text-2xl font-bold text-blue-500">75%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan untuk Status Kesehatan Pohon */}
        <div className="w-full lg:w-1/2">
          <div className="w-full flex justify-center items-center">
            <StatusKesehatan /> 
          </div>
        </div>
      </div>

      {/* Menambahkan Kondisi Tanah dan Perubahan Parameter */}
      <div className="flex flex-col lg:flex-row mt-8 gap-6">
        {/* Kolom kiri untuk Kondisi Tanah */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-lg h-[450px]">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Kondisi Tanah</h3>
            <KondisiTanah />
          </div>
        </div>

        {/* Kolom kanan untuk Perubahan Parameter Terkini */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-lg h-[450px] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Perubahan Parameter Terkini</h3>
            <PerubahanParameter /> 
          </div>
        </div>
      </div>

      {/* Menambahkan Riwayat Aktivitas */}
      <RiwayatAktivitas /> 
    </div>
  );
};

export default Dashboard;
