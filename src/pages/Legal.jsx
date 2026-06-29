import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { SITE } from '../config/site';

export default function Legal() {
  const { config: cfg } = useConfig();
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const legalPages = (cfg.legalPages || []).filter(p => p.is_active !== false);

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
      <div style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display:'inline-block', background:'rgba(245,124,0,0.1)', color:'#F57C00', fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', padding:'0.3rem 1rem', borderRadius:50, marginBottom:'0.8rem' }}>
            {cfg.legalTag || 'Normativa Vigente'}
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F4C81', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            {cfg.legalTitle || 'Términos Legales y Políticas'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#5c6d80', margin: 0, lineHeight: 1.6 }}>
            {cfg.legalSubtitle || 'Cumplimiento normativo y compromiso con la legalidad en el sector turístico de Colombia.'}
          </p>
        </div>

        {/* Dynamic Legal Pages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {legalPages.map((page) => (
            <div key={page.id}
              style={{ background: 'white', borderRadius: 20, border: '1px solid #E6E7E8', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,76,129,0.04)' }}>
              
              {/* Accordion header */}
              <button
                onClick={() => setOpenId(openId === page.id ? null : page.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.4rem 2rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', textAlign: 'left'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{page.icon || '📄'}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F4C81' }}>{page.title}</span>
                </div>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: openId === page.id ? '#F57C00' : 'rgba(15,76,129,0.08)',
                  color: openId === page.id ? 'white' : '#0F4C81',
                  fontSize: '1rem', fontWeight: 800, flexShrink: 0, transition: 'all 0.2s'
                }}>
                  {openId === page.id ? '−' : '+'}
                </span>
              </button>

              {/* Accordion content */}
              {openId === page.id && (
                <div style={{ padding: '0 2rem 1.8rem', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.75, margin: '1.2rem 0 0', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                    {page.content || 'Contenido próximamente disponible.'}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* RNT Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,76,129,0.05), rgba(245,124,0,0.04))', borderRadius: 24, border: '1.5px dashed rgba(15,76,129,0.2)', padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
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
