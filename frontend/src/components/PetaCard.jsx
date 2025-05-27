import React from 'react';

const PetaCard = ({ children, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="h-[500px]">
        {children} 
      </div>
    </div>
  );
};

export default PetaCard;
