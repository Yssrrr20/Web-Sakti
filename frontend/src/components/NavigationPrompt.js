import React from 'react';

const NavigationPrompt = ({ message }) => {
  return (
    <div className="bg-yellow-100 p-4 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-md mb-6">
      <h3 className="font-semibold text-lg">Petunjuk Navigasi</h3>
      <p>{message}</p>
    </div>
  );
};

export default NavigationPrompt;  