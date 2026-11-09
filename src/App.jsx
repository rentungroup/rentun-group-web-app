import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
const ChatWidget = lazy(() => import('./components/ChatWidget'));
import LeadModal from './components/LeadModal';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { Analytics } from '@vercel/analytics/react';
import { trackPageView } from './utils/analytics';

// Code-split heavy routes to slash initial bundle size from 870 kB to <180 kB
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const GuestGuide = lazy(() => import('./pages/GuestGuide'));
const Admin = lazy(() => import('./pages/Admin'));
const Legal = lazy(() => import('./pages/Legal'));
const PrintView = lazy(() => import('./pages/PrintView'));
const PrintContract = lazy(() => import('./pages/PrintContract'));

function PageViewTracker() {
  useEffect(() => {
    trackPageView({ path: window.location.pathname });
  }, []);
  return null;
}

function FontLoader() {
  const { config } = useConfig();
  if (!config) return null;
  const fontPair = config.fontPair || 'outfit_inter';

  useEffect(() => {
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
          <ScrollToTop />
          <PageViewTracker />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/propiedades" element={<Properties />} />
              <Route path="/propiedad/:id" element={<PropertyDetails />} />
              <Route path="/propiedades/:id" element={<PropertyDetails />} />
              <Route path="/guia" element={<GuestGuide />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/imprimir/:id" element={<PrintView />} />
              <Route path="/imprimir-contrato/:id" element={<PrintContract />} />
            </Routes>
          </Suspense>
          <Suspense fallback={null}><ChatWidget /></Suspense>
          <LeadModal />
        </BrowserRouter>
        <Analytics />
      </ConfigProvider>
    </AuthProvider>
  );
}
