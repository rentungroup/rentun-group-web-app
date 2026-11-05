import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { waLink, getTranslation, formatPrice } from '../utils/db';
import { SITE } from '../config/site';
import Navbar from '../components/Navbar';
import { trackShareEvent, trackPageView } from '../utils/analytics';
import { handleRedirectWithLead } from '../components/LeadModal';
import {
  ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, ShieldCheck,
  Share2, Check, Copy, ExternalLink, Calendar, Heart,
  ChevronLeft, ChevronRight, X, Maximize2, Sparkles, MessageCircle
} from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config: cfg } = useConfig();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'ES');
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'COP');

  // Galería y Lightbox
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'rooms', 'living', 'kitchen'

  useEffect(() => {
    const handleConfigChange = () => {
      setLang(localStorage.getItem('app_lang') || 'ES');
      setCurrency(localStorage.getItem('app_currency') || 'COP');
    };
    window.addEventListener('config_changed', handleConfigChange);
    return () => window.removeEventListener('config_changed', handleConfigChange);
  }, []);

  // Buscar la propiedad por su ID
  const properties = cfg?.properties || [];
  const prop = properties.find(p => String(p.id) === String(id)) || properties[0];

  // Registrar visita a la página
  useEffect(() => {
    if (prop) {
      document.title = `${prop.name || 'Apartamento'} | Rentun Group`;
      trackPageView({ path: `/propiedad/${prop.id}`, propertyId: prop.id });
    }
  }, [prop?.id, prop?.name]);

  // Manejo de teclas para el Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, prop?.images?.length]);

  if (!cfg || !prop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B2035', color: 'white', fontFamily: 'Outfit,sans-serif' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Cargando apartamento...</p>
      </div>
    );
  }

  const t = getTranslation(lang);

  // Categorías de Fotos (Zonas y Espacios como en Portal Dorado)
  const getCategories = () => {
    if (prop.photoCategories && prop.photoCategories.length > 0) {
      return prop.photoCategories;
    }
    const imgs = (prop.images && prop.images.length > 0)
      ? prop.images
      : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=60&w=1200'];

    const defaultZones = [
      {
        title: '🏡 Fachada & Acceso Principal',
        desc: 'Vistas exteriores, recepción y acceso seguro a la propiedad',
        titles: ['Fachada Principal y Acceso', 'Recepción y Portería 24H', 'Entorno y Calles Aledañas']
      },
      {
        title: '🛋️ Sala & Espacios Sociales',
        desc: 'Ambientes confortables con iluminación natural y Smart TV',
        titles: ['Sala de Estar y Mobiliario', 'Comedor y Área Social', 'Zona de Descanso y TV']
      },
      {
        title: '🛏️ Habitaciones & Confort',
        desc: 'Camas confortables, lencería de alta calidad y descanso absoluto',
        titles: ['Habitación Principal King/Queen', 'Detalle de Lencería y Confort', 'Segunda Habitación / Espacio']
      },
      {
        title: '🍳 Cocina & Comedor',
        desc: 'Completamente equipada con electrodomésticos y utensilios',
        titles: ['Cocina Integral Equipada', 'Barra Americana y Electrodomésticos']
      },
      {
        title: '🚿 Baños & Amenidades',
        desc: 'Agua caliente continua, toallas y amenities de cortesía',
        titles: ['Baño Completo con Ducha', 'Lavamanos y Espejo Iluminado']
      }
    ];

    const cats = [];
    imgs.forEach((imgUrl, i) => {
      const zoneIdx = i % defaultZones.length;
      const zone = defaultZones[zoneIdx];
      let cat = cats.find(c => c.title === zone.title);
      if (!cat) {
        cat = {
          id: `cat-${zoneIdx}`,
          title: zone.title,
          description: zone.desc,
          photos: []
        };
        cats.push(cat);
      }
      const titleIndex = cat.photos.length;
      const photoTitle = zone.titles[titleIndex] || `${zone.title.split(' ')[1] || 'Espacio'} - Foto ${titleIndex + 1}`;
      cat.photos.push({
        id: `p-${i}`,
        title: photoTitle,
        url: imgUrl
      });
    });
    return cats;
  };

  const categories = getCategories();
  const allPhotos = categories.flatMap(c => (c.photos || []).map(p => ({ ...p, categoryTitle: c.title })));

  const nextPhoto = () => {
    setCurrentImgIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const prevPhoto = () => {
    setCurrentImgIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  // URL para compartir (con el ID del apartamento)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/propiedad/${prop.id}`
    : `https://rentungroup.com/propiedad/${prop.id}`;

  const shareTitle = `${prop.name} — Rentun Group Bogotá`;
  const shareText = lang === 'EN'
    ? `Take a look at this luxury apartment in Bogota: ${prop.name} ${shareUrl}`
    : `Mira este hermoso apartamento en Bogotá: ${prop.name} ${shareUrl}`;

  // Manejar el copiado de enlace
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      trackShareEvent({ propertyId: prop.id, propertyName: prop.name, platform: 'copy_link' });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Compartir en WhatsApp
  const handleShareWhatsApp = () => {
    trackShareEvent({ propertyId: prop.id, propertyName: prop.name, platform: 'whatsapp' });
    const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waShareUrl, '_blank', 'noopener,noreferrer');
  };

  // Compartir en Facebook
  const handleShareFacebook = () => {
    trackShareEvent({ propertyId: prop.id, propertyName: prop.name, platform: 'facebook' });
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Compartir en X (Twitter)
  const handleShareTwitter = () => {
    trackShareEvent({ propertyId: prop.id, propertyName: prop.name, platform: 'twitter' });
    const twShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🏨 ${prop.name} en Bogotá`)}`;
    window.open(twShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Compartir en Telegram
  const handleShareTelegram = () => {
    trackShareEvent({ propertyId: prop.id, propertyName: prop.name, platform: 'telegram' });
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(tgShareUrl, '_blank', 'noopener,noreferrer');
  };

  const waInquireMsg = lang === 'EN'
    ? `Hello! I would like to inquire about booking ${prop.name} (ID: ${prop.id})`
    : `¡Hola Rentun Group! Me interesa consultar disponibilidad y precios para reservar ${prop.name} (ID: ${prop.id})`;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body, "Outfit", sans-serif)' }}>
      <Navbar />

      {/* ── Toast de Copiado ──────────────────────────────── */}
      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F4C81',
          color: 'white',
          padding: '0.9rem 1.8rem',
          borderRadius: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <Check size={18} color="#25D366" strokeWidth={3} />
          <span>{lang === 'EN' ? 'Link with Apartment ID copied to clipboard!' : '¡Enlace con ID del apartamento copiado al portapapeles!'}</span>
        </div>
      )}

      {/* ── Subheader / Breadcrumb Bar ─────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #071e36 0%, #0F4C81 100%)',
        padding: '7.5rem 2rem 2.5rem',
        color: 'white',
        borderBottom: '4px solid var(--orange)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

          {/* Breadcrumb & Volver */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <Link to="/propiedades" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              padding: '0.45rem 1.1rem',
              borderRadius: 50,
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              <ArrowLeft size={16} />
              <span>{lang === 'EN' ? 'Back to all apartments' : 'Ver todos los apartamentos'}</span>
            </Link>

            {/* Badges superiores */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{
                background: prop.isAirbnb ? '#FF385C' : '#F57C00',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.35rem 0.9rem',
                borderRadius: 50
              }}>
                {prop.isAirbnb ? 'Airbnb Superhost' : (lang === 'EN' ? 'Direct Booking' : 'Reserva Directa')}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#1a2332',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 0.85rem',
                borderRadius: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span>5.0 Rating</span>
              </span>
              {(prop.rntNumber || (prop.name?.includes('Atlantis') ? '305919' : prop.name?.includes('Cabrera') ? '305927' : null)) && (
                <span style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 50,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  🏛️ RNT {prop.rntNumber || (prop.name?.includes('Atlantis') ? '305919' : '305927')}
                </span>
              )}
            </div>
          </div>

          {/* Título & Ubicación */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--orange)', marginBottom: '0.5rem' }}>
                ID: {prop.id} · Rentun Collection
              </div>
              <h1 style={{
                fontSize: 'clamp(1.9rem, 3.8vw, 2.9rem)',
                fontWeight: 900,
                letterSpacing: '-0.025em',
                margin: 0,
                fontFamily: 'var(--font-header, serif)',
                lineHeight: 1.15
              }}>
                {lang === 'EN' ? (prop.nameEn || prop.name) : prop.name}
              </h1>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.78)',
                margin: '0.6rem 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 500
              }}>
                <MapPin size={16} color="var(--orange)" />
                <span>{lang === 'EN' ? (prop.locationEn || prop.location) : prop.location}</span>
              </p>
            </div>

            {/* Precio */}
            {prop.price && (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.6rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  {lang === 'EN' ? 'Tariff from' : 'Tarifa desde'}
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--orange)' }}>
                  {formatPrice(prop.price, currency)}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Main Content Container ─────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '2.5rem 1.5rem 5rem', boxSizing: 'border-box' }}>

        {/* ── SECCIÓN 1 (ARRIBA): GRID PRINCIPAL CON TEXTO, DETALLES, ESPECIFICACIONES Y RESERVA ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '2.5rem', alignItems: 'start', marginBottom: '3.5rem' }} className="property-main-grid">
          "C:\Users\madfe\Downloads\https___www.rentungroup.com_-Performance-on-Search-2026-11-03.zip"
          "C:\Users\madfe\Downloads\https___www.rentungroup.com_-Performance-on-Search-Generative-AI-Features-2026-11-03.zip"
          "C:\Users\madfe\Downloads\https___www.rentungroup.com_-Coverage-Drilldown-2026-11-03.xlsx"
          <style>{`
            @media (max-width: 920px) {
              .property-main-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          {/* ── COLUMNA IZQUIERDA: INFORMACIÓN, AMENIDADES Y REGLAS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Tarjeta de Especificaciones Clave */}
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: '2rem',
              border: '1px solid #E6E7E8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.2rem' }}>
                {lang === 'EN' ? 'Apartment Specs' : 'Características Principales'}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem'
              }}>
                <div style={specCardStyle}>
                  <Users size={22} color="#0F4C81" />
                  <div>
                    <span style={specLabelStyle}>{lang === 'EN' ? 'Capacity' : 'Capacidad'}</span>
                    <strong style={specValueStyle}>{prop.guests || 2} {lang === 'EN' ? 'Guests' : 'Personas'}</strong>
                  </div>
                </div>

                <div style={specCardStyle}>
                  <Bed size={22} color="#0F4C81" />
                  <div>
                    <span style={specLabelStyle}>{lang === 'EN' ? 'Bedrooms' : 'Habitaciones'}</span>
                    <strong style={specValueStyle}>{prop.bedrooms || 1} {lang === 'EN' ? 'Room' : 'Habitación'}</strong>
                  </div>
                </div>

                <div style={specCardStyle}>
                  <Bed size={22} color="#0F4C81" />
                  <div>
                    <span style={specLabelStyle}>{lang === 'EN' ? 'Beds' : 'Camas'}</span>
                    <strong style={specValueStyle}>{prop.beds || 1} {lang === 'EN' ? 'Bed' : 'Cama'}</strong>
                  </div>
                </div>

                <div style={specCardStyle}>
                  <Bath size={22} color="#0F4C81" />
                  <div>
                    <span style={specLabelStyle}>{lang === 'EN' ? 'Bathrooms' : 'Baños'}</span>
                    <strong style={specValueStyle}>{prop.baths || 1} {lang === 'EN' ? 'Bath' : 'Baño'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: '2rem',
              border: '1px solid #E6E7E8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
                {lang === 'EN' ? 'About this place' : 'Acerca de este alojamiento'}
              </h3>
              <p style={{
                fontSize: '0.96rem',
                color: '#475569',
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: 'pre-line'
              }}>
                {lang === 'EN' ? (prop.descriptionEn || prop.description) : prop.description}
              </p>

              {prop.address && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 16,
                  border: '1px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem',
                  fontSize: '0.85rem',
                  color: '#334155'
                }}>
                  <MapPin size={20} color="#0F4C81" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>{lang === 'EN' ? 'Location Note:' : 'Nota de Ubicación:'}</strong> {prop.address}
                    {(prop.rntNumber || (prop.name?.includes('Atlantis') ? '305919' : prop.name?.includes('Cabrera') ? '305927' : null)) && (
                      <div style={{ marginTop: '0.4rem', color: '#0F4C81', fontWeight: 700, fontSize: '0.8rem' }}>
                        📄 {lang === 'EN' ? 'National Tourism Registry (RNT):' : 'Registro Nacional de Turismo (RNT):'} {prop.rntNumber || (prop.name?.includes('Atlantis') ? '305919' : '305927')} · {lang === 'EN' ? 'Approved & Verified' : 'Inscripción Vigente'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comodidades e Instalaciones */}
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: '2rem',
              border: '1px solid #E6E7E8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.2rem' }}>
                {lang === 'EN' ? 'What this place offers' : 'Lo que incluye este espacio'}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  { icon: '📶', name: lang === 'EN' ? 'High-Speed WiFi' : 'WiFi de Alta Velocidad' },
                  { icon: '💻', name: lang === 'EN' ? 'Dedicated Workspace' : 'Zona de Trabajo / Escritorio' },
                  { icon: '🍳', name: lang === 'EN' ? 'Fully Equipped Kitchen' : 'Cocina Equipada' },
                  { icon: '📺', name: lang === 'EN' ? 'Smart TV' : 'Smart TV HD' },
                  { icon: '🚿', name: lang === 'EN' ? 'Hot Water' : 'Agua Caliente Continua' },
                  { icon: '🔑', name: lang === 'EN' ? 'Self Check-in' : 'Check-in Autónomo' },
                  { icon: '☕', name: lang === 'EN' ? 'Coffee Maker & Utensils' : 'Cafetera y Menaje' },
                  { icon: '🛡️', name: lang === 'EN' ? '24/7 Security' : 'Seguridad / Portería' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 14,
                    border: '1px solid #f1f5f9',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#334155'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accesos Rápidos: Guía del Huésped & Póster */}
            <div style={{
              background: 'linear-gradient(135deg, #0A3560 0%, #0F4C81 100%)',
              borderRadius: 24,
              padding: '1.8rem 2rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.2rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--orange)' }}>
                  {lang === 'EN' ? 'Guest Essentials' : 'Servicios para el Huésped'}
                </span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.3rem 0 0' }}>
                  {lang === 'EN' ? 'Guest Guide & House Manual' : 'Guía de Estadía & Manual de la Casa'}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Link to={`/guia?prop=${prop.id}`} style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: 50,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span>📖 {lang === 'EN' ? 'View Guide' : 'Ver Guía'}</span>
                </Link>
                <Link to={`/imprimir/${prop.id}`} target="_blank" style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: 50,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span>🖨️ {lang === 'EN' ? 'Print Poster' : 'Póster QR'}</span>
                </Link>
              </div>
            </div>

          </div>

          {/* ── COLUMNA DERECHA: RESERVA DIRECTA & COMPARTIR EN REDES ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'sticky', top: '5.5rem' }}>

            {/* ── CAJA 1: MÓDULO DE RESERVA ── */}
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: '2rem',
              border: '1px solid #E6E7E8',
              boxShadow: '0 10px 35px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    {lang === 'EN' ? 'Direct Booking' : 'Reserva Directa'}
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                    {formatPrice(prop.price || '$280.000 COP', currency)}
                  </div>
                </div>
                <span style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.8rem',
                  borderRadius: 50,
                  border: '1px solid #A7F3D0'
                }}>
                  {lang === 'EN' ? 'Best Price' : 'Mejor Precio'}
                </span>
              </div>

              {/* Botones de Reserva */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                {/* Botón WhatsApp */}
                <a
                  href={waLink(prop.whatsappNumber || cfg.whatsapp || SITE.whatsapp, waInquireMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    const url = waLink(prop.whatsappNumber || cfg.whatsapp || SITE.whatsapp, waInquireMsg);
                    if (!localStorage.getItem('lead_registered')) {
                      e.preventDefault();
                      handleRedirectWithLead(url, 'whatsapp');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    background: '#25D366',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.95rem 1.5rem',
                    borderRadius: 14,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.92)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                >
                  <MessageCircle size={20} />
                  <span>{lang === 'EN' ? 'Book via WhatsApp' : 'Reservar por WhatsApp'}</span>
                </a>

                {/* Botón Airbnb si existe */}
                {prop.isAirbnb && (
                  <a
                    href={prop.airbnbBooking || prop.airbnbListing || SITE.airbnb.booking}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      const url = prop.airbnbBooking || prop.airbnbListing || SITE.airbnb.booking;
                      if (!localStorage.getItem('lead_registered')) {
                        e.preventDefault();
                        handleRedirectWithLead(url, 'airbnb');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      background: '#FF385C',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '0.85rem 1.5rem',
                      borderRadius: 14,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 15px rgba(255,56,92,0.25)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.92)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    <span>🗓️ {lang === 'EN' ? 'Book on Airbnb' : 'Reservar en Airbnb'}</span>
                  </a>
                )}

                {/* Botón Booking si existe */}
                {prop.bookingLink && (
                  <a
                    href={prop.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!localStorage.getItem('lead_registered')) {
                        e.preventDefault();
                        handleRedirectWithLead(prop.bookingLink, 'booking');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      background: '#003580',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '0.85rem 1.5rem',
                      borderRadius: 14,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 15px rgba(0,53,128,0.25)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    <span>🏨 {lang === 'EN' ? 'Book on Booking.com' : 'Reservar en Booking.com'}</span>
                  </a>
                )}
              </div>

              {/* Garantías */}
              <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span>{lang === 'EN' ? 'Guaranteed reservation with Rentun Group' : 'Reserva garantizada con Rentun Group'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--orange)" />
                  <span>{lang === 'EN' ? 'Superhost ★5.0 Quality Standard' : 'Estándar de Calidad Superhost ★5.0'}</span>
                </div>
              </div>
            </div>

            {/* ── CAJA 2: COMPARTIR EN REDES SOCIALES (CON ID) ── */}
            <div style={{
              background: 'white',
              borderRadius: 24,
              padding: '1.8rem',
              border: '1px solid #E6E7E8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <Share2 size={18} color="#0F4C81" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {lang === 'EN' ? 'Share this Apartment' : 'Compartir este Apartamento'}
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.2rem', lineHeight: 1.5 }}>
                {lang === 'EN'
                  ? 'Share the unique link and ID of this apartment on your favorite social networks:'
                  : 'Comparte el enlace con el ID único de este apartamento en tus redes sociales:'}
              </p>

              {/* Botones de Redes Sociales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>

                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  style={socialShareBtnStyle('#25D366')}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  style={socialShareBtnStyle('#1877F2')}
                >
                  <span>Facebook</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={handleShareTwitter}
                  style={socialShareBtnStyle('#0f172a')}
                >
                  <span>X (Twitter)</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  style={socialShareBtnStyle('#0088cc')}
                >
                  <span>Telegram</span>
                </button>
              </div>

              {/* Copiar Enlace Directo con ID */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.5rem', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.78rem',
                    color: '#475569',
                    outline: 'none',
                    fontFamily: 'inherit',
                    padding: '0.2rem 0.4rem'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#059669' : '#0F4C81',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? (lang === 'EN' ? 'Copied!' : '¡Copiado!') : (lang === 'EN' ? 'Copy Link' : 'Copiar')}</span>
                </button>
              </div>

              <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
                ID único: <strong>{prop.id}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* ── SECCIÓN 2 (ABAJO): GALERÍA CATEGORIZADA POR ZONAS (ESTILO PORTAL DORADO) ── */}
        <section style={{ marginTop: '1rem', marginBottom: '2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.2rem' }}>
                {lang === 'EN' ? 'Classified Photo Tour' : 'Recorrido Fotográfico Clasificado'}
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-header, serif)' }}>
                {lang === 'EN' ? 'Photo Gallery by Spaces' : 'Galería de Fotos por Zonas'}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '0.4rem 0.9rem', borderRadius: 50 }}>
                {categories.reduce((acc, cat) => acc + (cat.photos?.length || 0), 0)} {lang === 'EN' ? 'total photos' : 'fotos clasificadas'}
              </span>
            </div>
          </div>

          {/* Bloques de Categorías */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {categories.map((category, catIdx) => (
              <div key={category.id || catIdx} style={{
                background: 'white',
                borderRadius: 24,
                padding: '1.8rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}>

                {/* Encabezado de la Categoría */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: 18,
                  padding: '1rem 1.4rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#059669',
                    display: 'block',
                    marginBottom: '0.2rem'
                  }}>
                    {lang === 'EN' ? 'Property Category' : 'Categoría de la Propiedad'}
                  </span>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '0 0 0.25rem',
                    fontFamily: 'var(--font-header, serif)'
                  }}>
                    {category.title}
                  </h3>
                  {category.description && (
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Grid de Fotos de esta Categoría */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.2rem'
                }}>
                  {(category.photos || []).map((photo, photoIdx) => {
                    const globalIdx = allPhotos.findIndex(p => p.url === photo.url);
                    const openIndex = globalIdx >= 0 ? globalIdx : 0;
                    return (
                      <div
                        key={photo.id || photoIdx}
                        onClick={() => {
                          setCurrentImgIndex(openIndex);
                          setIsLightboxOpen(true);
                        }}
                        style={{
                          background: 'white',
                          borderRadius: 18,
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                      >
                        {/* Contenedor de la Imagen */}
                        <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#0f172a' }}>
                          <img
                            src={photo.url}
                            alt={photo.title || 'Foto de la propiedad'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 6,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <Maximize2 size={11} />
                            <span>{lang === 'EN' ? 'Zoom' : 'Ampliar'}</span>
                          </div>
                        </div>

                        {/* Pie de foto con título descriptivo */}
                        <div style={{
                          padding: '0.85rem 1rem',
                          background: '#F8FAFC',
                          borderTop: '1px solid #F1F5F9',
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <p style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            margin: 0,
                            lineHeight: 1.3
                          }}>
                            {photo.title || 'Foto de la propiedad'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </section>

      </main>

      {/* ── LIGHTBOX A PANTALLA COMPLETA ───────────────────── */}
      {isLightboxOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 12, 22, 0.96)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem'
        }}>
          {/* Top Bar Lightbox */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {allPhotos[currentImgIndex]?.categoryTitle || 'Espacio'}
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0' }}>
                {allPhotos[currentImgIndex]?.title || prop.name}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
                {lang === 'EN' ? 'Photo' : 'Foto'} {currentImgIndex + 1} {lang === 'EN' ? 'of' : 'de'} {allPhotos.length}
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Imagen Central con Flechas */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
            <img
              src={allPhotos[currentImgIndex]?.url || ''}
              alt={allPhotos[currentImgIndex]?.title || ''}
              style={{
                maxWidth: '90vw',
                maxHeight: '72vh',
                objectFit: 'contain',
                borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
              }}
            />

            {allPhotos.length > 1 && (
              <button
                onClick={prevPhoto}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {allPhotos.length > 1 && (
              <button
                onClick={nextPhoto}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>

          {/* Miniaturas Inferiores Lightbox */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', overflowX: 'auto', padding: '0.5rem 0' }}>
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                style={{
                  width: 70,
                  height: 50,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: currentImgIndex === idx ? '2.5px solid var(--orange)' : '2px solid transparent',
                  opacity: currentImgIndex === idx ? 1 : 0.45,
                  padding: 0,
                  cursor: 'pointer',
                  background: '#000',
                  flexShrink: 0
                }}
              >
                <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ background: '#04111f', padding: '4rem 2rem 2rem', color: 'rgba(255,255,255,0.5)', borderTop: '4px solid var(--orange)', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', fontSize: '0.82rem' }}>
          <p style={{ margin: '0 0 0.5rem', color: 'white', fontWeight: 700 }}>{prop.name} · Rentun Group</p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>&copy; {new Date().getFullYear()} Rentun Group. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

// Estilos Reusables de la Ficha
const specCardStyle = {
  background: '#F8FAFC',
  padding: '1rem',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  border: '1px solid #F1F5F9'
};

const specLabelStyle = {
  display: 'block',
  fontSize: '0.68rem',
  color: '#64748B',
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: '0.05em'
};

const specValueStyle = {
  display: 'block',
  fontSize: '0.92rem',
  color: '#0F172A',
  fontWeight: 800
};

const socialShareBtnStyle = (bgColor) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  background: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: '0.65rem 0.8rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
});
