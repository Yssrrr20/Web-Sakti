export default function FilterBar() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 p-4 bg-gray-50 rounded-2xl shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 min-w-[200px] relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Cari Perangkat..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
        />
      </div>

      {/* Filter Blok */}
      <select className="flex-1 min-w-[150px] sm:w-40 px-3 py-2.5 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
        <option>Filter Blok</option>
        <option>Blok A</option>
        <option>Blok B</option>
        <option>Blok C</option>
      </select>

      {/* Status Perangkat */}
      <select className="flex-1 min-w-[150px] sm:w-40 px-3 py-2.5 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
        <option>Status Perangkat</option>
        <option>Aktif</option>
        <option>Nonaktif</option>
      </select>

      {/* Level Baterai */}
      <select className="flex-1 min-w-[150px] sm:w-40 px-3 py-2.5 border border-gray-300 bg-white rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
        <option>Level Baterai</option>
        <option>Tinggi</option>
        <option>Sedang</option>
        <option>Rendah</option>
      </select>
    </div>
  );
}
