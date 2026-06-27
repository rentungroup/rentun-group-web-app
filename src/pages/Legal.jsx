import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { SITE } from '../config/site';

export default function Legal() {
  const { config: cfg } = useConfig();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Outfit, sans-serif', color:'#0f172a', paddingBottom:'4rem' }}>
      
      {/* ── Navbar ── */}
      <div style={{ background:'linear-gradient(135deg,#071e36,#0F4C81)', padding:'1.2rem 2rem', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'4px solid #F57C00', boxShadow:'0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <img src="/logos/rentungroupwithe.webp" alt="Rentun Group" style={{ width:40, height:40, objectFit:'contain' }} />
          <div>
            <h1 style={{ fontSize:'1.1rem', fontWeight:900, margin:0 }}>Rentun Group</h1>
            <span style={{ fontSize:'0.7rem', color:'rgba(230,231,232,0.7)', fontWeight:600 }}>Bogotá, Colombia</span>
          </div>
        </div>
        <Link to="/"
          style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.18)', borderRadius:50, padding:'0.5rem 1.2rem', fontSize:'0.78rem', fontWeight:700, textDecoration:'none' }}>
          🏠 Volver al inicio
        </Link>
      </div>

      {/* ── Main Container ── */}
      <div style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1.5rem' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display:'inline-block', background:'rgba(245,124,0,0.1)', color:'#F57C00', fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', padding:'0.3rem 1rem', borderRadius:50, marginBottom:'0.8rem' }}>
            {cfg.legalTag || 'Normativa Vigente'}
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F4C81', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            {cfg.legalTitle || 'Términos Legales y Políticas'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#5c6d80', margin: 0 }}>
            {cfg.legalSubtitle || 'Cumplimiento normativo y compromiso con la legalidad en el sector turístico de Colombia.'}
          </p>
        </div>

        {/* Content sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card 1: ESCNNA */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #E6E7E8', padding: '2rem', boxShadow: '0 4px 20px rgba(15,76,129,0.04)' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', margin: '0 0 1rem' }}>
              <span>🚨</span> {cfg.legalEscnnaTitle || 'Advertencia de Protección a Menores (ESCNNA)'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, margin: 0, textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {cfg.legalEscnna || 'En Rentun Group rechazamos rotundamente cualquier tipo de abuso o explotación sexual de niños, niñas y adolescentes. Prohibimos el ingreso a nuestras instalaciones de personas que pretendan realizar conductas asociadas a la explotación sexual de menores. Advertimos a todos nuestros huéspedes y clientes que en desarrollo de lo dispuesto en el artículo 17 de la Ley 679 de 2001, la Ley 1098 de 2006 y la Ley 1336 de 2009, la explotación y el abuso sexual de niños, niñas y adolescentes en el territorio nacional son sancionados penal y administrativamente conforme a las leyes colombianas vigentes.'}
            </p>
          </div>

          {/* Card 2: Habeas Data */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #E6E7E8', padding: '2rem', boxShadow: '0 4px 20px rgba(15,76,129,0.04)' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', margin: '0 0 1rem' }}>
              <span>📂</span> {cfg.legalHabeasTitle || 'Protección de Datos Personales (Habeas Data)'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, margin: 0, textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {cfg.legalHabeasData || 'En cumplimiento de la Ley 1581 de 2012 (Ley General de Protección de Datos Personales) y el Decreto 1377 de 2013, informamos que los datos de carácter personal recolectados para efectos comerciales, consultas de disponibilidad, reservas o facturación, serán almacenados en nuestras bases de datos con absoluta confidencialidad y medidas de seguridad. Como titular de la información, tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales de nuestras bases de datos comunicándote directamente a través de nuestros canales de contacto oficiales.'}
            </p>
          </div>

          {/* Card 3: Flora y Fauna */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #E6E7E8', padding: '2rem', boxShadow: '0 4px 20px rgba(15,76,129,0.04)' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize: '1.15rem', fontWeight: 800, color: '#0F4C81', margin: '0 0 1rem' }}>
              <span>🌱</span> {cfg.legalFloraTitle || 'Conservación del Patrimonio Natural y Cultural'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, margin: 0, textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {cfg.legalFloraFauna || 'Rentun Group está firmemente comprometido con la preservación del patrimonio nacional de Colombia:\n\n• Protección de Fauna y Flora Silvestre: De conformidad con la Ley 17 de 1981 y la Ley 299 de 1996, rechazamos y promovemos la prevención del tráfico ilegal de especies silvestres de flora y fauna colombiana.\n\n• Protección de Bienes de Interés Cultural: En concordancia con la Ley 397 de 1997 (Ley General de Cultura) y sus decretos reglamentarios, prevenimos y rechazamos la comercialización, exportación o tráfico ilícito de bienes culturales e históricos nacionales.'}
            </p>
          </div>

          {/* Card 4: RNT Info */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,76,129,0.05), rgba(245,124,0,0.04))', borderRadius: 24, border: '1.5px dashed rgba(15,76,129,0.2)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F4C81', margin: '0 0 0.5rem' }}>
              Registro Nacional de Turismo (RNT)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.2rem' }}>
              En cumplimiento del Decreto Único Reglamentario del Sector Comercio, Industria y Turismo, nuestro establecimiento se encuentra debidamente registrado bajo la siguiente credencial:
            </p>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg,#F57C00,#FF9A2F)', color: 'white', fontWeight: 800, fontSize: '1rem', padding: '0.6rem 2rem', borderRadius: 50, boxShadow: '0 6px 18px rgba(245,124,0,0.25)' }}>
              RNT: {cfg.rntNumber || 'En trámite'}
            </span>
          </div>

        </div>

        {/* Footer info inside legal page */}
        <div style={{ marginTop: '4rem', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
          <p>© 2026 Rentun Group. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  );
}
