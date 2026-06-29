import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Wifi, AlertTriangle, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation, formatPrice } from '../utils/db';
import { SITE } from '../config/site';

export default function GuestGuide() {
  const { config: cfg } = useConfig();
  const loc = useLocation();
  const searchParams = new URLSearchParams(loc.search);
  const isPrivate = searchParams.get('access') === 'guest';
  const [tab, setTab] = useState('home');
  const [checks, setChecks] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedManual, setSelectedManual] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
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

  const t = getTranslation(lang);

  const TABS = [
    { id:'home',     label: lang === 'EN' ? '🏠 Home' : '🏠 Inicio' },
    { id:'manuals',  label: lang === 'EN' ? '📖 Manuals' : '📖 Manuales' },
    { id:'places',   label: lang === 'EN' ? '📍 Places' : '📍 Lugares' },
    { id:'checkout', label: lang === 'EN' ? '✅ Checkout' : '✅ Salida' },
    { id:'rules',    label: lang === 'EN' ? '📋 Rules' : '📋 Reglas' },
  ];

  const properties = cfg.properties || [];
  const propId = new URLSearchParams(window.location.search).get('prop');
  const activeProp = properties.find(p => p.id === propId) || properties[0] || {};

  const wifiSSID = activeProp.wifiSSID || 'RENTUN_WIFI';
  const wifiPassword = activeProp.wifiPassword || '(Consulta al hacer check-in)';
  const hostName = cfg.hostName || SITE.hostName;
  const hostBio = cfg.hostBio || SITE.hostBio;
  const hostImage = cfg.hostImage || SITE.hostImage;
  const address = activeProp.address || 'Bogotá, Colombia — Dirección exacta disponible al confirmar la reserva';
  const emergencies = cfg.emergencies || [];
  
  const rules = cfg.houseRules || [];
  const houseRulesText = cfg.houseRulesText || '';
  const manuals = cfg.manuals || [];
  const faqs = cfg.faqs || [];
  const checkoutTasks = cfg.checkoutTasks || [];
  const places = cfg.places || [];

  const waNum = cfg.whatsapp || SITE.whatsapp;
  const allDone = checkoutTasks.length > 0 && checkoutTasks.every(t => checks[t.id]);

  const copyWifi = () => {
    navigator.clipboard.writeText(wifiPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredPlaces = selectedCategory === 'all' 
    ? places
    : places.filter(p => p.category === selectedCategory);

  return (
    <div style={{ minHeight:'100vh', background:'#F3F5F8', fontFamily:'Outfit,sans-serif', color:'#0d1724' }}>
      
      <div className="guide-header" style={{ background:'linear-gradient(135deg,#071e36,#0F4C81)', padding:'1.2rem 2rem', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'4px solid #F57C00', boxShadow:'0 4px 15px rgba(0,0,0,0.1)' }}>
        <style>{`
          @media (max-width: 600px) {
            .guide-header { padding: 0.8rem 1rem !important; }
            .guide-title { font-size: 0.9rem !important; }
            .guide-subtitle { font-size: 0.62rem !important; }
            .guide-admin-btn { padding: 0.4rem 0.8rem !important; font-size: 0.68rem !important; }
          }
        `}</style>
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <img src="/logos/rentungroupwithe.webp" alt="Rentun Group" style={{ width:40, height:40, objectFit:'contain' }} />
          <div>
            <h1 className="guide-title" style={{ fontSize:'1.1rem', fontWeight:900, margin:0 }}>{cfg.propName || SITE.property.name}</h1>
            <span className="guide-subtitle" style={{ fontSize:'0.7rem', color:'rgba(230,231,232,0.7)', fontWeight:600 }}>{lang === 'EN' ? 'Stay Information' : 'Información de la Estadía'}</span>
          </div>
        </div>
        <Link to="/admin" className="guide-admin-btn"
          style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'0.5rem 1.1rem', fontSize:'0.75rem', fontWeight:700, textDecoration:'none' }}>
          {lang === 'EN' ? '⚙️ Admin Panel' : '⚙️ Panel Admin'}
        </Link>
      </div>

      <div style={{ background:'white', borderBottom:'1px solid #E6E7E8', display:'flex', overflowX:'auto', gap:'0.5rem', padding:'0.8rem 1rem', scrollbarWidth:'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding:'0.55rem 1.2rem', borderRadius:50, border:'none',
              background: tab === t.id ? 'linear-gradient(135deg,#0a3560,#0F4C81)' : 'transparent',
              color: tab === t.id ? 'white' : '#5c6d80',
              fontWeight: 700, fontSize:'0.8rem', cursor:'pointer',
              whiteSpace:'nowrap', transition:'all 0.2s',
              boxShadow: tab === t.id ? '0 4px 10px rgba(15,76,129,0.2)' : 'none'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'2rem 1.5rem 6rem' }}>

        {tab === 'home' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#0a3560,#0F4C81)', borderRadius:20, padding:'2rem', marginBottom:'1.5rem', color:'white', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(245,124,0,0.15)', pointerEvents:'none' }}/>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🏠</div>
              <h1 style={{ fontSize:'1.6rem', fontWeight:900, marginBottom:'0.5rem', letterSpacing:'-0.025em' }}>{lang === 'EN' ? 'Welcome to Bogota!' : '¡Bienvenido a Bogotá!'}</h1>
              <p style={{ color:'rgba(230,231,232,0.78)', fontSize:'0.9rem', lineHeight:1.7 }}>
                {lang === 'EN' ? 'We are happy to host you. Here you will find all the info you need to enjoy your stay.' : 'Estamos felices de recibirte. Aquí encontrarás toda la información que necesitas para disfrutar al máximo tu estadía.'}
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
              <div style={{ background:'white', borderRadius:16, padding:'1.2rem', border:'1px solid #E6E7E8', boxShadow:'0 2px 12px rgba(15,76,129,0.06)' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>📶</div>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', marginBottom:'0.4rem', margin:0 }}>{lang === 'EN' ? 'WiFi' : 'WiFi'}</h3>
                <p style={{ fontSize:'0.72rem', color:'#5c6d80', marginBottom:'0.5rem' }}>
                  <strong>{t.guideWifiSSID}:</strong> {wifiSSID}
                </p>
                <button onClick={copyWifi}
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'rgba(15,76,129,0.06)', border:'1px solid rgba(15,76,129,0.14)', borderRadius:50, padding:'0.3rem 0.8rem', fontSize:'0.7rem', fontWeight:700, color:'#0F4C81', cursor:'pointer', fontFamily:'inherit' }}>
                  {copied ? t.guideCopied : `📋 ${t.guideCopyBtn}`}
                </button>
              </div>

              <div style={{ background:'white', borderRadius:16, padding:'1.2rem', border:'1px solid #E6E7E8', boxShadow:'0 2px 12px rgba(15,76,129,0.06)' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>💬</div>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', marginBottom:'0.4rem', margin:0 }}>{t.guideHostTitle}</h3>
                <p style={{ fontSize:'0.72rem', color:'#5c6d80', marginBottom:'0.5rem' }}>{lang === 'EN' ? 'Any questions? Chat with us instantly.' : '¿Tienes alguna duda? Escríbenos al instante.'}</p>
                <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(lang === 'EN' ? 'Hello! I am your guest and I have a question 🏠' : 'Hola! Soy tu huésped y tengo una pregunta 🏠')}`}
                   target="_blank" rel="noopener noreferrer"
                   style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#25D366', color:'white', textDecoration:'none', borderRadius:50, padding:'0.3rem 0.8rem', fontSize:'0.7rem', fontWeight:700, width:'fit-content' }}>
                  💬 WhatsApp
                </a>
              </div>

              <div style={{ background:'white', borderRadius:16, padding:'1.2rem', border:'1px solid #E6E7E8', boxShadow:'0 2px 12px rgba(15,76,129,0.06)' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>⭐</div>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', marginBottom:'0.4rem', margin:0 }}>{t.statReviews}</h3>
                <p style={{ fontSize:'0.72rem', color:'#5c6d80', marginBottom:'0.5rem' }}>{lang === 'EN' ? 'Your feedback helps us improve!' : '¡Tu opinión nos ayuda a mejorar!'}</p>
                <a href={cfg.airbnbReviews || SITE.airbnb.reviews} target="_blank" rel="noopener noreferrer"
                   style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#FF385C', color:'white', textDecoration:'none', borderRadius:50, padding:'0.3rem 0.8rem', fontSize:'0.7rem', fontWeight:700, width:'fit-content' }}>
                  {lang === 'EN' ? 'Leave a review' : 'Dejar reseña'}
                </a>
              </div>

              <div style={{ background:'white', borderRadius:16, padding:'1.2rem', border:'1px solid #E6E7E8', boxShadow:'0 2px 12px rgba(15,76,129,0.06)', cursor:'pointer' }}
                   onClick={() => setTab('checkout')}>
                <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>✅</div>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', marginBottom:'0.4rem', margin:0 }}>{lang === 'EN' ? 'Checkout list' : 'Checklist salida'}</h3>
                <p style={{ fontSize:'0.72rem', color:'#5c6d80', margin:0 }}>{lang === 'EN' ? 'Before you leave, check the task list.' : 'Antes de irte, revisa la lista de tareas.'}</p>
              </div>
            </div>

            <div style={{ background:'rgba(245,124,0,0.06)', border:'1.5px solid rgba(245,124,0,0.2)', borderRadius:16, padding:'1.2rem', marginBottom:'1.5rem' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0d1724', marginBottom:'0.8rem', margin:0 }}>{t.guideEmergencyTitle}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                <p style={{ fontSize:'0.8rem', color:'#5c6d80', margin:0 }}>📍 <strong>{t.guideEmergencyAddress}:</strong> {address}</p>
                {emergencies.map(e => (
                  <p key={e.id} style={{ fontSize:'0.8rem', color:'#5c6d80', margin:0 }}>
                    <strong>{e.title}:</strong> {e.value}
                  </p>
                ))}
                <a href="tel:123" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#FF385C', color:'white', textDecoration:'none', borderRadius:50, padding:'0.4rem 1rem', fontSize:'0.75rem', fontWeight:700, width:'fit-content', marginTop:'0.4rem' }}>
                  {t.guideEmergencyBtn}
                </a>
              </div>
            </div>

            <div style={{ background:'white', borderRadius:20, border:'1px solid #E6E7E8', padding:'1.5rem', marginBottom:'2rem', display:'flex', gap:'1.2rem', flexWrap:'wrap', alignItems:'center' }}>
              <img src={hostImage} alt={hostName} style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid #E6E7E8' }} />
              <div style={{ flex:1, minWidth:250 }}>
                <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:'#0d1724', margin:'0 0 0.3rem' }}>{t.guideHostTitle}: {hostName}</h3>
                <p style={{ fontSize:'0.78rem', color:'#5c6d80', lineHeight:1.6, margin:0 }}>{hostBio}</p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#0d1724', marginBottom:'1rem', margin:0 }}>❓ {t.guideFaqTitle}</h3>
              {faqs.map(f => (
                <div key={f.id} style={{ background:'white', borderRadius:14, border:'1px solid #E6E7E8', marginBottom:'0.6rem', overflow:'hidden', marginTop:'0.6rem' }}>
                  <button onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.2rem', border:'none', background:'none', fontSize:'0.88rem', fontWeight:600, color:'#0d1724', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                    {f.question}
                    <span style={{ color:'#F57C00', fontSize:'1.1rem' }}>{openFaq === f.id ? '−' : '+'}</span>
                  </button>
                  {openFaq === f.id && (
                    <div style={{ padding:'0 1.2rem 1rem', fontSize:'0.84rem', color:'#5c6d80', lineHeight:1.65 }}>
                      {f.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'manuals' && (
          <div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0d1724', marginBottom:'1.2rem' }}>📖 {t.guideManualTitle}</h2>
            {selectedManual ? (
              <div>
                <button onClick={() => setSelectedManual(null)}
                  style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(15,76,129,0.06)', border:'1px solid rgba(15,76,129,0.14)', borderRadius:50, padding:'0.45rem 1rem', fontSize:'0.8rem', fontWeight:600, color:'#0F4C81', cursor:'pointer', fontFamily:'inherit', marginBottom:'1.5rem' }}>
                  {t.guideBackBtn || '← Volver'}
                </button>
                <div style={{ background:'white', borderRadius:20, border:'1px solid #E6E7E8', overflow:'hidden' }}>
                  {selectedManual.image && (
                    <img src={selectedManual.image} alt={selectedManual.title} style={{ width:'100%', height:220, objectFit:'cover' }} />
                  )}
                  <div style={{ padding:'1.5rem' }}>
                    <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'#0d1724', marginBottom:'1rem', margin:0 }}>{selectedManual.title}</h3>
                    <p style={{ fontSize:'0.9rem', color:'#5c6d80', lineHeight:1.75, whiteSpace:'pre-line', marginTop:'0.5rem' }}>{selectedManual.description}</p>
                    <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(lang === 'EN' ? `Hello! I have a question about the house manual: ${selectedManual.title}` : `Hola! Tengo una pregunta sobre el manual de: ${selectedManual.title}`)}`}
                       target="_blank" rel="noopener noreferrer"
                       style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem', background:'#25D366', color:'white', textDecoration:'none', padding:'0.7rem 1.5rem', borderRadius:50, fontSize:'0.85rem', fontWeight:700, marginTop:'1.5rem' }}>
                      💬 {lang === 'EN' ? 'Ask the host' : 'Preguntarle al anfitrión'}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {manuals.map(m => (
                  <div key={m.id} onClick={() => setSelectedManual(m)} style={{ background:'white', borderRadius:16, border:'1px solid #E6E7E8', display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', cursor:'pointer', boxShadow:'0 2px 12px rgba(15,76,129,0.06)' }}>
                    {m.image ? (
                      <img src={m.image} alt={m.title} style={{ width:80, height:60, objectFit:'cover', borderRadius:10, flexShrink:0 }} />
                    ) : (
                      <div style={{ width:80, height:60, borderRadius:10, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>📖</div>
                    )}
                    <div style={{ flex:1 }}>
                      <h4 style={{ fontSize:'0.92rem', fontWeight:700, color:'#0d1724', marginBottom:'0.25rem', margin:0 }}>{m.title}</h4>
                      <p style={{ fontSize:'0.78rem', color:'#5c6d80', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', margin:0 }}>{m.description}</p>
                    </div>
                    <span style={{ color:'#F57C00', fontSize:'1.2rem' }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'places' && (
          <div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0d1724', marginBottom:'0.5rem' }}>📍 {t.guidePlacesTitle}</h2>
            <p style={{ fontSize:'0.88rem', color:'#5c6d80', marginBottom:'1.5rem' }}>
              {lang === 'EN' ? 'Discover the best recommended spots near the apartment.' : 'Descubre los mejores sitios recomendados cerca del apartamento.'}
            </p>

            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
              {[
                { id: 'all', label: lang === 'EN' ? 'All' : 'Todos' },
                { id: 'shopping', label: lang === 'EN' ? '🛒 Shopping' : '🛒 Compras' },
                { id: 'food', label: lang === 'EN' ? '🍔 Food' : '🍔 Comida' },
                { id: 'tourism', label: lang === 'EN' ? '🏛️ Tourism' : '🏛️ Turismo' },
                { id: 'services', label: lang === 'EN' ? '🏥 Services' : '🏥 Servicios' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding:'0.45rem 1rem', borderRadius:50,
                    fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    background: selectedCategory === cat.id ? 'linear-gradient(135deg,#0a3560,#0F4C81)' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#5c6d80',
                    border: selectedCategory === cat.id ? 'none' : '1px solid #E6E7E8',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              {filteredPlaces.length === 0 ? (
                <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>{lang === 'EN' ? 'No places found in this category.' : 'No se encontraron lugares en esta categoría.'}</p>
              ) : (
                filteredPlaces.map(p => (
                  <div key={p.id} 
                       onClick={() => setSelectedPlace(p)}
                       style={{ background:'white', borderRadius:20, border:'1px solid #E6E7E8', display:'flex', overflow:'hidden', boxShadow:'0 2px 12px rgba(15,76,129,0.05)', minHeight:120, cursor:'pointer', transition:'all 0.2s' }}
                       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,76,129,0.08)'; }}
                       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,76,129,0.05)'; }}>
                    {p.image ? (
                      <img src={p.image} alt={p.title} style={{ width:120, objectFit:'cover', flexShrink:0 }} />
                    ) : (
                      <div style={{ width:120, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>📍</div>
                    )}
                    <div style={{ padding:'1.2rem', flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem' }}>
                          <span style={{ fontSize:'0.65rem', textTransform:'uppercase', fontWeight:800, color:'#F57C00', letterSpacing:'0.05em' }}>
                            {p.category === 'shopping' ? (lang === 'EN' ? 'Shopping' : 'Compras') : p.category === 'food' ? (lang === 'EN' ? 'Food' : 'Comida') : p.category === 'tourism' ? (lang === 'EN' ? 'Tourism' : 'Turismo') : (lang === 'EN' ? 'Services' : 'Servicios')}
                          </span>
                          {(p.distance || p.walkingTime) && (
                            <span style={{ fontSize:'0.68rem', color:'#B0B4B8' }}>• {p.distance} {p.walkingTime && `(${p.walkingTime})`}</span>
                          )}
                        </div>
                        <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:'#0d1724', margin:'0 0 0.3rem' }}>{p.title}</h3>
                        <p style={{ fontSize:'0.78rem', color:'#5c6d80', lineHeight:1.5, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.description}</p>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.8rem' }}>
                        {p.mapLink && (
                          <a href={p.mapLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                             style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', color:'#0F4C81', textDecoration:'none', fontSize:'0.75rem', fontWeight:700 }}>
                            {lang === 'EN' ? '🗺️ View GPS location →' : '🗺️ Ver ubicación en GPS →'}
                          </a>
                        )}
                        <span style={{ fontSize:'0.72rem', color:'#0F4C81', fontWeight:700 }}>{lang === 'EN' ? 'View more' : 'Ver más'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'checkout' && (
          <div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0d1724', marginBottom:'0.5rem' }}>✅ {t.guideCheckoutTitle}</h2>
            <p style={{ fontSize:'0.88rem', color:'#5c6d80', marginBottom:'1.5rem', lineHeight:1.65 }}>
              {t.guideCheckoutSub}
            </p>
            {allDone ? (
              <div style={{ background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', border:'1.5px solid #34d399', borderRadius:20, padding:'2rem', textAlign:'center', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎉</div>
                <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'#065f46', marginBottom:'0.5rem' }}>{t.guideCheckoutDoneTitle}</h3>
                <p style={{ fontSize:'0.88rem', color:'#047857', marginBottom:'1.2rem' }}>{t.guideCheckoutDoneDesc}</p>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
                  <a href={waLink(cfg.whatsapp, lang === 'EN' ? `Hello! I have completed the checkout checklist for the apartment "${activeProp.name || 'Apartamento'}". Thanks for everything! 🙌` : `Hola! Ya completé el checklist de salida del apartamento "${activeProp.name || 'Apartamento'}". ¡Muchas gracias por todo! 🙌`)}
                     target="_blank" rel="noopener noreferrer"
                     style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#25D366', color:'white', textDecoration:'none', padding:'0.8rem 1.8rem', borderRadius:50, fontWeight:700, fontSize:'0.9rem' }}>
                    {t.guideCheckoutBtn}
                  </a>
                  <a href="https://g.page/r/CdfJPwfVetufEBM/review"
                     target="_blank" rel="noopener noreferrer"
                     style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'#1a73e8', color:'white', padding:'0.8rem 1.8rem', borderRadius:50, textDecoration:'none', fontWeight:700, fontSize:'0.9rem', boxShadow:'0 4px 15px rgba(26,115,232,0.2)' }}>
                    ⭐ {lang === 'EN' ? 'Leave a Review' : 'Dejar Reseña'}
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'1.5rem' }}>
                {checkoutTasks.map(t => (
                  <div key={t.id} onClick={() => setChecks(p => ({ ...p, [t.id]: !p[t.id] }))}
                    style={{ borderRadius:14, border:`1.5px solid ${checks[t.id] ? '#34d399' : '#E6E7E8'}`, padding:'1rem 1.2rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', transition:'all 0.2s', background: checks[t.id] ? 'rgba(209,250,229,0.3)' : 'white' }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', border:`2px solid ${checks[t.id] ? '#10b981' : '#B0B4B8'}`, background: checks[t.id] ? '#10b981' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                      {checks[t.id] && <span style={{ color:'white', fontSize:'0.75rem', fontWeight:900 }}>✓</span>}
                    </div>
                    <p style={{ fontSize:'0.88rem', color: checks[t.id] ? '#065f46' : '#0d1724', fontWeight: checks[t.id] ? 600 : 400, textDecoration: checks[t.id] ? 'line-through' : 'none', margin:0 }}>
                      {t.task}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background:'rgba(245,124,0,0.06)', border:'1.5px solid rgba(245,124,0,0.2)', borderRadius:16, padding:'1.2rem' }}>
              <p style={{ fontSize:'0.82rem', color:'#92400e', margin:0 }}>⏰ <strong>{lang === 'EN' ? 'Standard check-out:' : 'Check-out estándar:'}</strong> {lang === 'EN' ? '12:00 PM. For late checkout, coordinate via WhatsApp in advance.' : '12:00 PM. Para salida tardía, coordina por WhatsApp con anticipación.'}</p>
            </div>
          </div>
        )}

        {tab === 'rules' && (
          <div>
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0d1724', marginBottom:'1.2rem' }}>📋 {t.guideRulesTitle}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'1.5rem' }}>
            {rules.map(r => (
                <div key={r.id} style={{ background:'white', borderRadius:14, border:'1px solid #E6E7E8', padding:'1rem 1.2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#0d1724' }}>{r.title}</span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:'0.35rem',
                    background: r.allowed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: r.allowed ? '#059669' : '#dc2626',
                    border: `1px solid ${r.allowed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    borderRadius:50, padding:'0.28rem 0.8rem', fontSize:'0.72rem', fontWeight:700,
                  }}>
                    {r.allowed ? `✓ ${t.guideRulesAllowed}` : `✗ ${t.guideRulesNotAllowed}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Texto libre de reglas adicionales */}
            {houseRulesText && (
              <div style={{ background:'white', borderRadius:16, border:'1px solid #E6E7E8', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 2px 12px rgba(15,76,129,0.04)' }}>
                <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:'#0d1724', marginBottom:'1rem', margin:'0 0 1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span>📝</span> {lang === 'EN' ? 'Additional House Rules' : 'Reglas Adicionales'}
                </h3>
                <p style={{ fontSize:'0.88rem', color:'#334155', lineHeight:1.75, margin:0, whiteSpace:'pre-line' }}>
                  {houseRulesText}
                </p>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
              <a href={cfg.airbnbRules || SITE.airbnb.houseRules} target="_blank" rel="noopener noreferrer"
                 style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'rgba(15,76,129,0.06)', border:'1px solid rgba(15,76,129,0.14)', color:'#0F4C81', textDecoration:'none', borderRadius:50, padding:'0.7rem', fontSize:'0.8rem', fontWeight:700 }}>
                📋 {lang === 'EN' ? 'Full rules on Airbnb' : 'Reglas completas en Airbnb'}
              </a>
              <a href={cfg.airbnbSafety || SITE.airbnb.safety} target="_blank" rel="noopener noreferrer"
                 style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'rgba(245,124,0,0.06)', border:'1px solid rgba(245,124,0,0.2)', color:'#F57C00', textDecoration:'none', borderRadius:50, padding:'0.7rem', fontSize:'0.8rem', fontWeight:700 }}>
                🛡️ {lang === 'EN' ? 'Safety on Airbnb' : 'Seguridad en Airbnb'}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Detalles de Lugar Recomendado ── */}
      {selectedPlace && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1.5rem'
        }} onClick={() => setSelectedPlace(null)}>
          <div style={{
            background:'white', borderRadius:24, overflow:'hidden', maxWidth:540, width:'100%',
            boxShadow:'0 20px 50px rgba(0,0,0,0.3)', animation:'modalFadeIn 0.3s ease',
            display:'flex', flexDirection:'column'
          }} onClick={e => e.stopPropagation()}>
            <style>{`
              @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            
            {/* Image */}
            <div style={{ position:'relative', height:240, background:'#e2e8f0' }}>
              {selectedPlace.image ? (
                <img src={selectedPlace.image} alt={selectedPlace.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem' }}>📍</div>
              )}
              <button onClick={() => setSelectedPlace(null)}
                style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontWeight:'bold', fontSize:'1.2rem', color:'#5c6d80', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                ✕
              </button>
            </div>

            {/* Info */}
            <div style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                  <span style={{ fontSize:'0.7rem', textTransform:'uppercase', fontWeight:800, color:'#F57C00', letterSpacing:'0.05em', background:'rgba(245,124,0,0.08)', padding:'0.2rem 0.6rem', borderRadius:50 }}>
                    {selectedPlace.category === 'shopping' ? (lang === 'EN' ? '🛒 Shopping' : '🛒 Compras') : selectedPlace.category === 'food' ? (lang === 'EN' ? '🍔 Food' : '🍔 Comida') : selectedPlace.category === 'tourism' ? (lang === 'EN' ? '🏛️ Tourism' : '🏛️ Turismo') : (lang === 'EN' ? '🏥 Services' : '🏥 Servicios')}
                  </span>
                  {(selectedPlace.distance || selectedPlace.walkingTime) && (
                    <span style={{ fontSize:'0.75rem', color:'#B0B4B8', fontWeight:600 }}>• {selectedPlace.distance} {selectedPlace.walkingTime && `(${selectedPlace.walkingTime})`}</span>
                  )}
                </div>
                <h2 style={{ fontSize:'1.3rem', fontWeight:900, color:'#0d1724', margin:0 }}>{selectedPlace.title}</h2>
                {selectedPlace.subtitle && <p style={{ fontSize:'0.85rem', color:'#B0B4B8', fontWeight:600, marginTop:'0.2rem', margin:0 }}>{selectedPlace.subtitle}</p>}
              </div>

              <div style={{ borderTop:'1px solid #E6E7E8', paddingTop:'1rem' }}>
                <p style={{ fontSize:'0.88rem', color:'#5c6d80', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>
                  {selectedPlace.description}
                </p>
              </div>

              <div style={{ display:'flex', gap:'0.8rem', marginTop:'1rem', borderTop:'1px solid #E6E7E8', paddingTop:'1.2rem' }}>
                {selectedPlace.mapLink && (
                  <a href={selectedPlace.mapLink} target="_blank" rel="noopener noreferrer"
                     style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', textDecoration:'none', padding:'0.8rem', borderRadius:50, fontSize:'0.82rem', fontWeight:700, boxShadow:'0 4px 14px rgba(15,76,129,0.2)' }}>
                    🗺️ {lang === 'EN' ? 'Open in Google Maps' : 'Abrir en Google Maps'}
                  </a>
                )}
                <button onClick={() => setSelectedPlace(null)}
                  style={{ padding:'0.8rem 1.5rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                  {lang === 'EN' ? 'Close' : 'Cerrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ── Floating WA button ── */}
      <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(lang === 'EN' ? 'Hello! I am your guest and I need help 🏠' : 'Hola! Soy tu huésped y necesito ayuda 🏠')}`}
         target="_blank" rel="noopener noreferrer"
         style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', width:56, height:56, background:'#25D366', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(37,211,102,0.45)', textDecoration:'none', fontSize:'1.6rem', zIndex:200 }}
         title={lang === 'EN' ? 'Contact host' : 'Contactar anfitrión'}>
        💬
      </a>
    </div>
  );
}
