import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation } from '../utils/db';
import { SITE } from '../config/site';
import Navbar from '../components/Navbar';
import { PropCard } from './Landing';

export default function Properties() {
  const { config: cfg } = useConfig();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'ES');
  const properties = cfg.properties || [];
  const t = getTranslation(lang);

  // Estados de Filtros
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minGuests, setMinGuests] = useState(1);

  // Escuchar cambio de idioma global
  useEffect(() => {
    const handleConfigChange = () => {
      setLang(localStorage.getItem('app_lang') || 'ES');
    };
    window.addEventListener('config_changed', handleConfigChange);
    return () => window.removeEventListener('config_changed', handleConfigChange);
  }, []);

  // Extraer las zonas únicas de los apartamentos para el filtro
  const locations = Array.from(
    new Set(
      properties
        .map(p => (lang === 'EN' ? p.locationEn || p.location : p.location))
        .filter(Boolean)
    )
  );

  // Filtrar los apartamentos
  const filteredProperties = properties.filter(p => {
    const name = (lang === 'EN' ? p.nameEn || p.name : p.name) || '';
    const locName = (lang === 'EN' ? p.locationEn || p.location : p.location) || '';
    const desc = (lang === 'EN' ? p.descriptionEn || p.description : p.description) || '';
    
    const matchesSearch = 
      name.toLowerCase().includes(search.toLowerCase()) || 
      locName.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase());
      
    const matchesLocation = 
      selectedLocation === 'all' || 
      locName === selectedLocation;
      
    const matchesGuests = (p.guests || 2) >= minGuests;

    return matchesSearch && matchesLocation && matchesGuests;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body, sans-serif)' }}>
      <Navbar />

      {/* Hero Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #0A3560 0%, #0F4C81 100%)', 
        padding: '9rem 4rem 5rem', 
        color: 'white', 
        textAlign: 'center',
        borderBottom: '4px solid var(--orange)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <Link to="/" style={{
            position: 'absolute',
            top: '-2.5rem',
            left: '1rem',
            color: 'rgba(255,255,255,0.75)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'color 0.2s',
            background: 'rgba(255,255,255,0.08)',
            padding: '0.4rem 1rem',
            borderRadius: 50,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onMouseEnter={(e)=>{e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(255,255,255,0.15)'}}
          onMouseLeave={(e)=>{e.currentTarget.style.color='rgba(255,255,255,0.75)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'}}
          >
            ← {lang === 'EN' ? 'Back to home' : 'Volver al inicio'}
          </Link>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--orange)', 
            display: 'block', 
            marginBottom: '0.8rem',
            marginTop: '0.5rem'
          }}>
            {lang === 'EN' ? '🏨 Premium Catalog' : '🏨 Catálogo Premium'}
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            margin: 0,
            fontFamily: 'var(--font-header, serif)'
          }}>
            {lang === 'EN' ? 'Available Apartments' : 'Apartamentos Disponibles'}
          </h1>
          <p style={{ 
            fontSize: '0.98rem', 
            color: 'rgba(255,255,255,0.72)', 
            marginTop: '1rem', 
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '1rem auto 0'
          }}>
            {lang === 'EN' 
              ? 'Find the perfect place for your stay in Bogota. Fully equipped apartments in the most exclusive areas.' 
              : 'Encuentra el lugar ideal para tu estadía en Bogotá. Apartamentos completamente amoblados en las mejores zonas.'
            }
          </p>
        </div>
      </header>

      {/* Main Section */}
      <main style={{ flex: 1, padding: '4rem 4rem 6rem', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Filtros Container */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: '2rem', 
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)', 
          border: '1px solid #E6E7E8',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3.5rem',
          alignItems: 'end'
        }}>
          {/* Búsqueda de Texto */}
          <div>
            <label style={filterLabelStyle}>
              {lang === 'EN' ? '🔍 Search' : '🔍 Buscar'}
            </label>
            <input 
              type="text" 
              placeholder={lang === 'EN' ? 'Search by name or zone...' : 'Buscar por nombre o zona...'} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={filterInputStyle}
            />
          </div>

          {/* Filtro Ubicación */}
          <div>
            <label style={filterLabelStyle}>
              {lang === 'EN' ? '📍 Zone' : '📍 Zona'}
            </label>
            <select 
              value={selectedLocation} 
              onChange={e => setSelectedLocation(e.target.value)}
              style={filterInputStyle}
            >
              <option value="all">{lang === 'EN' ? 'All areas' : 'Todas las zonas'}</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filtro Huéspedes */}
          <div>
            <label style={filterLabelStyle}>
              {lang === 'EN' ? '👥 Capacity (Min Guests)' : '👥 Capacidad mínima (Huéspedes)'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <input 
                type="range" 
                min="1" 
                max="8" 
                value={minGuests}
                onChange={e => setMinGuests(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--orange)' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F4C81', width: '2.5rem', textAlign: 'right' }}>
                {minGuests} {lang === 'EN' ? 'pax' : 'pers'}
              </span>
            </div>
          </div>
        </div>

        {/* Listado de Propiedades */}
        {filteredProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: 24, border: '1px solid #E6E7E8' }}>
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a2332', marginTop: '1rem', marginBottom: '0.5rem' }}>
              {lang === 'EN' ? 'No apartments found' : 'No se encontraron apartamentos'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#5c6d80', margin: 0 }}>
              {lang === 'EN' ? 'Try adjusting your filters or search terms.' : 'Prueba cambiando los filtros o términos de búsqueda.'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {filteredProperties.map((p, idx) => (
              <PropCard key={p.id} p={p} idx={idx} lang={lang} t={t} waLink={waLink} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background:'#04111f', padding:'6rem 4rem 3rem', color:'rgba(255,255,255,0.5)', borderTop:'4px solid var(--orange)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'3rem', textAlign:'left', marginBottom:'3rem' }}>
            
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'1.2rem' }}>
                <img src="/logos/rentungroupwithe.webp" alt="Rentun Group Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                <span style={{ fontSize:'1.15rem', fontWeight:850, color:'white', letterSpacing:'-0.02em' }}>Rentun Group</span>
              </div>
              <div style={{ fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--orange)', marginBottom:'1rem' }}>
                Rentas · Gestión · Inversión
              </div>
              <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.48)', lineHeight:1.6, margin:0 }}>
                {lang === 'EN' ? 'Short-stay apartments with premium service in Bogota. Vacation rentals, comprehensive management, and high-level real estate consulting.' : 'Apartamentos de corta estancia con servicio premium en Bogotá. Rentas vacacionales, administración integral y consultoría inmobiliaria de alto nivel.'}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
                {lang === 'EN' ? 'Explore' : 'Explora'}
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <li>
                  <a href="/#propiedades" style={footerLinkStyle}>
                    {t.navProps}
                  </a>
                </li>
                <li>
                  <a href="/#nosotros" style={footerLinkStyle}>
                    {t.navNosotros}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
                {lang === 'EN' ? 'Contact' : 'Contacto'}
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <li>
                  <a href={waLink('Hola Rentun Group!')} target="_blank" rel="noopener noreferrer" style={footerLinkStyle}>
                    💬 {lang === 'EN' ? 'Official WhatsApp' : 'WhatsApp Oficial'}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${cfg.email || SITE.email}`} style={footerLinkStyle}>
                    ✉️ {lang === 'EN' ? 'Official Email' : 'Correo Oficial'}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
                {lang === 'EN' ? 'Legal' : 'Legal'}
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <li>
                  <a href="/legal" style={footerLinkStyle}>
                    ⚖️ {lang === 'EN' ? 'Terms & Legal Policies' : 'Términos y Políticas Legales'}
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'2.5rem', display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:'1.5rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.36)' }}>
            <div>
              &copy; {new Date().getFullYear()} Rentun Group. Todos los derechos reservados.
            </div>
            <div>
              Desarrollado por <a href="https://www.jymtechsolutions.online/es" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>J&M Tech Solutions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Estilos Reusables de Filtros
const filterLabelStyle = {
  display: 'block', 
  fontSize: '0.72rem', 
  fontWeight: 800, 
  color: '#5c6d80', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em', 
  marginBottom: '0.6rem'
};

const filterInputStyle = {
  width: '100%', 
  padding: '0.75rem 1rem', 
  border: '1.5px solid #E6E7E8', 
  borderRadius: 12, 
  fontSize: '0.88rem', 
  fontFamily: 'inherit', 
  color: '#0d1724', 
  outline: 'none', 
  background: '#fafafa',
  boxSizing: 'border-box'
};

const footerLinkStyle = {
  color:'rgba(255,255,255,0.48)', 
  textDecoration:'none', 
  fontSize:'0.82rem', 
  fontWeight:500, 
  transition:'color 0.2s'
};
