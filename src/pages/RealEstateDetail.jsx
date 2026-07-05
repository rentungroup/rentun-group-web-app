import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation } from '../utils/db';
import { SITE } from '../config/site';

export default function RealEstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config: cfg } = useConfig();
  const lang = localStorage.getItem('app_lang') || 'ES';
  const t = getTranslation(lang);

  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!cfg) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontWeight: 600 }}>Cargando detalles de la propiedad...</p>
      </div>
    );
  }

  // Parse portfolio items with legacy compatibility
  const portfolioItems = (cfg.rePageGallery || []).map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `legacy-${idx}`,
        title: lang === 'EN' ? `Premium Space ${idx + 1}` : `Espacio Premium ${idx + 1}`,
        titleEn: `Premium Space ${idx + 1}`,
        description: lang === 'EN' ? 'An exclusive space managed with the high standards of Rentun Group. Perfect for enjoying comfort and design.' : 'Un espacio exclusivo gestionado con los altos estándares de Rentun Group. Perfecto para disfrutar de la comodidad y el diseño.',
        descriptionEn: 'An exclusive space managed with the high standards of Rentun Group. Perfect for enjoying comfort and design.',
        price: lang === 'EN' ? 'Inquire' : 'Consultar',
        location: lang === 'EN' ? 'Premium Location' : 'Ubicación Premium',
        locationEn: 'Premium Location',
        specs: lang === 'EN' ? 'Premium specs' : 'Características Premium',
        specsEn: 'Premium specs',
        images: [item]
      };
    }
    return item;
  });

  const property = portfolioItems.find(p => p.id === id);

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
          {lang === 'EN' ? 'Property Not Found' : 'Propiedad no encontrada'}
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400 }}>
          {lang === 'EN' 
            ? 'The property you are looking for does not exist or has been removed from our portfolio.' 
            : 'La propiedad que estás buscando no existe o ha sido retirada de nuestro portafolio.'}
        </p>
        <Link to="/inmobiliaria" style={{ background: 'var(--navy-dark)', color: 'white', padding: '0.8rem 1.8rem', borderRadius: 50, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
          {lang === 'EN' ? 'Return to Portfolio' : 'Volver al Portafolio'}
        </Link>
      </div>
    );
  }

  // Helper translations helper
  const title = lang === 'EN' ? (property.titleEn || property.title) : property.title;
  const description = lang === 'EN' ? (property.descriptionEn || property.description) : property.description;
  const location = lang === 'EN' ? (property.locationEn || property.location) : property.location;
  const specs = lang === 'EN' ? (property.specsEn || property.specs) : property.specs;
  const images = property.images || [];

  // Dynamic Page Title
  useEffect(() => {
    document.title = `${title} | Rentun Group`;
  }, [title]);

  const phone = cfg.whatsapp || SITE.whatsapp;
  const msgText = lang === 'EN'
    ? `Hello Rentun Group! I would like to receive detailed information about the property: ${title}`
    : `¡Hola Rentun Group! Me gustaría recibir información detallada sobre la propiedad: ${title}`;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── BACK BUTTON & NAVIGATION BAR ────────────────── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E6E7E8', padding: '1.2rem 2rem', marginTop: '74px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => navigate('/inmobiliaria')}
            style={{ 
              background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
              color: '#0F4C81', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: 0 
            }}
          >
            <ArrowLeft size={18} />
            {lang === 'EN' ? 'Back to Portfolio' : 'Volver al Portafolio'}
          </button>
          
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {lang === 'EN' ? 'Real Estate' : 'Inmobiliaria'} / {title}
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        
        {/* Luxury Hero Grid (Image & Gallery Controls) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          
          {/* Large Main Photo */}
          <div style={{ 
            height: 'clamp(300px, 50vw, 550px)', 
            borderRadius: 24, 
            overflow: 'hidden', 
            background: '#0d1724', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
            position: 'relative'
          }}>
            <img 
              src={images[activeImageIdx] || images[0]} 
              alt={title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {property.price && (
              <span style={{ 
                position: 'absolute', bottom: '1.5rem', left: '1.5rem', 
                background: 'var(--navy-dark)', color: 'white', fontSize: '0.9rem', 
                fontWeight: 800, padding: '0.5rem 1.2rem', borderRadius: 50, 
                border: '1px solid rgba(196,154,60,0.35)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' 
              }}>
                {property.price}
              </span>
            )}
          </div>

          {/* Secondary Thumbnails Row */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    width: 100,
                    height: 75,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: activeImageIdx === idx ? '3px solid #0F4C81' : '1px solid #E6E7E8',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'none',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── TWO-COLUMN DETAIL VIEW ────────────────────── */}
        <div className="detail-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
          <style>{`
            .detail-layout-grid {
              display: grid !important;
              grid-template-columns: 1.6fr 1fr !important;
              gap: 3rem !important;
            }
            @media (max-width: 900px) {
              .detail-layout-grid {
                grid-template-columns: 1fr !important;
                gap: 2.5rem !important;
              }
            }
          `}</style>

          {/* Left Column: Extensive Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--navy-dark)', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 1.2rem' }}>
              {title}
            </h1>

            {specs && (
              <div style={{ display: 'inline-flex', background: '#F0F4F8', color: '#0F4C81', fontSize: '0.88rem', fontWeight: 700, padding: '0.5rem 1.2rem', borderRadius: 10, marginBottom: '2.5rem', boxShadow: '0 2px 8px rgba(15,76,129,0.05)' }}>
                {specs}
              </div>
            )}

            <div style={{ background: 'white', borderRadius: 24, padding: '2rem', border: '1px solid #E6E7E8', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.2rem', borderBottom: '1px solid #E6E7E8', paddingBottom: '0.8rem' }}>
                {lang === 'EN' ? 'Description & Details' : 'Descripción y Detalles'}
              </h3>
              <p style={{ fontSize: '0.98rem', color: '#4A5568', lineHeight: 1.8, margin: 0, textAlign: 'justify', whiteSpace: 'pre-line' }}>
                {description}
              </p>
            </div>
          </div>

          {/* Right Column: Floating Inquiry Card */}
          <div>
            <div style={{ 
              position: 'sticky', top: '100px', 
              background: 'white', border: '1px solid #E6E7E8', borderRadius: 24, 
              padding: '2.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', 
              boxShadow: '0 15px 40px rgba(0,0,0,0.03)' 
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  {lang === 'EN' ? 'Reference Price' : 'Precio de Referencia'}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy-dark)' }}>
                  {property.price || (lang === 'EN' ? 'Contact us' : 'Consultar precio')}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: 0 }} />

              <p style={{ fontSize: '0.88rem', color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                {lang === 'EN' 
                  ? 'Contact our executive team directly via WhatsApp to coordinate visits, obtain complete floor plans, or consult financial terms.'
                  : 'Contacta a nuestro equipo ejecutivo directamente por WhatsApp para coordinar visitas, obtener planos completos o consultar términos financieros.'}
              </p>

              <a 
                href={waLink(msgText, phone)}
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#25D366', color: 'white', textDecoration: 'none',
                  padding: '1rem 1.5rem', borderRadius: 14, fontWeight: 800,
                  fontSize: '0.92rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.6rem', boxShadow: '0 6px 20px rgba(37,211,102,0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <MessageCircle size={20} />
                {lang === 'EN' ? 'Inquire on WhatsApp' : 'Preguntar por WhatsApp'}
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: 12, border: '1px solid #E6E7E8' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600, lineHeight: 1.4 }}>
                  {lang === 'EN' 
                    ? '100% verified properties. Professional support throughout the process.' 
                    : 'Propiedades 100% verificadas. Acompañamiento profesional en todo el proceso.'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ background: 'var(--navy-dark)', borderTop: '1px solid rgba(196,154,60,0.3)', padding: '3rem 2rem 2rem', color: 'white', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            © {new Date().getFullYear()} Rentun Group. {lang === 'EN' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
