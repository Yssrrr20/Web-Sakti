export default function DeviceCard({
  name,
  block,
  online,
  battery,
  ph,
  temperature,
  humidity,
  npk,
  lastUpdate,
}) {
  const batteryColor =
    battery > 50 ? "text-green-500" : battery > 20 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col min-h-[350px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
        <div className="space-y-0.5 mb-2 sm:mb-0">
          <h3 className="text-base sm:text-lg font-bold">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{block}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <i className={`fas fa-signal ${online ? "text-green-500" : "text-gray-400"} text-sm`}></i>
          <span className={`${online ? "text-green-600" : "text-gray-500"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Battery */}
      <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-xs sm:text-sm mb-3">
        <div className={`flex items-center gap-2 ${batteryColor}`}>
          <i className="fas fa-battery-half text-sm"></i>
          <span>Baterai</span>
        </div>
        <div className={`font-semibold ${batteryColor}`}>{battery}%</div>
      </div>

      {/* Sensor Data */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 text-xs sm:text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <i className="fas fa-flask text-sm"></i>
            <span>pH Tanah</span>
          </div>
          <div className="text-base sm:text-lg font-semibold">{ph}</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <i className="fas fa-temperature-half text-sm"></i>
            <span>Suhu</span>
          </div>
          <div className="text-base sm:text-lg font-semibold">{temperature}°C</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <i className="fas fa-droplet text-sm"></i>
            <span>Kelembaban</span>
          </div>
          <div className="text-base sm:text-lg font-semibold">{humidity}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <i className="fas fa-flask text-sm"></i>
            <span>NPK</span>
          </div>
          <div className="flex flex-wrap gap-2 text-gray-600 text-[11px] sm:text-xs">
            <div>N {npk.n}%</div>
            <div>P {npk.p}%</div>
            <div>K {npk.k}%</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-gray-400">
        <div className="mb-1 sm:mb-0">Pembaruan: {lastUpdate}</div>
        <div className="flex gap-3 text-sm">
          <button><i className="fas fa-repeat"></i></button>
          <button><i className="fas fa-gear"></i></button>
        </div>
      </div>
    </div>
  );
}
