import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing    from './pages/Landing';
import GuestGuide from './pages/GuestGuide';
import Admin      from './pages/Admin';
import Legal      from './pages/Legal';
import PrintView  from './pages/PrintView';
import ChatWidget from './components/ChatWidget';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';

function FontLoader() {
  const { config } = useConfig();
  const fontPair = config?.fontPair || 'outfit_inter';

  useEffect(() => {

    // Aplicar las variables de CSS al documentElement
    const FONT_MAP = {
      outfit_inter: { header: "'Outfit', sans-serif", body: "'Inter', sans-serif" },
      cinzel_montserrat: { header: "'Cinzel', serif", body: "'Montserrat', sans-serif" },
      playfair_montserrat: { header: "'Playfair Display', serif", body: "'Montserrat', sans-serif" },
      cormorant_inter: { header: "'Cormorant Garamond', serif", body: "'Inter', sans-serif" },
      playfair_inter: { header: "'Playfair Display', serif", body: "'Inter', sans-serif" },
      cinzel_inter: { header: "'Cinzel', serif", body: "'Inter', sans-serif" },
      cormorant_montserrat: { header: "'Cormorant Garamond', serif", body: "'Montserrat', sans-serif" },
      bodoni_montserrat: { header: "'Bodoni Moda', serif", body: "'Montserrat', sans-serif" },
      prata_inter: { header: "'Prata', serif", body: "'Inter', sans-serif" }
    };

    const root = document.documentElement;
    const currentPair = FONT_MAP[fontPair] || FONT_MAP.outfit_inter;
    root.style.setProperty('--font-header', currentPair.header);
    root.style.setProperty('--font-body', currentPair.body);

  }, [fontPair]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <FontLoader />
        <BrowserRouter>
          <Routes>
            <Route path="/"              element={<Landing />} />
            <Route path="/guia"          element={<GuestGuide />} />
            <Route path="/admin"         element={<Admin />} />
            <Route path="/legal"         element={<Legal />} />
            <Route path="/imprimir/:id"  element={<PrintView />} />
          </Routes>
          <ChatWidget />
        </BrowserRouter>
      </ConfigProvider>
    </AuthProvider>
  );
}
