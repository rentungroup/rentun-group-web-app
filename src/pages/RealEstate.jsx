import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation } from '../utils/db';
import { SITE } from '../config/site';

// Helper component for WhatsApp buttons
function BtnWA({ children, msg, style }) {
  const { config: cfg } = useConfig();
  const phone = cfg.whatsapp || SITE.whatsapp;
  return (
    <a 
      href={waLink(msg, phone)}
      target="_blank" 
      rel="noopener noreferrer" 
      style={style}
    >
      {children}
    </a>
  );
}

// Custom Tag Helper
function Tag({ children, dark = false }) {
  const text = typeof children === 'string' ? children.replace('✨', '').trim() : children;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      background: dark ? 'rgba(15,76,129,0.08)' : 'rgba(255,255,255,0.04)', 
      color: dark ? 'var(--navy-dark)' : 'white',
      border: dark ? '1px solid rgba(15,76,129,0.15)' : '1px solid rgba(255,255,255,0.12)', 
      borderRadius:50,
      padding:'0.4rem 1.2rem', fontSize:'0.75rem', fontWeight:700,
      textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.8rem',
    }}>
      {text}
    </span>
  );
}

export default function RealEstate() {
  const { config: cfg } = useConfig();
  const lang = localStorage.getItem('app_lang') || 'ES';
  const t = getTranslation(lang);
  const properties = cfg.properties || [];
  const ab = properties[0] || {};

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const scrollVideos = (direction) => {
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.offsetWidth;
      // Scroll by one slide width
      const scrollAmount = direction === 'left' ? -containerWidth * 0.75 : containerWidth * 0.75;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = lang === 'EN' 
      ? 'Rentun Group Real Estate | Premium Purchase, Sale & Investments' 
      : 'Rentun Group Inmobiliaria | Compra, Venta e Inversiones Premium';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', lang === 'EN'
        ? 'Professional national and international real estate consulting, vacation property management, and ROI optimization.'
        : 'Asesoría inmobiliaria nacional e internacional de alto nivel, gestión de propiedades vacacionales y optimización de retornos de inversión (ROI).');
    }
  }, [lang]);

  const heroTitle = lang === 'EN' ? (cfg.rePageTitleEn || cfg.rePageTitle) : cfg.rePageTitle;
  const heroSub = lang === 'EN' ? (cfg.rePageSubEn || cfg.rePageSub) : cfg.rePageSub;
  const pageDesc = lang === 'EN' ? (cfg.rePageDescriptionEn || cfg.rePageDescription) : cfg.rePageDescription;

  // Render specific direct video player or YouTube embed
  const renderVideoPlayer = (url) => {
    if (!url) return null;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (isYoutube) {
      // Get youtube ID
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else {
        videoId = url.split('v=')[1]?.split('&')[0];
      }
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}`} 
          title="Project Video" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ width:'100%', height:'100%', borderRadius:20 }}
        />
      );
    }

    return (
      <video controls playsInline style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:20, background:'#000' }}>
        <source src={url} type="video/mp4" />
        Tu navegador no soporta reproducción de video.
      </video>
    );
  };

  return (
    <>
      <Navbar />
      
      {/* ── HERO BANNER WITH VIDEO ────────────────────────────── */}
      <section style={{ 
        position: 'relative', 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'var(--navy-dark)', 
        color: 'white', 
        overflow: 'hidden',
        paddingTop: '6rem',
        paddingBottom: '4rem'
      }}>
        {/* Static Background Image with Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${cfg.rePageHeroImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          zIndex: 1
        }}/>

        {/* Overlay gradient */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, rgba(10,53,96,0.5) 0%, var(--navy-dark) 100%)', 
          zIndex: 2 
        }}/>

        <div className="s-inner re-hero-grid" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center', width: '100%', padding: '0 2rem' }}>
          <style>{`
            @media (max-width: 990px) {
              .re-hero-grid {
                grid-template-columns: 1fr !important;
                gap: 2.5rem !important;
                text-align: center !important;
                padding-top: 2rem !important;
                padding-bottom: 2rem !important;
              }
              .re-hero-text {
                align-items: center !important;
                text-align: center !important;
              }
            }
          `}</style>
          
          <div className="re-hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <Tag>{lang === 'EN' ? '🏢 Premium Real Estate' : '🏢 Inmobiliaria Premium'}</Tag>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
              fontWeight: 900, 
              letterSpacing: '-0.035em', 
              lineHeight: 1.15, 
              marginBottom: '1.2rem',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              textAlign: 'inherit'
            }}>
              {heroTitle}
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(1rem, 2vw, 1.15rem)', 
              color: 'rgba(255,255,255,0.85)', 
              maxWidth: 580, 
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              textAlign: 'inherit'
            }}>
              {heroSub}
            </p>

            <BtnWA 
              msg={lang === 'EN' ? 'Hello! I am looking for professional real estate advisory at a national or international level.' : 'Hola! Quisiera recibir asesoría inmobiliaria profesional a nivel nacional o internacional.'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, var(--orange), #FF9A2F)',
                color: 'var(--navy-dark)',
                fontWeight: 800,
                padding: '1.1rem 3rem',
                borderRadius: 50,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(196,154,60,0.38)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {lang === 'EN' ? 'Get Advisor Consultation' : 'Solicitar Asesoría Personalizada'}
            </BtnWA>
          </div>

          <div>
            {cfg.rePageWelcomeVideo ? (
              <div style={{ width: '100%', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    {renderVideoPlayer(cfg.rePageWelcomeVideo)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                paddingBottom: '56.25%',
                height: 0,
                backgroundImage: `url(${cfg.rePageHeroImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}/>
            )}
          </div>
        </div>
      </section>

      {/* ── INTRO / ORIENTATION ────────────────────────────── */}
      <section className="section-pad" style={{ background: '#F8FAFC' }}>
        <div className="s-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <Tag dark>{lang === 'EN' ? '🧭 Our Focus' : '🧭 Nuestro Enfoque'}</Tag>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              {lang === 'EN' ? 'Purchase, Sale & Holiday Rentals' : 'Compra, Venta y Rentas Vacacionales'}
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8, textJustify: 'inter-word', textAlign: 'justify' }}>
              {pageDesc}
            </p>
          </div>
          
          <div style={{ background: 'white', border: '1px solid #E6E7E8', padding: '2.5rem', borderRadius: 28, boxShadow: '0 15px 45px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '1rem' }}>
              {lang === 'EN' ? 'Why invest with Rentun Group?' : '¿Por qué invertir con Rentun Group?'}
            </h3>
            
            {[
              { icon: '💎', title: lang === 'EN' ? 'Premium Portfolios' : 'Portafolio de Alta Gama', desc: lang === 'EN' ? 'We select properties with high potential for vacation rentals at a national and international level.' : 'Propiedades seleccionadas para alquiler vacacional con alta valorización a nivel nacional e internacional.' },
              { icon: '📈', title: lang === 'EN' ? 'ROI Optimization' : 'Optimización de ROI', desc: lang === 'EN' ? 'Active administration and multiplatform integration to maximize returns.' : 'Administración activa y presencia multiplataforma para maximizar tus retornos.' },
              { icon: '🛡️', title: lang === 'EN' ? 'Legal & Financial Safety' : 'Seguridad Jurídica y Financiera', desc: lang === 'EN' ? 'Transparent processes, legal counseling, and strict host selection.' : 'Procesos transparentes, acompañamiento legal e intermediación garantizada.' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────── */}
      <section className="section-pad" style={{ background: 'white' }}>
        <div className="s-inner">
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 4rem' }}>
            <Tag dark>{lang === 'EN' ? '🛠️ What We Offer' : '🛠️ Lo que Ofrecemos'}</Tag>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: '0.5rem' }}>
              {lang === 'EN' ? 'Real Estate Advisory Pillars' : 'Pilares de Asesoría Inmobiliaria'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {(cfg.realEstateServices || []).map((s, idx) => {
              const iconMap = {
                Key: '🔑',
                TrendingUp: '📈',
                Briefcase: '💼',
                Home: '🏠',
                Shield: '🛡️',
                Users: '👥'
              };
              const displayIcon = iconMap[s.icon] || s.icon || '🏢';
              
              return (
                <div key={s.id || idx} style={{
                  background: '#F8FAFC',
                  border: '1px solid #E6E7E8',
                  borderRadius: 24,
                  padding: '3rem 2.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.015)'
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(15,76,129,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--navy-dark)' }}>
                    {displayIcon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.6rem' }}>
                      {lang === 'EN' ? (s.titleEn || s.title) : s.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, textAlign: 'justify' }}>
                      {lang === 'EN' ? (s.descriptionEn || s.description) : s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROJECT VIDEOS SECTION ──────────────────────────── */}
      {(cfg.rePageVideos || []).length > 0 && (
        <section className="section-pad" style={{ background: 'var(--navy-dark)', color: 'white' }}>
          <div className="s-inner">
            <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 4rem' }}>
              <Tag>{lang === 'EN' ? '🎬 Visual Tour' : '🎬 Recorrido Visual'}</Tag>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: '0.5rem' }}>
                {lang === 'EN' ? 'Projects & Property Videos' : 'Videos de Proyectos y Propiedades'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.8rem' }}>
                {lang === 'EN' ? 'Explore our actual properties and project explanations in high definition.' : 'Explora nuestras propiedades reales y explicaciones de proyectos en alta definición.'}
              </p>
            </div>

            {cfg.rePageVideos.length > 3 ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <style>{`
                  .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .video-slide-item {
                    flex: 0 0 calc(33.333% - 1.67rem) !important;
                  }
                  @media (max-width: 990px) {
                    .video-slide-item {
                      flex: 0 0 calc(50% - 1.25rem) !important;
                    }
                  }
                  @media (max-width: 600px) {
                    .video-slide-item {
                      flex: 0 0 100% !important;
                    }
                  }
                `}</style>
                
                {/* Carousel Left button */}
                <button 
                  onClick={() => scrollVideos('left')} 
                  style={{
                    position: 'absolute', left: '-1rem', top: '40%', transform: 'translateY(-50%)',
                    width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)', cursor: 'pointer', zIndex: 10,
                    color: 'var(--navy-dark)', transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'white'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  title={lang === 'EN' ? 'Previous' : 'Anterior'}
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Carousel Right button */}
                <button 
                  onClick={() => scrollVideos('right')} 
                  style={{
                    position: 'absolute', right: '-1rem', top: '40%', transform: 'translateY(-50%)',
                    width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)', cursor: 'pointer', zIndex: 10,
                    color: 'var(--navy-dark)', transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'white'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  title={lang === 'EN' ? 'Next' : 'Siguiente'}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Scroll container */}
                <div 
                  ref={containerRef}
                  className="hide-scrollbar"
                  style={{ 
                    display: 'flex', 
                    gap: '2.5rem', 
                    overflowX: 'auto', 
                    scrollBehavior: 'smooth', 
                    scrollSnapType: 'x mandatory', 
                    paddingBottom: '1.5rem',
                    width: '100%',
                    scrollbarWidth: 'none'
                  }}
                >
                  {cfg.rePageVideos.map((vid, idx) => (
                    <div key={idx} className="video-slide-item" style={{ scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: 20, boxShadow: '0 15px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0 }}>
                          {renderVideoPlayer(vid.url)}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: '0.5rem 0 0.2rem' }}>
                          {lang === 'EN' ? (vid.titleEn || vid.title) : vid.title}
                        </h3>
                        {(vid.description || vid.descriptionEn) && (
                          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0.4rem 0 0', textAlign: 'justify' }}>
                            {lang === 'EN' ? (vid.descriptionEn || vid.description) : vid.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                {cfg.rePageVideos.map((vid, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: 20, boxShadow: '0 15px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0 }}>
                        {renderVideoPlayer(vid.url)}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: '0.5rem 0 0.2rem' }}>
                        {lang === 'EN' ? (vid.titleEn || vid.title) : vid.title}
                      </h3>
                      {(vid.description || vid.descriptionEn) && (
                        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0.4rem 0 0', textAlign: 'justify' }}>
                          {lang === 'EN' ? (vid.descriptionEn || vid.description) : vid.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PHOTO GALLERY SECTION (PORTFOLIO CATALOG) ───────── */}
      {(cfg.rePageGallery || []).length > 0 && (() => {
        // Parse legacy strings to portfolio objects on-the-fly for complete backward compatibility
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

        return (
          <section className="section-pad" style={{ background: '#F8FAFC' }}>
            <div className="s-inner">
              <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 4rem' }}>
                <Tag dark>{lang === 'EN' ? '🏢 Portfolio' : '🏢 Portafolio'}</Tag>
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: '0.5rem' }}>
                  {lang === 'EN' ? 'Properties & Environments Portfolio' : 'Portafolio de Espacios & Propiedades'}
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#5c6d80', marginTop: '0.8rem' }}>
                  {lang === 'EN' ? 'Click on any property to see more photos, specifications, and complete details.' : 'Haz clic en cualquier propiedad para ver más fotos, especificaciones y detalles completos.'}
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2.5rem' 
              }}>
                {portfolioItems.map((p, idx) => (
                  <div 
                    key={p.id || idx} 
                    onClick={() => navigate(`/inmobiliaria/${p.id}`)}
                    style={{ 
                      borderRadius: 24, 
                      overflow: 'hidden', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                      border: '1px solid #E6E7E8',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div style={{ position: 'relative', height: 230, overflow: 'hidden', background: '#0d1724' }}>
                      <img 
                        src={p.images?.[0]} 
                        alt={p.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                      />
                      {p.price && (
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--navy-dark)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '0.35rem 0.9rem', borderRadius: 50, boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '1px solid rgba(196,154,60,0.3)', zIndex: 2 }}>
                          {p.price}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '1.2rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                          📍 {lang === 'EN' ? (p.locationEn || p.location) : p.location}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-dark)', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                          {lang === 'EN' ? (p.titleEn || p.title) : p.title}
                        </h3>
                        {p.specs && (
                          <p style={{ fontSize: '0.78rem', color: '#5c6d80', margin: 0, fontWeight: 600 }}>
                            {lang === 'EN' ? (p.specsEn || p.specs) : p.specs}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#0F4C81', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        {lang === 'EN' ? 'View details' : 'Ver detalles'} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── CALL TO ACTION SECTION ──────────────────────────── */}
      <section className="section-pad" style={{ 
        background: 'linear-gradient(to right, #0a3560, #0F4C81)', 
        color: 'white', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', width: 450, height: 450, bottom: -150, left: -100, borderRadius: '50%', background: 'rgba(245,124,0,0.08)', pointerEvents: 'none' }}/>
        
        <div className="s-inner" style={{ position: 'relative', zIndex: 10, maxWidth: 700 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.2rem' }}>
            {lang === 'EN' ? 'Want to start your real estate journey nationally or internationally?' : '¿Quieres iniciar tu camino inmobiliario a nivel nacional o internacional?'}
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            {lang === 'EN' ? 'Contact our advisory team directly on WhatsApp. We provide orientation and customized guidance.' : 'Ponte en contacto directo con nuestro equipo por WhatsApp. Brindamos orientación clara y sin compromisos.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <BtnWA 
              msg={lang === 'EN' ? 'Hello Rentun Group! I want to start my real estate investment/purchase process at a national or international level.' : 'Hola Rentun Group! Quiero iniciar mi proceso de inversión o compra inmobiliaria a nivel nacional o internacional.'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, var(--orange), #FF9A2F)',
                color: 'var(--navy-dark)',
                fontWeight: 800,
                padding: '1.1rem 2.8rem',
                borderRadius: 50,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(196,154,60,0.3)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              💬 WhatsApp
            </BtnWA>
            <a 
              href={`mailto:${cfg.email || SITE.email}?subject=${lang === 'EN' ? 'Real Estate Advisory Request' : 'Solicitud de Asesoría Inmobiliaria'}&body=Hola Rentun Group,%0A%0AQuisiera recibir asesoría sobre sus servicios inmobiliarios a nivel nacional e internacional.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 700,
                padding: '1.1rem 2.8rem',
                borderRadius: 50,
                fontSize: '1rem',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              ✉️ {lang === 'EN' ? 'Send Email' : 'Enviar Correo'}
            </a>
          </div>
        </div>
      </section>

      {/* ── UNIFIED CTA & FOOTER ────────────────────────── */}
      <Footer />
    </>
  );
}
