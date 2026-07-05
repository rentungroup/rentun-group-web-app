import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation } from '../utils/db';
import { SITE } from '../config/site';

export default function Footer() {
  const { config: cfg } = useConfig();
  const lang = localStorage.getItem('app_lang') || 'ES';
  const t = getTranslation(lang);

  if (!cfg) return null;

  const phone = cfg.whatsapp || SITE.whatsapp;
  const email = cfg.email || SITE.email;
  const airbnbListing = cfg.properties?.[0]?.listing || SITE.airbnb?.booking || '#';

  const hoverStyle = (e, color) => {
    e.target.style.color = color;
  };

  return (
    <footer style={{ 
      background: '#04111f', 
      padding: '5rem 2rem 2.5rem', 
      color: 'rgba(255,255,255,0.5)', 
      position: 'relative', 
      overflow: 'hidden', 
      borderTop: '4px solid var(--orange)' 
    }}>
      {/* ── 4-COLUMN FOOTER CONTENT ── */}
      <div className="s-inner footer-grid-4" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '3rem', 
        textAlign: 'left', 
        marginBottom: '3rem', 
        position: 'relative', 
        zIndex: 2 
      }}>
        <style>{`
          .footer-grid-4 {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
            gap: 3rem !important;
          }
          @media (max-width: 900px) {
            .footer-grid-4 {
              grid-template-columns: 1fr 1fr !important;
              gap: 2.5rem !important;
            }
          }
          @media (max-width: 600px) {
            .footer-grid-4 {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
        
        {/* Column 1: Brand & Slogan */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
            <img src="/logos/rentungroupwithe.webp" alt="Rentun Group Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 850, color: 'white', letterSpacing: '-0.02em' }}>Rentun Group</span>
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange)', marginBottom: '1rem' }}>
            Rentas · Gestión · Inversión
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.6, margin: 0 }}>
            {lang === 'EN' 
              ? 'Short-stay apartments with premium service. Vacation rentals, comprehensive management, and high-level national and international real estate consulting.' 
              : 'Apartamentos de corta estancia con servicio premium. Rentas vacacionales, administración integral y consultoría inmobiliaria a nivel nacional e internacional.'}
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.4rem 0' }}>
            {lang === 'EN' ? 'Explore' : 'Explora'}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href="/#propiedades" style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                 onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                🏠 {t.navProps}
              </a>
            </li>
            <li>
              <a href="/#nosotros" style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                 onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                👥 {t.navNosotros}
              </a>
            </li>
            <li>
              <Link to="/inmobiliaria" style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                 onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                🏢 {lang === 'EN' ? 'Real Estate' : 'Inmobiliaria'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Links */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.4rem 0' }}>
            {lang === 'EN' ? 'Contact' : 'Contacto'}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href={waLink('Hola Rentun Group!', phone)} target="_blank" rel="noopener noreferrer"
                 style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                 onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                💬 {lang === 'EN' ? 'Official WhatsApp' : 'WhatsApp Oficial'}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`}
                 style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                 onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                ✉️ {lang === 'EN' ? 'Official Email' : 'Correo Oficial'}
              </a>
            </li>
            {airbnbListing && airbnbListing !== '#' && (
              <li>
                <a href={airbnbListing} target="_blank" rel="noopener noreferrer"
                   style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'color 0.2s' }}
                   onMouseOver={e => hoverStyle(e, 'white')} onMouseOut={e => hoverStyle(e, 'rgba(255,255,255,0.48)')}>
                  🏠 {lang === 'EN' ? 'Airbnb Profile' : 'Perfil de Airbnb'}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Column 4: Legal & RNT */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.4rem 0' }}>
            {lang === 'EN' ? 'Policies' : 'Normativas'}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/legal" style={{ color: 'var(--orange)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800, transition: 'opacity 0.2s' }}
                    onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
                {lang === 'EN' ? '📄 Privacy Policy & Legal →' : '📄 Políticas de Privacidad y Legales →'}
              </Link>
            </li>
            <li style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
              RNT: {cfg.rntNumber || (lang === 'EN' ? 'In progress' : 'En trámite')}
            </li>
          </ul>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, marginTop: '1rem', margin: 0 }}>
            {lang === 'EN' 
              ? 'Pursuant to Law 679 of 2001 (ESCNNA Prevention) and Law 1581 of 2012 (Habeas Data).' 
              : 'Conforme a Ley 679 de 2001 (Prevención ESCNNA) y Ley 1581 de 2012 (Habeas Data).'}
          </p>
        </div>

      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2rem 0', position: 'relative', zIndex: 2 }} />

      {/* Copyright & Developer Credits */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', position: 'relative', zIndex: 2 }}>
        <p style={{ margin: 0 }}>
          {lang === 'EN' 
            ? '© 2026 Rentun Group. All rights reserved. · Bogota, Colombia' 
            : '© 2026 Rentun Group. Todos los derechos reservados. · Bogotá, Colombia'}
        </p>
        <p style={{ margin: 0 }}>
          {lang === 'EN' ? 'Developed by ' : 'Desarrollado por '}
          <a
            href="https://www.jymtechsolutions.online/es"
            hrefLang="es"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--orange)', textDecoration: 'underline', fontWeight: 700 }}
          >
            J&M Tech Solutions
          </a>
        </p>
      </div>
    </footer>
  );
}
