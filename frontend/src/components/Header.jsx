// components/Header.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ setIsMenuOpen }) => {
  const location = useLocation();
  const [isLocalMenuOpen, setIsLocalMenuOpen] = useState(false);

  React.useEffect(() => {
    if (setIsMenuOpen) {
      setIsMenuOpen(isLocalMenuOpen);
    }
  }, [isLocalMenuOpen, setIsMenuOpen]);

  const navLinkClass = (path) =>
    `text-xl font-semibold border-b-2 ${
      location.pathname === path
        ? 'text-green-600 border-green-600'
        : 'text-gray-700 border-transparent hover:border-green-600 hover:text-green-600'
    }`;

  return (
    <header className="fixed top-0 w-full h-16 bg-white p-4 shadow-md z-[999] flex items-center">
      {/* Logo dan Nama */}
      <div className="flex items-center space-x-2 flex-grow justify-start">
        <img src="/assets/LOGO.png" alt="Palmwatch Logo" className="w-10 h-10" />
        <span className="text-2xl font-bold text-green-600">SAKTI</span>
      </div>

      {/* Menu Navigasi (Desktop) */}
      <nav className="hidden lg:flex space-x-6 mx-auto justify-center">
        <Link to="/" className={navLinkClass('/')}>
          Dashboard
        </Link>
        <Link to="/peta" className={navLinkClass('/peta')}>
          Peta
        </Link>
        <Link to="/perangkat" className={navLinkClass('/perangkat')}>
          Perangkat
        </Link>
      </nav>

      {/* Placeholder/Penyeimbang untuk Desktop */}
      <div className="hidden lg:flex flex-grow justify-end">
      </div>

      {/* Hamburger Menu untuk tampilan Mobile */}
      <div className="lg:hidden ml-auto">
        <button onClick={() => setIsLocalMenuOpen(!isLocalMenuOpen)} className="text-gray-700 p-2">
          <i className={`fa-solid ${isLocalMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Menu Navigasi di Mobile */}
      {isLocalMenuOpen && (
        // Menu mobile akan muncul tepat di bawah header fixed
        <nav className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 space-y-4 flex flex-col z-[990]">
          <Link to="/" className={`${navLinkClass('/')} py-2`}>
            Dashboard
          </Link>
          <Link to="/peta" className={`${navLinkClass('/peta')} py-2`}>
            Peta
          </Link>
          <Link to="/perangkat" className={`${navLinkClass('/perangkat')} py-2`}>
            Perangkat
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;