import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, HelpCircle } from 'lucide-react';
import { supabase } from '../supabase';

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [destType, setDestType] = useState('whatsapp');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true); // default true for better conversion
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPrivacyTip, setShowPrivacyTip] = useState(false);

  useEffect(() => {
    const handleTrigger = (e) => {
      const { url, destinationType } = e.detail;
      setRedirectUrl(url);
      setDestType(destinationType || 'whatsapp');
      setIsOpen(true);
      setError('');
    };

    window.addEventListener('trigger_lead_capture', handleTrigger);
    return () => window.removeEventListener('trigger_lead_capture', handleTrigger);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Por favor, indícanos tu nombre.');
    if (!phone.trim()) return setError('Por favor, proporciona un teléfono o WhatsApp.');
    if (!consent) return setError('Es necesario autorizar el tratamiento de datos para continuar.');

    setSubmitting(true);
    setError('');

    try {
      // 1. Guardar en Supabase
      const { error: dbErr } = await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        destination: destType,
        consent: consent,
        notes: `Registrado desde modal interactivo antes de ir a ${destType}`
      });

      if (dbErr) {
        console.error('Error insertando lead en Supabase:', dbErr);
        // Continuamos de todas formas para no dañar la conversión del usuario
      }

      // 2. Marcar como registrado en la sesión
      localStorage.setItem('lead_registered', 'true');
      
      // 3. Cerrar y Redirigir
      setIsOpen(false);
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      
      // Limpiar campos
      setName('');
      setPhone('');
      setEmail('');
    } catch (err) {
      console.error('Submit lead error:', err);
      // Redirigir como contingencia
      localStorage.setItem('lead_registered', 'true');
      setIsOpen(false);
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Determinar el nombre descriptivo de la plataforma de destino
  const getDestName = () => {
    if (destType === 'airbnb') return 'Airbnb';
    if (destType === 'booking') return 'Booking.com';
    return 'WhatsApp';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 20, 32, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.5rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .lead-input:focus {
          border-color: #C49A3C !important;
          box-shadow: 0 0 0 3px rgba(196,154,60,0.15) !important;
          outline: none;
        }
      `}</style>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        padding: '2.2rem',
        position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#1a2530',
        fontFamily: 'var(--font-body, sans-serif)'
      }}>
        {/* Close Button */}
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'none',
            border: 'none',
            color: '#8c9ba5',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(196, 154, 60, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#C49A3C'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-header, sans-serif)',
            color: '#0F4C81',
            margin: '0 0 0.6rem'
          }}>
            🛎️ Tu Concierge de Rentun Group
          </h3>
          <p style={{
            fontSize: '0.88rem',
            color: '#5c6d80',
            lineHeight: 1.5,
            padding: '0 0.5rem',
            margin: 0
          }}>
            Antes de conectarte con <strong>{getDestName()}</strong>, indícanos cómo llamarte. Esto nos permite reservar tus fechas, garantizar la tarifa directa más competitiva y brindarte beneficios de hospedaje personalizados.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '0.8rem 1.2rem',
            color: '#b91c1c',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1.2rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F4C81', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre completo *</label>
            <input 
              type="text" 
              placeholder="Ej: Manuel Madrid"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="lead-input"
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                border: '1.5px solid #E6E7E8',
                borderRadius: '12px',
                fontSize: '0.92rem',
                background: 'white',
                color: '#1a2530',
                transition: 'all 0.2s'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F4C81', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp / Teléfono *</label>
              <input 
                type="tel" 
                placeholder="Ej: +57 321 951 1173"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="lead-input"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  border: '1.5px solid #E6E7E8',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  background: 'white',
                  color: '#1a2530',
                  transition: 'all 0.2s'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F4C81', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email (Opcional)</label>
              <input 
                type="email" 
                placeholder="Ej: juan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lead-input"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  border: '1.5px solid #E6E7E8',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  background: 'white',
                  color: '#1a2530',
                  transition: 'all 0.2s'
                }}
              />
            </div>
          </div>

          {/* Habeas Data Checkbox */}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#5c6d80', lineHeight: 1.45 }}>
              <input 
                type="checkbox" 
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#C49A3C' }}
              />
              <span>
                Acepto la política de confidencialidad y Habeas Data para recibir mi propuesta y beneficios exclusivos de estadía.
              </span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'flex-start', marginLeft: '1.5rem' }}>
              <HelpCircle size={14} style={{ color: '#C49A3C', cursor: 'pointer' }} onClick={() => setShowPrivacyTip(!showPrivacyTip)} />
              <span onClick={() => setShowPrivacyTip(!showPrivacyTip)} style={{ fontSize: '0.72rem', color: '#C49A3C', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>¿Por qué solicitamos esto?</span>
            </div>
            
            {showPrivacyTip && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.8rem',
                fontSize: '0.72rem',
                color: '#5c6d80',
                lineHeight: 1.4,
                marginTop: '0.3rem',
                marginLeft: '1.5rem'
              }}>
                Tus datos están protegidos por la Ley 1581 de 2012 (Habeas Data). Los usaremos única y exclusivamente para formalizar tu cotización, coordinar tu check-in y enviarte detalles de tu hospedaje. No compartimos tus datos con terceros.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'linear-gradient(135deg, #0F4C81, #0a3560)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '1rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginTop: '1rem',
              boxShadow: '0 8px 24px rgba(15, 76, 129, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (!submitting) e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { if (!submitting) e.target.style.transform = 'translateY(0)'; }}
          >
            {submitting ? 'Guardando registro...' : `✨ Conectar con mi Asesor y Continuar`}
            {!submitting && <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

// Helper global para interceptar redirecciones
export const handleRedirectWithLead = (url, destinationType) => {
  if (localStorage.getItem('lead_registered')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    const event = new CustomEvent('trigger_lead_capture', {
      detail: { url, destinationType }
    });
    window.dispatchEvent(event);
  }
};
