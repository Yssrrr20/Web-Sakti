import React from 'react';

// StatusDrone menerima props untuk data drone
const StatusDrone = ({ name, model, status, lastFlight, area, battery }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-lg shadow-lg mb-4">
      {/* Informasi Drone */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full text-white flex items-center justify-center mr-4">
          <i className="fas fa-drone-alt text-2xl"></i> {/* Ikon Drone */}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-800">{name}</p>
          <p className="text-sm text-gray-500">{model}</p>
        </div>
        {/* Status */}
        <p className={`text-${status === 'Siap Terbang' ? 'green' : status === 'Tidak Aktif' ? 'red' : 'yellow'}-500 font-semibold`}>
          {status}
        </p>
      </div>

      {/* Info Section */}
      <div className="text-sm font-semibold text-gray-600">
        <div className="flex justify-between mb-2">
          <p>Pemindahan Terakhir:</p>
          <p>{lastFlight}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p>Area Tercakup:</p>
          <p>{area}</p>
        </div>
        <div className="flex justify-between">
          <p>Baterai:</p>
          <p>{battery}%</p>
        </div>
      </div>
    </div>
  );
};

export default StatusDrone;
