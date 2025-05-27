const KondisiTanah = () => {
    return (
      <div>
        {/* Blok A */}
        <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-800">Blok A</p>
            <p className="text-gray-600">Status: <span className="text-green-500">Optimal</span></p>
            <p className="text-sm text-gray-500">Pembaruan terakhir: 10 menit yang lalu</p>
          </div>
          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
        </div>
  
        {/* Blok B */}
        <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-800">Blok B</p>
            <p className="text-gray-600">Status: <span className="text-red-500">Perlu Perhatian</span></p>
            <p className="text-sm text-gray-500">Pembaruan terakhir: 5 menit yang lalu</p>
          </div>
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
        </div>
  
        {/* Blok C */}
        <div className="bg-slate-100 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-800">Blok C</p>
            <p className="text-gray-600">Status: <span className="text-yellow-500">Normal</span></p>
            <p className="text-sm text-gray-500">Pembaruan terakhir: 15 menit yang lalu</p>
          </div>
          <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
        </div>
      </div>
    );
  };
  
  export default KondisiTanah;
  