import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import Header from './components/Header';  
import Dashboard from './components/Dashboard'; 
import PetaPage from './pages/Peta';  
import Perangkat from './pages/Perangkat';
import Analisis from './pages/Analisis';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function App() {
  return (
    <Router>  
      <Header />  
      <Routes>  
        <Route path="/" element={<Dashboard />} /> 
        <Route path="/peta" element={<PetaPage />} />  
        <Route path="/perangkat" element={<Perangkat />} />
        <Route path="/analisis" element={<Analisis />} />
      </Routes>
    </Router>
  );
}

export default App;
