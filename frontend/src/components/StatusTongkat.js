import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaRegCircle } from 'react-icons/fa';

const StatusTongkat = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Status Tongkat</h2>
      
      {/* Blok Tongkat 1 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 1</p>
          <p className="text-gray-600">Blok: A1</p>
          <p className="text-sm text-gray-500">Status: <span className="text-green-500">Aktif</span></p>
        </div>
        <FaCheckCircle className="w-6 h-6 text-green-500" />
      </div>

      {/* Blok Tongkat 2 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 2</p>
          <p className="text-gray-600">Blok: A2</p>
          <p className="text-sm text-gray-500">Status: <span className="text-red-500">Tidak Aktif</span></p>
        </div>
        <FaExclamationCircle className="w-6 h-6 text-red-500" />
      </div>

      {/* Blok Tongkat 3 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 3</p>
          <p className="text-gray-600">Blok: A3</p>
          <p className="text-sm text-gray-500">Status: <span className="text-yellow-500">Perlu Diperbaiki</span></p>
        </div>
        <FaRegCircle className="w-6 h-6 text-yellow-500" />
      </div>

      {/* Blok Tongkat 4 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 4</p>
          <p className="text-gray-600">Blok: A4</p>
          <p className="text-sm text-gray-500">Status: <span className="text-green-500">Aktif</span></p>
        </div>
        <FaCheckCircle className="w-6 h-6 text-green-500" />
      </div>

      {/* Blok Tongkat 5 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 5</p>
          <p className="text-gray-600">Blok: B1</p>
          <p className="text-sm text-gray-500">Status: <span className="text-green-500">Aktif</span></p>
        </div>
        <FaCheckCircle className="w-6 h-6 text-green-500" />
      </div>

      {/* Blok Tongkat 4 */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">Tongkat 4</p>
          <p className="text-gray-600">Blok: B2</p>
          <p className="text-sm text-gray-500">Status: <span className="text-green-500">Aktif</span></p>
        </div>
        <FaCheckCircle className="w-6 h-6 text-green-500" />
      </div>
    </div>
  );
};

export default StatusTongkat;
