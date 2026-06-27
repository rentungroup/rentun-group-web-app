import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation } from '../utils/db';
import { SITE } from '../config/site';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'ES');
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'COP');
  
  const { config: cfg } = useConfig();
  const loc = useLocation();
  const isLanding = loc.pathname === '/';
  const t = getTranslation(lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeLang = (l) => {
    localStorage.setItem('app_lang', l);
    setLang(l);
    window.dispatchEvent(new Event('config_changed'));
  };

  const changeCurrency = (c) => {
    localStorage.setItem('app_currency', c);
    setCurrency(c);
    window.dispatchEvent(new Event('config_changed'));
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (!isLanding) {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="app-navbar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: scrolled ? '0.65rem 4rem' : '1rem 4rem',
      background: 'rgba(10,53,96,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(245,124,0,0.18)',
      boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.28)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
          .app-navbar { padding: 0.6rem 1rem !important; }
        }
        @media (max-width: 600px) {
          .app-navbar { padding: 0.6rem 0.8rem !important; }
          .nav-logo { width: 30px !important; height: 30px !important; }
          .brand-slogan { display: none !important; }
        }
        @media (max-width: 450px) {
          .nav-title { display: none !important; }
          .logo-link { gap: 0 !important; }
        }
      `}</style>
      {/* Logo */}
      <Link to="/" onClick={() => setMenuOpen(false)} className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <img
          src="/logos/rentungroupwithe.webp"
          alt="Rentun Group Logo"
          className="nav-logo"
          style={{
            width: 40,
            height: 40,
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
          }}
        />
        <div>
          <span className="nav-title" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Rentun Group
          </span>
          <span className="brand-slogan" style={{ display: 'block', fontSize: '0.58rem', fontWeight: 600, color: '#F57C00', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            Rentas · Gestión · Inversión
          </span>
        </div>
      </Link>

      {/* Desktop links */}
      <ul className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><button onClick={() => scrollTo('propiedades')} style={navLink}>{t.navProps}</button></li>
        <li><button onClick={() => scrollTo('nosotros')} style={navLink}>{t.navNosotros}</button></li>
        {/* <li><Link to="/guia" style={navLink}>{t.navGuia}</Link></li> */}
        
        {/* Idioma Selector */}
        <li style={{ display:'flex', gap:'2px', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'2px', background:'rgba(0,0,0,0.15)' }}>
          <button onClick={() => changeLang('ES')} style={{ border:'none', background: lang === 'ES' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.7rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:50, cursor:'pointer', transition:'all 0.15s' }}>ES</button>
          <button onClick={() => changeLang('EN')} style={{ border:'none', background: lang === 'EN' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.7rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:50, cursor:'pointer', transition:'all 0.15s' }}>EN</button>
        </li>

        {/* Moneda Selector */}
        <li style={{ display:'flex', gap:'2px', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'2px', background:'rgba(0,0,0,0.15)', marginRight:'0.5rem' }}>
          <button onClick={() => changeCurrency('COP')} style={{ border:'none', background: currency === 'COP' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.7rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:50, cursor:'pointer', transition:'all 0.15s' }}>COP</button>
          <button onClick={() => changeCurrency('USD')} style={{ border:'none', background: currency === 'USD' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.7rem', fontWeight:800, padding:'0.2rem 0.5rem', borderRadius:50, cursor:'pointer', transition:'all 0.15s' }}>USD</button>
        </li>

        <li>
          <a href={waLink('Hola Rentun Group! Me interesa reservar 🏠')}
            target="_blank" rel="noopener noreferrer"
            style={navBtn}>
            {t.navReservar}
          </a>
        </li>
      </ul>

      {/* Mobile Menu Button (Hamburger) */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="nav-mobile-btn" style={{
        background: 'none', border: 'none', color: 'white',
        cursor: 'pointer', outline: 'none', display: 'none',
        padding: '0.4rem'
      }}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(10,53,96,0.99)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid rgba(245,124,0,0.25)',
          padding: '1.8rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          zIndex: 99
        }}>
          <button onClick={() => scrollTo('propiedades')} style={mobileNavLink}>{t.navProps}</button>
          <button onClick={() => scrollTo('nosotros')} style={mobileNavLink}>{t.navNosotros}</button>
          {/* <Link to="/guia" onClick={() => setMenuOpen(false)} style={mobileNavLink}>{t.navGuia}</Link> */}

          {/* Selectores Mobile */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', marginTop:'0.5rem' }}>
            <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', fontWeight:600 }}>Idioma / Language</span>
            <div style={{ display:'flex', gap:'2px', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'2px', background:'rgba(0,0,0,0.15)' }}>
              <button onClick={() => changeLang('ES')} style={{ border:'none', background: lang === 'ES' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.75rem', fontWeight:800, padding:'0.3rem 0.7rem', borderRadius:50, cursor:'pointer' }}>ES</button>
              <button onClick={() => changeLang('EN')} style={{ border:'none', background: lang === 'EN' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.75rem', fontWeight:800, padding:'0.3rem 0.7rem', borderRadius:50, cursor:'pointer' }}>EN</button>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', marginBottom:'0.5rem' }}>
            <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', fontWeight:600 }}>Moneda / Currency</span>
            <div style={{ display:'flex', gap:'2px', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'2px', background:'rgba(0,0,0,0.15)' }}>
              <button onClick={() => changeCurrency('COP')} style={{ border:'none', background: currency === 'COP' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.75rem', fontWeight:800, padding:'0.3rem 0.7rem', borderRadius:50, cursor:'pointer' }}>COP</button>
              <button onClick={() => changeCurrency('USD')} style={{ border:'none', background: currency === 'USD' ? '#F57C00' : 'transparent', color: 'white', fontSize:'0.75rem', fontWeight:800, padding:'0.3rem 0.7rem', borderRadius:50, cursor:'pointer' }}>USD</button>
            </div>
          </div>

          <a href={waLink('Hola Rentun Group! Me interesa reservar 🏠')}
             target="_blank" rel="noopener noreferrer"
             style={{ ...navBtn, justifyContent: 'center', padding: '0.8rem' }}>
            {t.navReservar}
          </a>
        </div>
      )}
    </nav>
  );
}

const navLink = {
  color: 'rgba(255,255,255,0.78)', background: 'none', border: 'none',
  fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  textDecoration: 'none', transition: 'color 0.2s',
};

const mobileNavLink = {
  color: 'white', background: 'none', border: 'none',
  fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  textDecoration: 'none', textAlign: 'left', padding: '0.4rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)'
};

const navBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
  background: 'linear-gradient(135deg,#F57C00,#FF9A2F)',
  color: 'white', textDecoration: 'none',
  padding: '0.65rem 1.5rem', borderRadius: 50,
  fontWeight: 700, fontSize: '0.85rem',
  lineHeight: 1,
  boxShadow: '0 4px 16px rgba(245,124,0,0.38)',
};
