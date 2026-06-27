import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation, formatPrice } from '../utils/db';
import { SITE } from '../config/site';
import Navbar from '../components/Navbar';
import { ArrowRight, Star, Home, Coffee, Info, Smartphone, ExternalLink, CalendarDays } from 'lucide-react';

// ── Scroll Reveal Hook ──────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Tiny reusable badge ─────────────────────────────────
function Tag({ children, dark = false }) {
  // Check if children is a string starting with ✨
  const text = typeof children === 'string' ? children.replace('✨', '').trim() : children;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      background: dark ? 'rgba(15,76,129,0.08)' : 'rgba(255,255,255,0.03)', 
      color: dark ? 'var(--navy-dark)' : 'white',
      border: dark ? '1px solid rgba(15,76,129,0.15)' : '1px solid rgba(255,255,255,0.1)', 
      borderRadius:50,
      padding:'0.32rem 1rem', fontSize:'0.7rem', fontWeight:700,
      textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.8rem',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--orange)' }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      {text}
    </span>
  );
}

// ── Section title ───────────────────────────────────────
function STitle({ children }) {
  return (
    <h2 style={{
      fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800,
      color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.9rem',
    }}>{children}</h2>
  );
}

function SSub({ children, style }) {
  return (
    <p style={{ fontSize:'0.98rem', color:'var(--text-muted)', lineHeight:1.72, ...style }}>{children}</p>
  );
}

// ── Buttons ─────────────────────────────────────────────
const BtnOrange = ({ href, children, onClick, id }) => (
  <a href={href} id={id} onClick={onClick} target={href?.startsWith('http') ? '_blank' : undefined}
     rel="noopener noreferrer"
     style={{
       display:'inline-flex', alignItems:'center', gap:'0.55rem',
       background:'var(--orange)', color:'var(--text)',
       textDecoration:'none', padding:'0.9rem 2rem', borderRadius:8,
       fontWeight:800, fontSize:'0.95rem',
       boxShadow:'var(--shadow-md)', transition:'all 0.2s',
     }}>
    {children}
  </a>
);

const BtnNavy = ({ href, children, id }) => (
  <a href={href} id={id} target="_blank" rel="noopener noreferrer"
     style={{
       display:'inline-flex', alignItems:'center', gap:'0.45rem',
       background:'var(--navy-dark)', color:'white',
       textDecoration:'none', padding:'0.65rem 1.35rem', borderRadius:8,
       fontSize:'0.8rem', fontWeight:700,
       boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
     }}>
    {children}
  </a>
);

const BtnWA = ({ msg, children, id, style }) => (
  <a href={waLink(msg)} id={id} target="_blank" rel="noopener noreferrer"
     style={{
       display:'inline-flex', alignItems:'center', gap:'0.6rem',
       background:'#25D366', color:'white', textDecoration:'none',
       padding:'1rem 2.2rem', borderRadius:8, fontWeight:700, fontSize:'1rem',
       boxShadow:'var(--shadow-md)', transition:'all 0.2s', ...style,
     }}>
    {children}
  </a>
);

const BtnAirbnb = ({ href, children, id, style }) => (
  <a href={href} id={id} target="_blank" rel="noopener noreferrer"
     style={{
       display:'inline-flex', alignItems:'center', gap:'0.6rem',
       background:'#FF385C', color:'white', textDecoration:'none',
       padding:'1rem 2.2rem', borderRadius:8, fontWeight:700, fontSize:'1rem',
       boxShadow:'var(--shadow-md)', transition:'all 0.2s', ...style,
     }}>
    {children}
  </a>
);

