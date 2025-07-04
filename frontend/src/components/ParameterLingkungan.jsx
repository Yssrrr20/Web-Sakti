// src/components/ParameterLingkungan.jsx

import React from 'react';

const ParameterLingkungan = ({ temperature, ph, humidity }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Parameter Lingkungan (Rata-rata)</h3>
      
      {/* Parameter Suhu */}
      <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
        <div className="w-10 h-10 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-thermometer-half text-xl"></i>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Suhu</p>
          <p className="text-2xl font-bold text-blue-500">
            {temperature ? `${parseFloat(temperature).toFixed(1)} °C` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Parameter pH Tanah */}
      <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
        <div className="w-10 h-10 bg-green-200 text-green-600 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-flask text-xl"></i>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">pH Tanah</p>
          <p className="text-2xl font-bold text-green-500">
            {ph ? parseFloat(ph).toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Parameter Kelembaban */}
      <div className="bg-slate-100 flex items-center mb-4 rounded-lg p-4">
        <div className="w-10 h-10 bg-red-200 text-red-600 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-tint text-xl"></i>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Kelembaban</p>
          <p className="text-2xl font-bold text-red-500">
            {humidity ? `${parseFloat(humidity).toFixed(1)} %` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParameterLingkungan;
