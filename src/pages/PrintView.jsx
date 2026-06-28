import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Wifi, Phone, MapPin, Eye } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { SITE } from '../config/site';

export default function PrintView() {
  const { id } = useParams();
  const { config: globalCfg } = useConfig();
  const [prop, setProp] = useState(null);

  useEffect(() => {
    if (!globalCfg) return;
    const active = (globalCfg.properties || []).find(p => p.id === id) || (globalCfg.properties || [])[0];
    setProp(active);
  }, [id, globalCfg]);

  if (!prop || !globalCfg) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <p style={{ color: '#5c6d80', fontWeight: 'bold' }}>Cargando póster de bienvenida...</p>
      </div>
    );
  }

  // Generar URLs para los códigos QR
  const wifiQRString = `WIFI:S:${prop.wifiSSID};T:WPA;P:${prop.wifiPassword};;`;
  const guideUrl = `${window.location.origin}/guia?prop=${prop.id}`;
  const whatsappUrl = `https://wa.me/${globalCfg.whatsapp || SITE.whatsapp}?text=${encodeURIComponent('Hola! Estoy en el apartamento y necesito asistencia.')}`;

  // URLs de los QRs auto-generados
  const autoWifiQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wifiQRString)}`;
  const autoGuideQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(guideUrl)}`;
  const autoWhatsappQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappUrl)}`;
  const autoReviewQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://g.page/r/CdfJPwfVetufEBM/review')}`;

  // Usar QR personalizado si existe, de lo contrario auto-generado
  const wifiQR = prop.customWifiQR || autoWifiQRUrl;
  const guideQR = prop.customGuideQR || autoGuideQRUrl;
  const whatsappQR = prop.customWhatsappQR || autoWhatsappQRUrl;
  const reviewQR = autoReviewQRUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F5F8', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }} className="print-card-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-card-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          .printable-poster {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            width: 100% !important;
            height: 100vh !important;
            max-width: none !important;
          }
        }
      `}</style>

      {/* Header controls — hidden on print */}
      <div className="no-print" style={{ width: '100%', maxWidth: 640, background: 'white', borderRadius: 20, border: '1px solid #E6E7E8', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: '#5c6d80', fontSize: '0.8rem', fontWeight: 700 }}>
          <ArrowLeft size={16} />
          Volver al Panel
        </Link>
        <button onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#0F4C81,#1a6db5)', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,76,129,0.25)', transition: 'transform 0.15s' }}>
          <Printer size={16} />
          Imprimir Póster
        </button>
      </div>

      {/* Printable Sheet (Letter/A4 proportional box) */}
      <div className="printable-poster" style={{
        width: 612, height: 792, background: 'white', border: '1px solid #E6E7E8', borderRadius: 24, boxShadow: '0 25px 60px rgba(15,76,129,0.08)',
        padding: '3rem 2.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', position: 'relative',
        backgroundImage: 'radial-gradient(rgba(15,76,129,0.08) 1.2px, transparent 1.2px)', backgroundSize: '24px 24px'
      }}>
        {/* Decorative Borders */}
        <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(15,76,129,0.12)', borderRadius: 18, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 22, border: '1.5px solid rgba(15,76,129,0.22)', borderRadius: 14, pointerEvents: 'none' }} />

        {/* Content wrapper */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginTop: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: 900, color: '#0d1724', textTransform: 'uppercase', marginBottom: '1.2rem' }}>BIENVENIDO A</span>
            <img src="/logos/rentungroupblue.webp" alt="Rentun Group Logo" style={{ width: 140, objectFit: 'contain', marginBottom: '1.2rem' }} />
            <div style={{ width: 50, height: 3, background: '#F57C00', margin: '0.4rem auto 1.2rem', borderRadius: 50 }} />
            <p style={{ fontSize: '0.75rem', color: '#5c6d80', maxWidth: 360, margin: '0 auto', lineHeight: 1.5, fontWeight: 500 }}>
              Escanea los códigos QR para conectarte a internet o acceder a la guía interactiva del apartamento (manuales, reglas y lugares recomendados).
            </p>
          </div>

          {/* QRs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', margin: '1.5rem 0' }}>
            
            {/* WiFi Block */}
            <div style={{ background: 'white', border: '1px solid #E6E7E8', borderRadius: 20, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(15,76,129,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F4C81', marginBottom: '0.6rem' }}>
                <Wifi size={18} />
              </div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d1724', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.8rem' }}>Conexión WiFi</h2>
              
              <div style={{ border: '1px solid #E6E7E8', padding: '0.4rem', borderRadius: 12, background: '#f8fafc', marginBottom: '0.8rem' }}>
                <img src={wifiQR} alt="WiFi QR" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }} />
              </div>

              <div style={{ fontSize: '0.65rem', color: '#5c6d80', textAlign: 'left', width: '100%', borderTop: '1px solid #f1f2f4', paddingTop: '0.6rem', boxSizing: 'border-box' }}>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><strong style={{ color: '#0d1724' }}>Red:</strong> {prop.wifiSSID}</div>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><strong style={{ color: '#0d1724' }}>Clave:</strong> {prop.wifiPassword}</div>
              </div>
            </div>

            {/* Guide Block */}
            <div style={{ background: 'white', border: '1px solid #E6E7E8', borderRadius: 20, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(15,76,129,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F4C81', marginBottom: '0.6rem' }}>
                <Eye size={18} />
              </div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d1724', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.8rem' }}>Guía Digital</h2>
              
              <div style={{ border: '1px solid #E6E7E8', padding: '0.4rem', borderRadius: 12, background: '#f8fafc', marginBottom: '0.8rem' }}>
                <img src={guideQR} alt="Guía QR" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }} />
              </div>

              <div style={{ fontSize: '0.65rem', color: '#5c6d80', textAlign: 'left', width: '100%', borderTop: '1px solid #f1f2f4', paddingTop: '0.6rem', boxSizing: 'border-box' }}>
                <div style={{ fontWeight: 800, color: '#0d1724', marginBottom: '0.1rem' }}>Escanea para ver:</div>
                <div>• Info de acceso</div>
                <div>• Sitios de interés</div>
              </div>
            </div>

            {/* Review Block */}
            <div style={{ background: 'white', border: '1px solid #E6E7E8', borderRadius: 20, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,124,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F57C00', marginBottom: '0.6rem', fontSize: '1.2rem' }}>
                ⭐
              </div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d1724', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.8rem' }}>Dejar Reseña</h2>
              
              <div style={{ border: '1px solid #E6E7E8', padding: '0.4rem', borderRadius: 12, background: '#f8fafc', marginBottom: '0.8rem' }}>
                <img src={reviewQR} alt="Review QR" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }} />
              </div>

              <div style={{ fontSize: '0.65rem', color: '#5c6d80', textAlign: 'left', width: '100%', borderTop: '1px solid #f1f2f4', paddingTop: '0.6rem', boxSizing: 'border-box' }}>
                <div style={{ fontWeight: 800, color: '#0d1724', marginBottom: '0.1rem' }}>¿Te gustó tu estadía?</div>
                <div>¡Déjanos 5 estrellas</div>
                <div>en Google Maps!</div>
              </div>
            </div>

          </div>

          {/* Contact and address info */}
          <div style={{ background: 'rgba(15,76,129,0.03)', border: '1px solid rgba(15,76,129,0.1)', borderRadius: 16, padding: '1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.75rem', color: '#5c6d80' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#0F4C81', flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong style={{ color: '#0d1724', display: 'block', marginBottom: '0.1rem' }}>Dirección física:</strong>
                <span>{prop.address}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: '#0F4C81', flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong style={{ color: '#0d1724', display: 'block', marginBottom: '0.1rem' }}>Contacto de Soporte (WhatsApp):</strong>
                <span>{globalCfg.hostName || SITE.hostName} (+{globalCfg.whatsapp || SITE.whatsapp})</span>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div style={{ borderTop: '1px solid #E6E7E8', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.6rem', fontWeight: 800, color: '#B0B4B8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F57C00' }} />
            <span>Rentun Group · Hospedaje Premium</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F57C00' }} />
          </div>

        </div>
      </div>
    </div>
  );
}
