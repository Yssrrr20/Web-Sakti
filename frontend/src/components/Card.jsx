import React from 'react';

const Card = ({ title, count, icon, color }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex items-center">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} text-white rounded-full flex items-center justify-center mr-4`}>
        <i className={`fas ${icon} text-2xl`} />
      </div>
      <div>
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-700">{title}</h2>
        <p className={`text-xl sm:text-3xl font-bold ${
          color === "bg-blue-500" ? "text-blue-500" : 
          color === "bg-green-500" ? "text-green-500" : 
          color === "bg-red-500" ? "text-red-500" : 
          "text-purple-500"}`}>
          {count}
        </p>
      </div>
    </div>
  );
};

export default Card;
