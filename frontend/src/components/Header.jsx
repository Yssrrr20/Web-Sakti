import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = (path) =>
    `text-xl font-semibold border-b-2 ${
      location.pathname === path
        ? 'text-green-600 border-green-600' // Aktif
        : 'text-gray-700 border-transparent hover:border-green-600 hover:text-green-600' // Tidak aktif
    }`;

  return (
    <header className="flex items-center bg-white p-4 shadow-md">
      {/* Logo dan Nama */}
      <div className="flex items-center space-x-2 mr-auto">
        <img src="/assets/Vector (1).png" alt="Palmwatch Logo" className="w-10 h-10" />
        <span className="text-2xl font-bold text-green-600">Palmwatch</span>
      </div>

      {/* Menu Navigasi */}
      <nav className="hidden lg:flex space-x-6 mx-auto justify-center">
        <Link to="/" className={navLinkClass('/')}>
          Dashboard
        </Link>
        <Link to="/peta" className={navLinkClass('/peta')}>
          Peta
        </Link>
        <Link to="/analisis" className={navLinkClass('/analisis')}>
          Analisis
        </Link>
        <Link to="/perangkat" className={navLinkClass('/perangkat')}>
          Perangkat
        </Link>
        {/* <Link to="/riwayat" className={navLinkClass('/riwayat')}>
          Riwayat
        </Link> */}
      </nav>

      {/* Hamburger Menu untuk tampilan Mobile */}
      <div className="lg:hidden ml-auto">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 p-2">
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Menu Navigasi di Mobile */}
      {isMenuOpen && (
        <nav className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4 flex flex-col">
          <Link to="/" className={`${navLinkClass('/')} py-2`}>
            Dashboard
          </Link>
          <Link to="/peta" className={`${navLinkClass('/peta')} py-2`}>
            Peta
          </Link>
          <Link to="/analisis" className={`${navLinkClass('/analisis')} py-2`}>
            Analisis
          </Link>
          <Link to="/perangkat" className={`${navLinkClass('/perangkat')} py-2`}>
            Perangkat
          </Link>
          {/* <Link to="/riwayat" className={`${navLinkClass('/riwayat')} py-2`}>
            Riwayat
          </Link> */}
        </nav>
      )}

      {/* Info Pengguna dan Pengaturan */}
      <div className="flex items-center space-x-4 ml-auto">
        <button className="bg-transparent text-gray-700 p-0 hover:text-green-600">
          <i className="fa-solid fa-gear text-3xl hover:text-green-500"></i>
        </button>
        <button className="bg-transparent text-gray-700 p-0 hover:text-green-600">
          <i className="fa-solid fa-circle-user text-3xl hover:text-green-500"></i>
        </button>
        <span className="text-gray-700">Admin</span>
      </div>
    </header>
  );
};

export default Header;