// ── Image Slider (Carrusel) ──────────────────────────────
function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div style={{ height:'100%', minHeight:450, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:28 }}>
        <span style={{ fontSize:'2.5rem' }}>🖼️</span>
      </div>
    );
  }

  return (
    <div className="slider-container" style={{ borderRadius: '28px', position: 'relative', zIndex: 1 }}>
      <div className="slider-glow" />
      <img 
        src={images[currentIndex]} 
        alt="Apartamento" 
        className="slider-img" 
        style={{ position: 'relative', zIndex: 2, borderRadius: '28px' }}
      />
      {images.length > 1 && (
        <div className="slider-dots" style={{ zIndex: 3 }}>
          {images.map((_, idx) => (
            <button 
              key={idx} 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCurrentIndex(idx); }} 
              className={`slider-dot${idx === currentIndex ? ' active' : ''}`}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  LANDING PAGE
// ════════════════════════════════════════════════════════
export default function Landing() {
  useReveal();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'ES');
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'COP');

  useEffect(() => {
    const handleConfigChange = () => {
      setLang(localStorage.getItem('app_lang') || 'ES');
      setCurrency(localStorage.getItem('app_currency') || 'COP');
    };
    window.addEventListener('config_changed', handleConfigChange);
    return () => window.removeEventListener('config_changed', handleConfigChange);
  }, []);

  const { config: cfg } = useConfig();
  const properties = cfg.properties || [];
  const mainProp = properties[0] || {};
  const t = getTranslation(lang);
  const waBtnLink = waLink(cfg.whatsapp, '¡Hola! Quiero información para reservar mi estadía en Rentun Group.');
  
  // Cargamos el SDK de Airbnb para mostrar el widget en la sección de propiedades
  useEffect(() => {
    if (mainProp.isAirbnb) {
      const existing = document.getElementById('airbnb-jssdk');
      if (existing) existing.remove();

      if (window.AirbnbJSSDK) {
        try { window.AirbnbJSSDK.init(); } catch (e) { console.error(e); }
      }
      const script = document.createElement('script');
      script.id = 'airbnb-jssdk';
      script.async = true;
      script.src = 'https://www.airbnb.com.co/embeddable/airbnb_jssdk';
      document.body.appendChild(script);
    }
  }, [mainProp.id, mainProp.isAirbnb]);

  // Enlaces de Airbnb para el primer apartamento (Hero)
  const ab = {
    listing: mainProp.airbnbListing || SITE.airbnb.listing,
    booking: mainProp.airbnbBooking || SITE.airbnb.booking,
    reviews: mainProp.airbnbReviews || SITE.airbnb.reviews,
    contact: mainProp.airbnbContact || SITE.airbnb.contact,
    calendar: mainProp.airbnbCalendar || SITE.airbnb.calendar,
    houseRules: mainProp.airbnbRules || SITE.airbnb.houseRules,
    safety: mainProp.airbnbSafety || SITE.airbnb.safety,
    embedId: mainProp.airbnbEmbedId || SITE.airbnb.embedId,
  };

  const heroTitle = cfg.heroTitle && cfg.heroTitle !== 'Alójate en Bogotá' ? cfg.heroTitle : t.heroDefaultTitle;
  const heroAccent = cfg.heroAccent && cfg.heroAccent !== 'con estilo y confort' ? cfg.heroAccent : t.heroDefaultAccent;
  const heroSub = cfg.heroSub && !cfg.heroSub.startsWith('Apartamentos de corta') ? cfg.heroSub : t.heroDefaultSub;

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section id="hero" style={{
        minHeight:'100vh', position:'relative',
        display:'flex', alignItems:'center', overflow:'hidden',
      }}>
        {/* Backgrounds */}
        <div style={{
          position:'absolute', inset:0,
          background:'var(--navy-dark)',
        }}/>
        {/* Skyline de Bogotá sutil de fondo */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1531168556461-80ae73db214a?auto=format&fit=crop&q=80&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}/>
        {/* Silueta de Edificios Vectoriales (Blueprint) con detalles neón naranja */}
        <svg viewBox="0 0 1600 600" preserveAspectRatio="none" style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'52vh', opacity:0.35, pointerEvents:'none', zIndex:2 }}>
          <defs>
            <linearGradient id="skylineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(196,154,60,0.65)" />
              <stop offset="100%" stopColor="rgba(196,154,60,0.02)" />
            </linearGradient>
          </defs>
          
          {/* CAPA TRASERA: Edificios de fondo muy suaves */}
          <path d="M -50 600 L -50 350 L 100 250 L 250 400 L 350 200 L 500 450 L 600 150 L 750 350 L 880 180 L 1050 420 L 1150 220 L 1300 400 L 1450 250 L 1650 420 L 1650 600 Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            
          {/* CAPA MEDIA/FRONTAL: Edificios estructurales con líneas blancas */}
          <rect x="50" y="280" width="100" height="320" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.2" />
          <line x1="100" y1="180" x2="100" y2="280" stroke="url(#skylineGrad)" strokeWidth="1.2" />
          
          <rect x="190" y="360" width="130" height="240" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.2" />
          
          <path d="M 360 600 L 420 280 L 480 600" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.5" />
          
          <rect x="530" y="160" width="140" height="440" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.5" />
          <line x1="575" y1="160" x2="575" y2="600" stroke="url(#skylineGrad)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="625" y1="160" x2="625" y2="600" stroke="url(#skylineGrad)" strokeWidth="1" strokeDasharray="5,5" />

          {/* Torre principal naranja resplandeciente */}
          <rect x="720" y="80" width="150" height="520" fill="none" stroke="url(#accentGrad)" strokeWidth="2.5" />
          <line x1="757" y1="80" x2="757" y2="600" stroke="url(#accentGrad)" strokeWidth="1.5" strokeDasharray="10,6" />
          <line x1="795" y1="80" x2="795" y2="600" stroke="url(#accentGrad)" strokeWidth="2" strokeDasharray="10,6" />
          <line x1="832" y1="80" x2="832" y2="600" stroke="url(#accentGrad)" strokeWidth="1.5" strokeDasharray="10,6" />
          {/* Luces horizontales neón en la torre */}
          <line x1="720" y1="150" x2="870" y2="150" stroke="url(#accentGrad)" strokeWidth="1.5" />
          <line x1="720" y1="250" x2="870" y2="250" stroke="url(#accentGrad)" strokeWidth="1.5" />
          <line x1="720" y1="350" x2="870" y2="350" stroke="url(#accentGrad)" strokeWidth="1.5" />

          {/* Edificio 6 con cúpula y antena */}
          <path d="M 920 600 L 920 300 L 1000 220 L 1080 300 L 1080 600" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.5" />
          <circle cx="1000" cy="170" r="22" fill="none" stroke="url(#accentGrad)" strokeWidth="2" />
          <line x1="1000" y1="80" x2="1000" y2="148" stroke="url(#accentGrad)" strokeWidth="2.5" />

          {/* Edificio 7 de cristal en diagonal */}
          <path d="M 1130 600 L 1130 250 L 1250 140 L 1290 140 L 1290 600" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.5" />
          <line x1="1130" y1="350" x2="1290" y2="350" stroke="url(#skylineGrad)" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="1130" y1="450" x2="1290" y2="450" stroke="url(#skylineGrad)" strokeWidth="1" strokeDasharray="4,4" />

          {/* Torre secundaria naranja */}
          <rect x="1340" y="200" width="110" height="400" fill="none" stroke="url(#accentGrad)" strokeWidth="2" />
          <line x1="1395" y1="120" x2="1395" y2="200" stroke="url(#accentGrad)" strokeWidth="2" />

          {/* Edificio final */}
          <path d="M 1490 600 L 1550 320 L 1610 600" fill="none" stroke="url(#skylineGrad)" strokeWidth="1.5" />
        </svg>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize:'55px 55px',
        }}/>
        {/* Glowing orbs */}
        <div style={{ position:'absolute', width:700, height:700, top:-200, right:-200, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,124,0,0.1) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:500, height:500, bottom:-150, left:-100, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,109,181,0.2) 0%,transparent 65%)', pointerEvents:'none' }}/>

        <div className="s-inner hero-grid" style={{ position:'relative', zIndex:10, display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:'3rem', alignItems:'center', width:'100%', padding:'6rem 4rem 4rem' }}>
          <style>{`
            .hero-grid { margin-top: 4rem; }
            @media (max-width: 990px) {
              .hero-grid {
                grid-template-columns: 1fr !important;
                text-align: center;
                padding: 6rem 2rem 2rem !important;
              }
              .hero-grid > div:first-child { display: flex; flexDirection: column; alignItems: center; }
            }
          `}</style>
          
          {/* Left: Text content */}
          <div>
            <Tag>{t.heroTag}</Tag>
            <h1 style={{ fontSize:'clamp(2.4rem,5vw,3.8rem)', fontWeight:900, color:'white', letterSpacing:'-0.035em', lineHeight:1.06, marginBottom:'1.5rem' }}>
              {heroTitle}<br />
              <span style={{ color:'var(--orange)' }}>
                {heroAccent}
              </span>
            </h1>
            <p style={{ fontSize:'clamp(0.98rem,1.8vw,1.15rem)', color:'rgba(230,231,232,0.82)', lineHeight:1.75, marginBottom:'2.5rem', maxWidth:540 }}>
              {heroSub}
            </p>
            
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              {mainProp.isAirbnb ? (
                <BtnAirbnb href={ab.booking} id="hero-reserve-airbnb">{t.btnAirbnb}</BtnAirbnb>
              ) : (
                <BtnWA msg={lang === 'EN' ? `Hello! I'm interested in booking the apartment ${mainProp.name} 🏠` : `Hola! Me interesa reservar el apartamento ${mainProp.name} 🏠`} id="hero-reserve-wa">{t.btnWhatsapp}</BtnWA>
              )}
              <a href={waLink(lang === 'EN' ? 'Hello! I would like more information about Rentun Group apartments.' : 'Hola! Quisiera más información sobre los apartamentos de Rentun Group.')}
                 target="_blank" rel="noopener noreferrer" id="hero-whatsapp-btn"
                 style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'rgba(255,255,255,0.08)', color:'white', textDecoration:'none', padding:'0.9rem 1.8rem', borderRadius:50, fontWeight:700, fontSize:'0.88rem', border:'1px solid rgba(255,255,255,0.18)', transition:'all 0.2s' }}>
                {t.btnAvailability}
              </a>
            </div>
          </div>

          {/* Right: Images Carousel */}
          <div>
            <div style={{ height:520, borderRadius:24, overflow:'hidden', boxShadow:'var(--shadow-lg)', position:'relative' }}>
              <ImageSlider images={(cfg.heroImages && cfg.heroImages.length > 0) ? cfg.heroImages : mainProp.images} />
            </div>

            {/* Quick links below card */}
            {mainProp.isAirbnb && (
              <div style={{ display:'flex', gap:'0.8rem', marginTop:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
                {[
                  { label:'📅 Ver calendario', labelEn:'📅 View calendar', href: ab.calendar },
                  { label:'⭐ Reseñas', labelEn:'⭐ Reviews', href: ab.reviews },
                  { label:'📋 Reglas de la casa', labelEn:'📋 House rules', href: ab.houseRules },
                  { label:'🛡️ Seguridad', labelEn:'🛡️ Safety', href: ab.safety },
                ].map(l => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                     style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.65)', textDecoration:'none', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:50, padding:'0.3rem 0.9rem', fontWeight:600, transition:'all 0.2s' }}>
                    {lang === 'EN' ? l.labelEn : l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue" style={{ position:'absolute', bottom:'2.5rem', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem', color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', zIndex:10 }}>
          <span>Explorar</span>
          <div style={{ width:1, height:36, background:'linear-gradient(to bottom,rgba(255,255,255,0.35),transparent)' }}/>
        </div>
      </section>



      {/* ── STATS STRIP ─────────────────────────────── */}
      <div style={{ background:'var(--navy-dark)', borderBottom:'1px solid rgba(196,154,60,0.3)', padding:'2.2rem 4rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2rem' }}>
          {(cfg.stats || SITE.stats).map((s, i) => {
            const translateStatLabel = (label) => {
              if (!label) return '';
              const l = label.toLowerCase();
              if (l.includes('valoraci')) return t.statReviews;
              if (l.includes('apartamento')) return t.statApartments;
              if (l.includes('huésped') || l.includes('huesped')) return t.statGuests;
              if (l.includes('retorno')) return t.statReturn;
              return label;
            };
            return (
              <div key={i} className={`rv${i > 0 ? ` d${i}` : ''}`}
                   style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', position:'relative' }}>
                <div style={{ fontSize:'2.4rem', fontWeight:900, color:'var(--white)', lineHeight:1, letterSpacing:'-0.04em' }}>
                  {s.value}<span style={{ color:'var(--orange)' }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'0.25rem' }}>
                  {translateStatLabel(s.label)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PROPIEDADES ────────────────────────────────── */}
      <section id="propiedades" className="section-pad" style={{ background:'var(--bg)' }}>
        <div className="s-inner">
          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem', marginBottom:'3.5rem' }}>
            <div>
              <div className="rv"><Tag>{lang === 'EN' ? '🏠 Our properties' : '🏠 Nuestras propiedades'}</Tag></div>
              <h2 className="rv d1" style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.9rem' }}>
                {lang === 'EN' ? 'Available' : 'Alojamientos'} <span style={{ color:'var(--orange)' }}>{lang === 'EN' ? 'Accommodations' : 'disponibles'}</span>
              </h2>
              <p className="rv d2" style={{ fontSize:'0.98rem', color:'var(--text-muted)', lineHeight:1.72, maxWidth:550 }}>
                {t.propSub}
              </p>
            </div>
            <a href={waLink(lang === 'EN' ? 'Hello! I would like to check availability for Rentun Group apartments 🏠' : 'Hola! Me gustaría conocer disponibilidad de los apartamentos Rentun Group 🏠')}
               target="_blank" rel="noopener noreferrer" id="props-wa-btn" className="rv d3"
               style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'var(--orange)', color:'var(--text)', textDecoration:'none', padding:'0.8rem 1.8rem', borderRadius:8, fontWeight:800, fontSize:'0.88rem', boxShadow:'var(--shadow-md)', flexShrink:0, transition:'all 0.2s' }}>
              {t.btnAvailability}
            </a>
          </div>

          {properties.length === 1 ? (
            /* Single property card — full width */
            <div className="rv property-card" style={{ background:'white', borderRadius:16, overflow:'hidden', border:'none', boxShadow:'var(--shadow-md)', marginTop:'3rem' }}>
              {/* Image side - Airbnb Widget */}
              <div style={{ position:'relative', overflow:'hidden', minHeight:450, background:'#fafafa', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div className="airbnb-embed-frame"
                     data-id={mainProp.airbnbEmbedId || SITE.airbnb.embedId}
                     data-view="home"
                     data-hide-price="true"
                     style={{ width:'100%', height:'100%', margin:'auto', display:'block', border:'none', borderRadius:0, overflow:'hidden', background:'white' }}>
                  <a href={mainProp.airbnbListing || SITE.airbnb.listing}>{lang === 'EN' ? 'View on Airbnb' : 'Ver en Airbnb'}</a>
                  <a href={mainProp.airbnbListing || SITE.airbnb.listing} rel="nofollow">Vivienda rentada · Bogotá · ★5.0 · {mainProp.bedrooms} {t.propBedrooms} · {mainProp.beds} {t.propBeds} · {mainProp.baths} {t.propBaths}</a>
                </div>
                <span style={{ position:'absolute', top:'1rem', left:'1rem', background:'var(--orange)', color:'var(--text)', fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', padding:'0.28rem 0.8rem', borderRadius:50, boxShadow:'var(--shadow-sm)', zIndex: 2 }}>{lang === 'EN' ? '✨ Available' : '✨ Disponible'}</span>
                <span style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.96)', borderRadius:50, padding:'0.3rem 0.75rem', display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.75rem', fontWeight:800, color:'#1a2332', boxShadow:'0 2px 10px rgba(0,0,0,0.12)', zIndex: 2 }}>⭐ 5.0</span>
              </div>

              {/* Content side */}
              <div style={{ padding:'2.5rem 3rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div>
                  <h3 style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--text)', marginBottom:'0.3rem', letterSpacing:'-0.02em' }}>
                    {mainProp.name}
                  </h3>
                  <span style={{ display:'block', fontSize:'0.82rem', color:'var(--orange)', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1.5rem' }}>
                    📍 {mainProp.location}
                  </span>
                  
                  <p style={{ fontSize:'0.94rem', color:'var(--text-muted)', lineHeight:1.7, marginBottom:'2rem' }}>
                    {mainProp.description}
                  </p>

                  {/* Amenities & specs */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', borderTop:'1px solid #E6E7E8', borderBottom:'1px solid #E6E7E8', padding:'1.2rem 0', marginBottom:'2rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.88rem', fontWeight:600, color:'var(--text)' }}>
                      <span>🛏️</span>
                      <span>{mainProp.bedrooms} {lang === 'EN' ? (mainProp.bedrooms === 1 ? 'Bedroom' : 'Bedrooms') : (mainProp.bedrooms === 1 ? 'Habitación' : 'Habitaciones')}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.88rem', fontWeight:600, color:'var(--text)' }}>
                      <span>🛌</span>
                      <span>{mainProp.beds} {lang === 'EN' ? (mainProp.beds === 1 ? 'Bed' : 'Beds') : (mainProp.beds === 1 ? 'Cama' : 'Camas')}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.88rem', fontWeight:600, color:'var(--text)' }}>
                      <span>🚿</span>
                      <span>{mainProp.baths} {lang === 'EN' ? (mainProp.baths === 1 ? 'Bathroom' : 'Bathrooms') : (mainProp.baths === 1 ? 'Baño' : 'Baños')}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                    {/* 
                    <div>
                      <span style={{ display:'block', fontSize:'0.75rem', color:'var(--gray)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.15rem' }}>
                        {lang === 'EN' ? 'Estimated Rate' : 'Tarifa Estimada'}
                      </span>
                      <strong style={{ fontSize:'1.35rem', color:'var(--text)', fontWeight:950 }}>
                        {formatPrice(mainProp.price, currency)}
                      </strong>
                    </div>
                    */}
                    
                    <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                      {mainProp.isAirbnb ? (
                        <>
                          <a href={mainProp.airbnbBooking || SITE.airbnb.booking} target="_blank" rel="noopener noreferrer" id="props-reserve-btn"
                             style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'#FF385C', color:'white', textDecoration:'none', padding:'0.75rem 1.6rem', borderRadius:8, fontWeight:700, fontSize:'0.85rem', boxShadow:'var(--shadow-sm)', transition:'all 0.2s' }}>
                            {t.btnAirbnb}
                          </a>
                          <a href={waLink(lang === 'EN' ? `Hello! I'm interested in booking the apartment ${mainProp.name} 🏠` : `Hola! Me interesa reservar el apartamento ${mainProp.name} 🏠`)} target="_blank" rel="noopener noreferrer" id="props-whatsapp-btn"
                             style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'#25D366', color:'white', textDecoration:'none', padding:'0.75rem 1.6rem', borderRadius:8, fontWeight:700, fontSize:'0.85rem', boxShadow:'var(--shadow-sm)', transition:'all 0.2s' }}>
                            {lang === 'EN' ? '💬 Inquire direct' : '💬 Consultar directo'}
                          </a>
                        </>
                      ) : (
                        <a href={waLink(lang === 'EN' ? `Hello! I'm interested in booking the apartment ${mainProp.name} 🏠` : `Hola! Me interesa reservar el apartamento ${mainProp.name} 🏠`)} target="_blank" rel="noopener noreferrer" id="props-whatsapp-btn"
                           style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'#25D366', color:'white', textDecoration:'none', padding:'0.75rem 1.8rem', borderRadius:8, fontWeight:700, fontSize:'0.88rem', boxShadow:'var(--shadow-sm)', transition:'all 0.2s' }}>
                          {t.btnWhatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guide link button at bottom */}
                <div style={{ marginTop:'2.5rem', paddingTop:'1.2rem', borderTop:'1px solid #F1F2F4' }}>
                  <Link to={`/guia?prop=${mainProp.id}`}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'var(--navy-dark)', color:'white', textDecoration:'none', padding:'0.65rem', borderRadius:8, fontSize:'0.78rem', fontWeight:700, border:'none', transition:'all 0.2s' }}>
                    {lang === 'EN' ? '📖 View guest guide' : '📖 Ver guía del huésped'}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Properties Grid */
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'2rem', marginTop:'3rem' }}>
              {properties.map((p, idx) => (
                <div key={p.id} className={`rv d${idx + 1}`} style={{ background:'white', borderRadius:28, overflow:'hidden', border:'1px solid #E6E7E8', boxShadow:'0 10px 30px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column' }}>
                  {/* Image / Carousel part */}
                  <div style={{ height:240, overflow:'hidden', background:'#fafafa', position:'relative' }}>
                    <div style={{ height: '100%', position: 'relative' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', background:'#e2e8f0' }}>🏨</div>
                      )}
                    </div>
                    <span style={{ position:'absolute', top:'1rem', left:'1rem', background:'#F57C00', color:'white', fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', padding:'0.28rem 0.8rem', borderRadius:50, zIndex:2 }}>
                      {p.isAirbnb ? 'Airbnb' : t.propDirect}
                    </span>
                    <span style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.96)', borderRadius:50, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:800, color:'#1a2332', zIndex:2 }}>⭐ 5.0</span>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding:'1.8rem', flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', gap:'1.2rem' }}>
                    <div>
                      <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text)', margin:'0 0 0.4rem', letterSpacing:'-0.01em' }}>{p.name}</h3>
                      <p style={{ fontSize:'0.75rem', color:'var(--orange)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 0.8rem' }}>{p.location}</p>
                      <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:1.6, margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.description}</p>
                      
                      <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.2rem', fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:500 }}>
                        <span>🛏️ {p.bedrooms} {t.propBedrooms}</span>
                        <span>•</span>
                        <span>🛌 {p.beds} {t.propBeds}</span>
                        <span>•</span>
                        <span>🚿 {p.baths} {t.propBaths}</span>
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', borderTop:'1px solid #f1f2f4', paddingTop:'1rem' }}>
                      {/*
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.3rem' }}>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{lang === 'EN' ? 'Estimated rate:' : 'Tarifa estimada:'}</span>
                        <strong style={{ fontSize:'1rem', color:'var(--text)', fontWeight:800 }}>{formatPrice(p.price, currency)}</strong>
                      </div>
                      */}

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                        {p.isAirbnb ? (
                          <a href={p.airbnbListing} target="_blank" rel="noopener noreferrer"
                             style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'#FF385C', color:'white', textDecoration:'none', padding:'0.65rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, boxShadow:'0 4px 12px rgba(255,56,92,0.15)' }}>
                            🗓️ Airbnb
                          </a>
                        ) : (
                          <a href={waLink(lang === 'EN' ? `Hello! I'm interested in booking the apartment ${p.name} 🏠` : `Hola! Me interesa reservar el apartmento ${p.name} 🏠`)} target="_blank" rel="noopener noreferrer"
                             style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'#25D366', color:'white', textDecoration:'none', padding:'0.65rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, boxShadow:'0 4px 12px rgba(37,211,102,0.15)' }}>
                            💬 WhatsApp
                          </a>
                        )}
                        
                        {/*
                        <Link to={`/guia?prop=${p.id}`}
                              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'rgba(15,76,129,0.06)', color:'var(--navy)', textDecoration:'none', padding:'0.65rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, border:'1px solid rgba(15,76,129,0.14)' }}>
                          {t.propGuideLink}
                        </Link>
                        */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── POR QUÉ NOSOTROS ─────────────────────────── */}
      <section id="nosotros" className="section-pad" style={{ background:'white' }}>
        <div className="s-inner nosotros-grid" style={{ alignItems:'center' }}>
          {/* Visual */}
          <div className="rv" style={{ position:'relative', paddingBottom:'2.5rem', paddingRight:'2.5rem' }}>
            <div style={{ background:'linear-gradient(145deg,#0a3560,#0F4C81)', borderRadius:28, padding:'3.5rem 2.8rem 2.8rem', color:'white', position:'relative', overflow:'hidden', display:'flex', justifyContent:'center' }}>
              <div style={{ position:'absolute', top:-70, right:-70, width:220, height:220, borderRadius:'50%', background:'rgba(245,124,0,0.13)' }}/>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 1, position: 'relative' }}>
                <img 
                  src={cfg.hostImage || SITE.hostImage} 
                  alt={cfg.hostName || SITE.hostName} 
                  style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }} 
                />
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.15rem' }}>
                    {cfg.hostName || SITE.hostName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#FF9A2F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    {lang === 'EN' ? 'Superhost' : 'Anfitrión Superhost'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Title and text moved below blue box */}
            <div style={{ marginTop: '1.8rem', paddingLeft: '0.5rem', paddingRight: '2rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {lang === 'EN' ? 'Experience that makes the difference' : 'Experiencia que marca la diferencia'}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {lang === 'EN' ? 'At Rentun Group every detail matters. Our apartments are carefully selected, equipped, and verified so that your stay is perfect from the very first moment.' : 'En Rentun Group cada detalle importa. Nuestros apartamentos están cuidadosamente seleccionados, equipados y verificados para que tu estadía sea perfecta desde el primer momento.'}
              </p>
            </div>

            {/* Float badge */}
            <div style={{ position:'absolute', bottom:'7.5rem', right:0, background:'white', borderRadius:20, padding:'1.2rem 1.6rem', boxShadow:'0 20px 55px rgba(15,76,129,0.2)', display:'flex', alignItems:'center', gap:'1rem', border:'1px solid #E6E7E8', zIndex: 2 }}>
              <div style={{ width:48, height:48, background:'rgba(245,124,0,0.1)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>⭐</div>
              <div>
                <strong style={{ display:'block', fontSize:'1.3rem', fontWeight:900, color:'var(--navy)', lineHeight:1 }}>5.0 / 5.0</strong>
                <span style={{ fontSize:'0.68rem', color:'var(--gray)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>{lang === 'EN' ? 'Airbnb Rating' : 'Rating Airbnb'}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="rv"><Tag>{t.aboutTitle}</Tag></div>
            <h2 className="rv d1" style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'2rem', marginTop:'0.6rem' }}>
              {lang === 'EN' ? 'Your comfort,' : 'Tu comodidad,'}<br/>{lang === 'EN' ? 'our priority' : 'nuestra '} <span style={{ color:'var(--orange)' }}>{lang === 'EN' ? 'priority' : 'prioridad'}</span>
            </h2>
            {[
              { icon:'🛡️', bg:'rgba(15,76,129,0.09)', title: lang === 'EN' ? 'Verified on Airbnb ★5.0' : 'Verificados en Airbnb ★5.0', desc: lang === 'EN' ? 'All our accommodations are verified and meet the highest standards of cleaning and security for your absolute peace of mind.' : 'Todos nuestros alojamientos están verificados y cumplen los más altos estándares de limpieza y seguridad para tu total tranquilidad.' },
              { icon:'💬', bg:'rgba(245,124,0,0.09)', title: lang === 'EN' ? 'Personalized 24/7 Support' : 'Atención personalizada 24/7', desc: lang === 'EN' ? 'We are available on WhatsApp to answer any query before, during, and after your stay. Response in minutes.' : 'Estamos disponibles por WhatsApp para atender cualquier consulta antes, durante y después de tu estadía. Respuesta en minutos.' },
              { icon:'🔑', bg:'rgba(176,180,184,0.14)', title: lang === 'EN' ? 'Flexible & Hassle-Free Check-In' : 'Check-in flexible sin complicaciones', desc: lang === 'EN' ? 'We adapt to your arrival time. The entry process is simple and without waiting, so you feel right at home.' : 'Nos adaptamos a tu horario de llegada. El proceso de ingreso es simple y sin esperas, para que te sientas en casa.' },
              { icon:'📈', bg:'rgba(15,76,129,0.09)', title: lang === 'EN' ? 'Property Management & Investment' : 'Gestión e inversión inmobiliaria', desc: lang === 'EN' ? 'Do you own a property in Bogota? Join Rentun Group. We handle full management to maximize your ROI.' : '¿Tienes una propiedad en Bogotá? Únete a Rentun Group. Nos encargamos de la gestión completa para maximizar tu ROI.' },
            ].map((f, i) => (
              <div key={i} className={`rv d${i + 1}`} style={{ display:'flex', alignItems:'flex-start', gap:'1.2rem', marginBottom:'1.8rem' }}>
                <div style={{ width:54, height:54, flexShrink:0, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', background:f.bg }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text)', marginBottom:'0.3rem', letterSpacing:'-0.01em' }}>{f.title}</h4>
                  <p style={{ fontSize:'0.84rem', color:'var(--text-muted)', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────── */}
      <section id="como-funciona" className="section-pad" style={{ background:'var(--bg)' }}>
        <div className="s-inner">
          <div style={{ textAlign:'center', maxWidth:580, margin:'0 auto 3.5rem' }}>
            <div className="rv"><Tag dark>{lang === 'EN' ? '🔄 Simple process' : '🔄 Proceso simple'}</Tag></div>
            <h2 className="rv d1" style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.9rem', marginTop:'0.6rem' }}>
              {lang === 'EN' ? 'Book in ' : 'Reserva en '}<span style={{ color:'var(--orange)' }}>{lang === 'EN' ? 'a few steps' : 'pocos pasos'}</span>
            </h2>
            <p className="rv d2" style={{ fontSize:'0.98rem', color:'var(--text-muted)', lineHeight:1.72 }}>
              {lang === 'EN' ? 'Booking your stay with Rentun Group is fast, secure, and completely personalized.' : 'Hacer tu reserva con Rentun Group es rápido, seguro y completamente personalizado.'}
            </p>
          </div>
          <div className="steps-grid">
            {[
              { n:'1', e:'🔍', t: lang === 'EN' ? 'Explore properties' : 'Explora la propiedad', d: lang === 'EN' ? 'Check photos, amenities, and availability on Airbnb or contact us directly.' : 'Revisa las fotos, amenidades y disponibilidad en Airbnb o contáctanos directamente.' },
              { n:'2', e:'💬', t: lang === 'EN' ? 'Inquire via WhatsApp' : 'Consulta por WhatsApp', d: lang === 'EN' ? 'Message us with your dates and we will reply instantly with availability and rates.' : 'Escríbenos con tus fechas y te respondemos al instante con disponibilidad y detalles.' },
              { n:'3', e:'✅', t: lang === 'EN' ? 'Confirm your booking' : 'Confirma tu reserva', d: lang === 'EN' ? 'Book directly on Airbnb with full security and platform guarantees.' : 'Formaliza directamente en Airbnb con total seguridad y la garantía de la plataforma.' },
              { n:'4', e:'🏠', t: lang === 'EN' ? 'Enjoy your stay' : 'Disfruta tu estadía', d: lang === 'EN' ? 'Arrive, self check-in, and enjoy your premium lodging in Bogota.' : 'Llega, haz check-in y disfruta de un alojamiento premium en Bogotá.' },
            ].map((s, i) => (
              <div key={i} className={`rv d${i + 1}`} style={{ background:'white', borderRadius:22, padding:'2rem 1.5rem', border:'1px solid #E6E7E8', position:'relative', textAlign:'center' }}>
                <div style={{ width:38, height:38, background:'var(--orange)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', fontWeight:900, color:'var(--text)', boxShadow:'var(--shadow-sm)', margin:'0 auto 1.2rem' }}>{s.n}</div>
                <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>{s.e}</div>
                <h4 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text)', marginBottom:'0.5rem', letterSpacing:'-0.01em' }}>{s.t}</h4>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.62 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIFIED CTA & FOOTER ────────────────────────── */}
      <footer style={{ background:'#04111f', padding:'6rem 4rem 3rem', color:'rgba(255,255,255,0.5)', position:'relative', overflow:'hidden', borderTop:'4px solid var(--orange)' }}>
        {/* ── 4-COLUMN FOOTER CONTENT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'3rem', textAlign:'left', marginBottom:'3rem', position:'relative', zIndex:2 }}>
          
          {/* Column 1: Brand & Slogan */}
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

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
              {lang === 'EN' ? 'Explore' : 'Explora'}
            </h4>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <li>
                <a href="#propiedades" style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                   onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  {t.navProps}
                </a>
              </li>
              <li>
                <a href="#nosotros" style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                   onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  {t.navNosotros}
                </a>
              </li>
              {/*
              <li>
                <Link to="/guia" style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                      onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  {t.navGuia}
                </Link>
              </li>
              */}
            </ul>
          </div>

          {/* Column 3: Contact & Links */}
          <div>
            <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
              {lang === 'EN' ? 'Contact' : 'Contacto'}
            </h4>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <li>
                <a href={waLink('Hola Rentun Group!')} target="_blank" rel="noopener noreferrer"
                   style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                   onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  💬 {lang === 'EN' ? 'Official WhatsApp' : 'WhatsApp Oficial'}
                </a>
              </li>
              <li>
                <a href={`mailto:${cfg.email || SITE.email}`}
                   style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                   onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  ✉️ {lang === 'EN' ? 'Official Email' : 'Correo Oficial'}
                </a>
              </li>
              <li>
                <a href={ab.listing} target="_blank" rel="noopener noreferrer"
                   style={{ color:'rgba(255,255,255,0.48)', textDecoration:'none', fontSize:'0.82rem', fontWeight:500, transition:'color 0.2s' }}
                   onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.48)'}>
                  🏠 {lang === 'EN' ? 'Airbnb Profile' : 'Perfil de Airbnb'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & RNT */}
          <div>
            <h4 style={{ fontSize:'0.85rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.4rem', margin:0 }}>
              {lang === 'EN' ? 'Policies' : 'Normativas'}
            </h4>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <li>
                <Link to="/legal" style={{ color:'var(--orange)', textDecoration:'none', fontSize:'0.82rem', fontWeight:800, transition:'opacity 0.2s' }}
                      onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
                  {lang === 'EN' ? '📄 Legal Regulations →' : '📄 Normativas Legales →'}
                </Link>
              </li>
              <li style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', fontWeight:700 }}>
                RNT: {cfg.rntNumber || (lang === 'EN' ? 'In progress' : 'En trámite')}
              </li>
            </ul>
            <p style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', lineHeight:1.5, marginTop:'1rem', margin:0 }}>
              {lang === 'EN' ? 'Pursuant to Law 679 of 2001 (ESCNNA Prevention) and Law 1581 of 2012 (Habeas Data).' : 'Conforme a Ley 679 de 2001 (Prevención ESCNNA) y Ley 1581 de 2012 (Habeas Data).'}
            </p>
          </div>

        </div>

        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'2rem 0', position:'relative', zIndex:2 }}/>

        {/* Copyright & Developer Credits */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', position:'relative', zIndex:2 }}>
          <p style={{ margin:0 }}>{lang === 'EN' ? '© 2026 Rentun Group. All rights reserved. · Bogota, Colombia' : '© 2026 Rentun Group. Todos los derechos reservados. · Bogotá, Colombia'}</p>
          <p style={{ margin:0 }}>
            {lang === 'EN' ? 'Developed by ' : 'Desarrollado por '}<a href="https://www.jymtechsolutions.online/es" target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'underline' }}>J&M Tech Solutions</a>
          </p>
        </div>
      </footer>

      {/* Schema SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Rentun Group",
        "url": "https://rentungroup.com",
        "description": "Rentas · Gestión · Inversión. Apartamentos de corta estancia con servicio premium en Bogotá.",
        "creator": { "@type": "Organization", "name": "J&M Tech Solutions", "url": "https://www.jymtechsolutions.online/es" }
      })}} />
    </>
  );
}
