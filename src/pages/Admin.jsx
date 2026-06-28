import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, RotateCcw, AlertTriangle, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { saveConfig, resetConfig, DEFAULTS, uploadImage } from '../utils/db';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { SITE } from '../config/site';
import ImageUploader from '../components/ImageUploader';

// ── Section wrapper ─────────────────────────────────────
function AdminSection({ title, icon, children }) {
  return (
    <div style={{ background:'white', borderRadius:20, border:'1px solid #E6E7E8', overflow:'hidden', marginBottom:'1.5rem' }}>
      <div style={{ background:'linear-gradient(135deg,#0a3560,#0F4C81)', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.7rem' }}>
        <span style={{ fontSize:'1.2rem' }}>{icon}</span>
        <h3 style={{ color:'white', fontWeight:700, fontSize:'0.95rem', letterSpacing:'-0.01em', margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.2rem' }}>
        {children}
      </div>
    </div>
  );
}

// ── Input field ─────────────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', hint, multiline }) {
  const common = {
    width:'100%', padding:'0.7rem 1rem',
    border:'1.5px solid #E6E7E8', borderRadius:12,
    fontSize:'0.88rem', fontFamily:'Outfit,sans-serif',
    color:'#0d1724', outline:'none',
    transition:'border-color 0.2s',
  };
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
        {label}
      </label>
      {multiline
        ? <textarea name={name} value={value} onChange={onChange} rows={4} style={{ ...common, resize:'vertical' }} />
        : <input type={type} name={name} value={value} onChange={onChange} style={common} />
      }
      {hint && <p style={{ fontSize:'0.7rem', color:'#B0B4B8', marginTop:'0.3rem', margin:0 }}>{hint}</p>}
    </div>
  );
}

// ── Select field ────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, hint }) {
  const common = {
    width:'100%', padding:'0.7rem 1rem',
    border:'1.5px solid #E6E7E8', borderRadius:12,
    fontSize:'0.88rem', fontFamily:'Outfit,sans-serif',
    color:'#0d1724', outline:'none',
    background:'white',
    transition:'border-color 0.2s',
  };
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
        {label}
      </label>
      <select name={name} value={value} onChange={onChange} style={common}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && <p style={{ fontSize:'0.7rem', color:'#B0B4B8', marginTop:'0.3rem', margin:0 }}>{hint}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════════════════
export default function Admin() {
  const { config: dbConfig, reloadConfig } = useConfig();
  const { session, loading: authLoading } = useAuth();
  
  const [cfg, setCfg] = useState(dbConfig || {});
  const [saved, setSaved]   = useState(false);
  const [reset, setReset]   = useState(false);
  const [activeTab, setActiveTab] = useState('landing');

  const [heroImgUrl, setHeroImgUrl] = useState('');

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forms state for list items CRUD
  const [placeForm, setPlaceForm] = useState({ id:'', title:'', subtitle:'', description:'', image:'', distance:'', walkingTime:'', mapLink:'', category:'services' });
  const [isEditingPlace, setIsEditingPlace] = useState(false);

  const [ruleForm, setRuleForm] = useState({ id: '', title: '', allowed: false, isPublic: true });
  const [isEditingRule, setIsEditingRule] = useState(false);

  useEffect(() => {
    if (dbConfig && Object.keys(dbConfig).length > 0) {
      setCfg(dbConfig);
    }
  }, [dbConfig]);

  if (authLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Outfit,sans-serif' }}>Cargando administrador...</div>;
  }

  if (!session) {
    const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setLoginError('');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setLoginError(error.message);
      setIsLoggingIn(false);
    };

    return (
      <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#F3F5F8', fontFamily:'Outfit,sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background:'white', padding:'3rem', borderRadius:16, width:420, boxShadow:'0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h2 style={{ margin:0, color:'#0F4C81', fontSize:'1.6rem' }}>Acceso Administrador</h2>
            <p style={{ margin:'0.5rem 0 0', color:'#5c6d80', fontSize:'0.9rem' }}>Ingresa tus credenciales de Supabase</p>
          </div>
          {loginError && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'0.8rem', borderRadius:8, marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight:600 }}>{loginError}</div>}
          <Field label="Correo electrónico" name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <div style={{ marginTop:'1.2rem' }}>
            <Field label="Contraseña" name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
          </div>
          <button disabled={isLoggingIn} style={{ width:'100%', padding:'1rem', background:'linear-gradient(135deg,#F57C00,#FF9A2F)', color:'white', border:'none', borderRadius:12, marginTop:'2rem', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,124,0,0.3)' }}>
            {isLoggingIn ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    );
  }

  const [manualForm, setManualForm] = useState({ id:'', title:'', description:'', image:'' });
  const [isEditingManual, setIsEditingManual] = useState(false);

  const [faqForm, setFaqForm] = useState({ id:'', question:'', answer:'' });
  const [isEditingFaq, setIsEditingFaq] = useState(false);

  const [taskForm, setTaskForm] = useState({ id:'', task:'' });
  const [isEditingTask, setIsEditingTask] = useState(false);


  // Estados para CRUD de emergencias dinámicas
  const [emergencyForm, setEmergencyForm] = useState({ id: '', title: '', value: '' });
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);

  // Estados para acordeones de formularios de apartamentos
  const [openAirbnb, setOpenAirbnb] = useState(false);
  const [openQRs, setOpenQRs] = useState(false);

  // Estados para CRUD de propiedades (apartamentos)
  const [propForm, setPropForm] = useState({
    id: '', name: '', description: '', location: '', address: '', wifiSSID: '', wifiPassword: '', price: '',
    bedrooms: 1, beds: 1, baths: 1, isAirbnb: true,
    airbnbListing: '', airbnbBooking: '', airbnbReviews: '', airbnbContact: '', airbnbCalendar: '', airbnbRules: '', airbnbSafety: '', airbnbEmbedId: '',
    images: [], customWifiQR: '', customGuideQR: '', customWhatsappQR: ''
  });
  const [isEditingProp, setIsEditingProp] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState('');

  const properties = cfg.properties || [];

  useEffect(() => { 
    if (dbConfig) setCfg(dbConfig);
  }, [dbConfig]);

  const handle = (e) => {
    const { name, value } = e.target;
    setCfg(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async (customCfg = cfg) => {
    const success = await saveConfig(customCfg);
    if (success) {
      if (customCfg.fontPair) {
        localStorage.setItem('app_font_pair', customCfg.fontPair);
      }
      window.dispatchEvent(new Event('config_changed'));
      setCfg(customCfg);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      reloadConfig();
    } else {
      alert("Hubo un error al guardar.");
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restablecer todos los valores a los predeterminados?')) return;
    const defaults = await resetConfig();
    setCfg(defaults);
    setReset(true);
    setTimeout(() => setReset(false), 3000);
  };

  // ── Properties CRUD ──
  const saveProperty = (e) => {
    if (e) e.preventDefault();
    if (!propForm.name || !propForm.location || !propForm.description) {
      alert('Nombre, ubicación y descripción son obligatorios.');
      return;
    }
    let updatedProps;
    const currentProps = cfg.properties || [];
    if (isEditingProp) {
      updatedProps = currentProps.map(p => p.id === propForm.id ? { ...propForm } : p);
    } else {
      updatedProps = [...currentProps, { ...propForm, id: 'prop-' + Date.now() }];
    }
    const newCfg = { ...cfg, properties: updatedProps };
    handleSave(newCfg);
    clearPropForm();
  };

  const startEditProp = (p) => {
    setPropForm({
      ...p,
      images: p.images || [],
      customWifiQR: p.customWifiQR || '',
      customGuideQR: p.customGuideQR || '',
      customWhatsappQR: p.customWhatsappQR || ''
    });
    setIsEditingProp(true);
  };

  const deleteProperty = (id) => {
    if (properties.length <= 1) {
      alert('Debes tener al menos un apartamento registrado.');
      return;
    }
    if (!window.confirm('¿Eliminar este apartamento? Esto no se puede deshacer.')) return;
    const updated = (cfg.properties || []).filter(p => p.id !== id);
    const newCfg = { ...cfg, properties: updated };
    handleSave(newCfg);
  };

  const clearPropForm = () => {
    setPropForm({
      id: '', name: '', description: '', location: '', address: '', wifiSSID: '', wifiPassword: '', price: '',
      bedrooms: 1, beds: 1, baths: 1, isAirbnb: true,
      airbnbListing: '', airbnbBooking: '', airbnbReviews: '', airbnbContact: '', airbnbCalendar: '', airbnbRules: '', airbnbSafety: '', airbnbEmbedId: '',
      images: [], customWifiQR: '', customGuideQR: '', customWhatsappQR: ''
    });
    setIsEditingProp(false);
    setNewImgUrl('');
  };

  const addImgUrl = () => {
    if (!newImgUrl.trim()) return;
    setPropForm(prev => ({
      ...prev,
      images: [...(prev.images || []), newImgUrl.trim()]
    }));
    setNewImgUrl('');
  };

  const removeImg = (index) => {
    setPropForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index)
    }));
  };

  // ── Places CRUD ──
  const savePlace = (e) => {
    e.preventDefault();
    if (!placeForm.title || !placeForm.description) {
      alert('El título y descripción son obligatorios.');
      return;
    }
    let updatedPlaces;
    const currentPlaces = cfg.places || [];
    if (isEditingPlace) {
      updatedPlaces = currentPlaces.map(p => p.id === placeForm.id ? { ...placeForm } : p);
    } else {
      updatedPlaces = [...currentPlaces, { ...placeForm, id: Date.now() }];
    }
    const newCfg = { ...cfg, places: updatedPlaces };
    handleSave(newCfg);
    clearPlaceForm();
  };

  const startEditPlace = (place) => {
    setPlaceForm(place);
    setIsEditingPlace(true);
  };

  const deletePlace = (id) => {
    if (!window.confirm('¿Eliminar este lugar?')) return;
    const updated = (cfg.places || []).filter(p => p.id !== id);
    const newCfg = { ...cfg, places: updated };
    handleSave(newCfg);
  };

  const clearPlaceForm = () => {
    setPlaceForm({ id:'', title:'', subtitle:'', description:'', image:'', distance:'', walkingTime:'', mapLink:'', category:'services' });
    setIsEditingPlace(false);
  };

  // ── Manuals CRUD ──
  const saveManual = (e) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.description) {
      alert('El título y la descripción son obligatorios.');
      return;
    }
    let updatedManuals;
    const currentManuals = cfg.manuals || [];
    if (isEditingManual) {
      updatedManuals = currentManuals.map(m => m.id === manualForm.id ? { ...manualForm } : m);
    } else {
      updatedManuals = [...currentManuals, { ...manualForm, id: Date.now() }];
    }
    const newCfg = { ...cfg, manuals: updatedManuals };
    handleSave(newCfg);
    clearManualForm();
  };

  const startEditManual = (m) => {
    setManualForm(m);
    setIsEditingManual(true);
  };

  const deleteManual = (id) => {
    if (!window.confirm('¿Eliminar este manual?')) return;
    const updated = (cfg.manuals || []).filter(m => m.id !== id);
    const newCfg = { ...cfg, manuals: updated };
    handleSave(newCfg);
  };

  const clearManualForm = () => {
    setManualForm({ id:'', title:'', description:'', image:'' });
    setIsEditingManual(false);
  };

  // ── FAQs CRUD ──
  const saveFaq = (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) return;
    let updatedFaqs;
    const currentFaqs = cfg.faqs || [];
    if (isEditingFaq) {
      updatedFaqs = currentFaqs.map(f => f.id === faqForm.id ? { ...faqForm } : f);
    } else {
      updatedFaqs = [...currentFaqs, { ...faqForm, id: Date.now() }];
    }
    const newCfg = { ...cfg, faqs: updatedFaqs };
    handleSave(newCfg);
    clearFaqForm();
  };

  const startEditFaq = (f) => {
    setFaqForm(f);
    setIsEditingFaq(true);
  };

  const deleteFaq = (id) => {
    if (!window.confirm('¿Eliminar esta pregunta frecuente?')) return;
    const updated = (cfg.faqs || []).filter(f => f.id !== id);
    const newCfg = { ...cfg, faqs: updated };
    handleSave(newCfg);
  };

  const clearFaqForm = () => {
    setFaqForm({ id:'', question:'', answer:'' });
    setIsEditingFaq(false);
  };

  // ── Checkout Tasks CRUD ──
  const saveTask = (e) => {
    e.preventDefault();
    if (!taskForm.task) return;
    let updatedTasks;
    const currentTasks = cfg.checkoutTasks || [];
    if (isEditingTask) {
      updatedTasks = currentTasks.map(t => t.id === taskForm.id ? { ...taskForm } : t);
    } else {
      updatedTasks = [...currentTasks, { ...taskForm, id: Date.now() }];
    }
    const newCfg = { ...cfg, checkoutTasks: updatedTasks };
    handleSave(newCfg);
    clearTaskForm();
  };

  const startEditTask = (t) => {
    setTaskForm(t);
    setIsEditingTask(true);
  };

  const deleteTask = (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    const updated = (cfg.checkoutTasks || []).filter(t => t.id !== id);
    const newCfg = { ...cfg, checkoutTasks: updated };
    handleSave(newCfg);
  };

  const clearTaskForm = () => {
    setTaskForm({ id:'', task:'' });
    setIsEditingTask(false);
  };

  // ── Rules CRUD ──
  const saveRule = (e) => {
    if (e) e.preventDefault();
    if (!ruleForm.title) return;
    let updatedRules;
    const currentRules = cfg.houseRules || [];
    if (isEditingRule) {
      updatedRules = currentRules.map(r => r.id === ruleForm.id ? { ...ruleForm } : r);
    } else {
      updatedRules = [...currentRules, { ...ruleForm, id: 'rule-' + Date.now() }];
    }
    const newCfg = { ...cfg, houseRules: updatedRules };
    handleSave(newCfg);
    clearRuleForm();
  };

  const startEditRule = (r) => {
    setRuleForm(r);
    setIsEditingRule(true);
  };

  const deleteRule = (id) => {
    if (!window.confirm('¿Eliminar esta regla de la casa?')) return;
    const updated = (cfg.houseRules || []).filter(r => r.id !== id);
    const newCfg = { ...cfg, houseRules: updated };
    handleSave(newCfg);
  };

  const clearRuleForm = () => {
    setRuleForm({ id: '', title: '', allowed: false });
    setIsEditingRule(false);
  };

  // ── Emergencies CRUD ──
  const saveEmergency = (e) => {
    if (e) e.preventDefault();
    if (!emergencyForm.title || !emergencyForm.value) return;
    let updatedEmergencies;
    const currentEmergencies = cfg.emergencies || [];
    if (isEditingEmergency) {
      updatedEmergencies = currentEmergencies.map(em => em.id === emergencyForm.id ? { ...emergencyForm } : em);
    } else {
      updatedEmergencies = [...currentEmergencies, { ...emergencyForm, id: 'emergency-' + Date.now() }];
    }
    const newCfg = { ...cfg, emergencies: updatedEmergencies };
    handleSave(newCfg);
    clearEmergencyForm();
  };

  const startEditEmergency = (em) => {
    setEmergencyForm(em);
    setIsEditingEmergency(true);
  };

  const deleteEmergency = (id) => {
    if (!window.confirm('¿Eliminar este contacto de emergencia?')) return;
    const updated = (cfg.emergencies || []).filter(em => em.id !== id);
    const newCfg = { ...cfg, emergencies: updated };
    handleSave(newCfg);
  };

  const clearEmergencyForm = () => {
    setEmergencyForm({ id: '', title: '', value: '' });
    setIsEditingEmergency(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F3F5F8', fontFamily:'Outfit,sans-serif' }}>

      {/* ── Header ── */}
      <div className="admin-header" style={{ background:'linear-gradient(135deg,#071e36,#0F4C81)', padding:'1.5rem 3rem', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
        <style>{`
          @media (max-width: 1050px) {
            .admin-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 1.2rem !important;
              padding: 1.2rem 1.5rem !important;
            }
            .admin-actions {
              width: 100% !important;
              justify-content: flex-start !important;
              flex-wrap: wrap !important;
            }
          }
        `}</style>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <img
            src="/logos/rentungroupwithe.webp"
            alt="Rentun Group Logo"
            style={{
              width: 44,
              height: 44,
              objectFit: 'contain'
            }}
          />
          <div>
            <span style={{ display:'block', color:'white', fontWeight:800, fontSize:'1.1rem' }}>Rentun Group — Panel Admin</span>
            <span style={{ color:'rgba(230,231,232,0.65)', fontSize:'0.72rem', fontWeight:500 }}>
              Edita el contenido del sitio · Los cambios se guardan localmente
            </span>
          </div>
        </div>
        <div className="admin-actions" style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
          <Link to="/" target="_blank"
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.1)', color:'white', textDecoration:'none', padding:'0.55rem 1.2rem', borderRadius:50, fontSize:'0.82rem', fontWeight:600, border:'1px solid rgba(255,255,255,0.2)' }}>
            👁️ Vista previa de Inicio
          </Link>
          <Link to="/guia" target="_blank"
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.1)', color:'white', textDecoration:'none', padding:'0.55rem 1.2rem', borderRadius:50, fontSize:'0.82rem', fontWeight:600, border:'1px solid rgba(255,255,255,0.2)' }}>
            📖 Vista previa de Guía
          </Link>
          <button onClick={handleReset}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,56,92,0.15)', color:'#FF8099', border:'1px solid rgba(255,56,92,0.3)', padding:'0.55rem 1.2rem', borderRadius:50, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            🔄 Restablecer
          </button>
          <button onClick={() => handleSave()}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'linear-gradient(135deg,#F57C00,#FF9A2F)', color:'white', border:'none', padding:'0.55rem 1.4rem', borderRadius:50, fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(245,124,0,0.4)' }}>
            {saved ? '✅ Guardado!' : '💾 Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {saved && (
        <div style={{ background:'#d1fae5', color:'#065f46', padding:'0.9rem 3rem', fontSize:'0.85rem', fontWeight:600, borderBottom:'1px solid #a7f3d0', textAlign:'center' }}>
          ✅ Cambios guardados correctamente. Actualiza el sitio para ver los cambios reflejados.
        </div>
      )}
      {reset && (
        <div style={{ background:'#fef3c7', color:'#92400e', padding:'0.9rem 3rem', fontSize:'0.85rem', fontWeight:600, borderBottom:'1px solid #fde68a', textAlign:'center' }}>
          🔄 Valores restablecidos a los predeterminados.
        </div>
      )}

      {/* ── Info banner Supabase ── */}
      <div style={{ background:'rgba(15,76,129,0.06)', borderBottom:'1px solid rgba(15,76,129,0.1)', padding:'0.8rem 3rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.78rem', color:'#0F4C81', fontWeight:600 }}>
        ℹ️ <span>Los cambios se guardan en el navegador. <strong>Pendiente conectar a Supabase</strong> para persistencia en la nube — esperar credenciales del proyecto.</span>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{ display:'flex', justifyContent:'center', gap:'1rem', margin:'2rem 0 0.5rem', flexWrap:'wrap', padding:'0 2rem' }}>
        {[
          { id: 'landing', label: '🏠 Inicio' },
          { id: 'properties', label: '🏨 Apartamentos' },
          { id: 'guide-info', label: '📋 Info & Reglas' },
          { id: 'guide-places', label: '📍 Lugares Cercanos' },
          { id: 'guide-manuals', label: '📖 Manuales de la Casa' },
          { id: 'guide-faqs', label: '❓ FAQs & Tareas' },
          { id: 'legal', label: '⚖️ Pág. Legal' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding:'0.65rem 1.6rem', borderRadius:50,
              fontSize:'0.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              background: activeTab === t.id ? 'linear-gradient(135deg,#0a3560,#0F4C81)' : 'white',
              color: activeTab === t.id ? 'white' : '#5c6d80',
              boxShadow: activeTab === t.id ? '0 6px 18px rgba(15,76,129,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
              border: activeTab === t.id ? 'none' : '1.5px solid #E6E7E8',
              transition: 'all 0.25s ease'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Form content ── */}
      <div style={{ maxWidth:1200, margin:'2rem auto', padding:'0 3rem 4rem' }}>

        {activeTab === 'landing' && (
          <>
            {/* TAB 1: LANDING PAGE */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title="Hero — Texto principal" icon="🦸">
                <Field label="Título (línea 1)" name="heroTitle"   value={cfg.heroTitle || ''}   onChange={handle} />
                <Field label="Título (acento naranja — línea 2)" name="heroAccent" value={cfg.heroAccent || ''} onChange={handle} />
                <Field label="Subtítulo / descripción" name="heroSub" value={cfg.heroSub || ''} onChange={handle} multiline />
              </AdminSection>

              <AdminSection title="Contacto" icon="📞">
                <Field label="Número WhatsApp (con código de país, sin +)" name="whatsapp" value={cfg.whatsapp || ''} onChange={handle}
                  hint="Ejemplo: 573219511173 — Número de WhatsApp del proyecto" />
                <Field label="Correo electrónico" name="email" value={cfg.email || ''} onChange={handle} type="email" />
              </AdminSection>

              <AdminSection title="CTA Final — Llamada a la acción" icon="🎯">
                <Field label="Título del CTA" name="ctaTitle" value={cfg.ctaTitle || ''} onChange={handle} />
                <Field label="Subtítulo / descripción" name="ctaSub" value={cfg.ctaSub || ''} onChange={handle} multiline />
                <div>
                  <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem', marginTop:'1rem' }}>Imágenes del Hero / Slider (Recomendado: 1200x800px)</label>
                  
                  <ImageUploader 
                    id="heroImageUpload"
                    label="Subir nueva foto"
                    onImageSelected={async (base64) => {
                      try {
                        const url = await uploadImage(base64, 'images');
                        const newCfg = { ...cfg, heroImages: [...(cfg.heroImages||[]), url] };
                        setCfg(newCfg); 
                        handleSave(newCfg);
                      } catch(e) {
                        alert("Error subiendo imagen");
                      }
                    }}
                  />

                  <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1rem', marginTop:'0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="O pegar URL de imagen..."
                      value={heroImgUrl}
                      onChange={(e) => setHeroImgUrl(e.target.value)}
                      style={{ flex:1, padding:'0.7rem 1rem', border:'1.5px solid #E6E7E8', borderRadius:12, fontSize:'0.88rem', outline:'none' }}
                    />
                    <button type="button" onClick={() => {
                      if(!heroImgUrl.trim()) return;
                      const newCfg = { ...cfg, heroImages: [...(cfg.heroImages||[]), heroImgUrl.trim()] };
                      setCfg(newCfg); handleSave(newCfg);
                      setHeroImgUrl('');
                    }} style={{ background:'var(--navy)', color:'white', border:'none', borderRadius:12, padding:'0 1.2rem', fontWeight:700, cursor:'pointer' }}>Agregar</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:'0.8rem' }}>
                    {(cfg.heroImages || []).map((img, i) => (
                      <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', height:70, border:'1px solid #eee' }}>
                        <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <button type="button" onClick={() => {
                          const newCfg = { ...cfg, heroImages: (cfg.heroImages||[]).filter((_, idx) => idx !== i) };
                          setCfg(newCfg); handleSave(newCfg);
                        }} style={{ position:'absolute', top:4, right:4, background:'red', color:'white', border:'none', borderRadius:'50%', width:20, height:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminSection>
            </div>

            <div>
              <AdminSection title="Anfitrión e RNT" icon="🧑‍💼">
                <Field label="Nombre del Anfitrión" name="hostName" value={cfg.hostName || ''} onChange={handle} />
                <Field label="Biografía del Anfitrión" name="hostBio" value={cfg.hostBio || ''} onChange={handle} multiline />
                
                <ImageUploader 
                  id="hostImage"
                  label="Foto del Anfitrión (Recomendado: 500x500px)"
                  currentImage={cfg.hostImage}
                  onImageSelected={async (base64) => {
                    try {
                      const url = await uploadImage(base64, 'images');
                      const newCfg = { ...cfg, hostImage: url };
                      setCfg(newCfg);
                      handleSave(newCfg);
                    } catch(e) {
                      alert("Error subiendo imagen");
                    }
                  }}
                  onImageRemoved={() => {
                    const newCfg = { ...cfg, hostImage: '' };
                    setCfg(newCfg);
                    handleSave(newCfg);
                  }}
                />

                <Field label="Registro Nacional de Turismo (RNT)" name="rntNumber" value={cfg.rntNumber || ''} onChange={handle} hint="Se mostrará en las normativas del footer" />
              </AdminSection>
            </div> {/* Fin de columna derecha */}
          </div> {/* Fin de grid de 2 columnas */}

          <div style={{ marginTop: '2rem' }}>
            <AdminSection title="Asistente Virtual (Chat IA)" icon="🤖">
              <Field label="Nombre del Asistente" name="chatAssistantName" value={cfg.chatAssistant?.name || 'Asistente Rentun Group'} onChange={(e) => {
                const newCfg = { ...cfg, chatAssistant: { ...(cfg.chatAssistant || {}), name: e.target.value } };
                setCfg(newCfg);
              }} />
              <Field label="Subtítulo del Asistente" name="chatAssistantSubtitle" value={cfg.chatAssistant?.subtitle || 'Conectado a IA • 24/7'} onChange={(e) => {
                const newCfg = { ...cfg, chatAssistant: { ...(cfg.chatAssistant || {}), subtitle: e.target.value } };
                setCfg(newCfg);
              }} />
              <Field label="Mensaje de Bienvenida" name="chatAssistantWelcome" value={cfg.chatAssistant?.welcome || '¡Hola! Soy el asistente virtual de Rentun Group. ¿En qué te puedo ayudar hoy?'} onChange={(e) => {
                const newCfg = { ...cfg, chatAssistant: { ...(cfg.chatAssistant || {}), welcome: e.target.value } };
                setCfg(newCfg);
              }} multiline />

              <ImageUploader 
                id="chatAssistantAvatar"
                label="Avatar / Foto del Asistente (Recomendado: 200x200px)"
                currentImage={cfg.chatAssistant?.avatar || ''}
                onImageSelected={async (base64) => {
                  try {
                    const url = await uploadImage(base64, 'images');
                    const newCfg = { ...cfg, chatAssistant: { ...(cfg.chatAssistant || {}), avatar: url } };
                    setCfg(newCfg);
                    handleSave(newCfg);
                  } catch(e) {
                    alert("Error subiendo imagen");
                  }
                }}
                onImageRemoved={() => {
                  const newCfg = { ...cfg, chatAssistant: { ...(cfg.chatAssistant || {}), avatar: '' } };
                  setCfg(newCfg);
                  handleSave(newCfg);
                }}
              />
            </AdminSection>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <AdminSection title="Estilo & Tipografía Luxury" icon="✨">
              <p style={{ fontSize:'0.78rem', color:'#5c6d80', margin:'0 0 1.2rem', lineHeight:1.5 }}>
                Selecciona la combinación tipográfica de lujo que mejor se adapte a tu marca. El cambio se aplicará a todo el sitio web y a la guía.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1rem' }}>
                {[
                  {
                    id: 'outfit_inter',
                    title: 'Modern Minimalist',
                    desc: 'Outfit + Inter',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
                    exampleBody: 'Apartamentos premium de corta estancia.',
                    exampleBodyStyle: { fontFamily: "'Inter', sans-serif" }
                  },
                  {
                    id: 'cinzel_montserrat',
                    title: 'Neoclassic Luxury',
                    desc: 'Cinzel + Montserrat',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.05em' },
                    exampleBody: 'Experiencias de hospedaje exclusivas.',
                    exampleBodyStyle: { fontFamily: "'Montserrat', sans-serif" }
                  },
                  {
                    id: 'playfair_montserrat',
                    title: 'Heritage Editorial',
                    desc: 'Playfair Display + Montserrat',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic' },
                    exampleBody: 'Diseño, confort y hospitalidad superior.',
                    exampleBodyStyle: { fontFamily: "'Montserrat', sans-serif" }
                  },
                  {
                    id: 'cormorant_inter',
                    title: 'Sophisticated Boutique',
                    desc: 'Cormorant Garamond + Inter',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic' },
                    exampleBody: 'Atención al detalle y confort absoluto.',
                    exampleBodyStyle: { fontFamily: "'Inter', sans-serif" }
                  },
                  {
                    id: 'playfair_inter',
                    title: 'Classic Serif Contrast',
                    desc: 'Playfair Display + Inter',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
                    exampleBody: 'El balance perfecto entre tradición y legibilidad.',
                    exampleBodyStyle: { fontFamily: "'Inter', sans-serif" }
                  },
                  {
                    id: 'cinzel_inter',
                    title: 'Neoclassic Minimalist',
                    desc: 'Cinzel + Inter',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.08em' },
                    exampleBody: 'Trazos imperiales con cuerpo moderno ultra-limpio.',
                    exampleBodyStyle: { fontFamily: "'Inter', sans-serif" }
                  },
                  {
                    id: 'cormorant_montserrat',
                    title: 'Boutique Geometric',
                    desc: 'Cormorant Garamond + Montserrat',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic' },
                    exampleBody: 'Estilo editorial de alta gama con cuerpo geométrico.',
                    exampleBodyStyle: { fontFamily: "'Montserrat', sans-serif" }
                  },
                  {
                    id: 'bodoni_montserrat',
                    title: 'Bodoni Editorial',
                    desc: 'Bodoni Moda + Montserrat',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Bodoni Moda', serif", fontWeight: 700, fontStyle: 'italic' },
                    exampleBody: 'Contraste editorial dramático y sofisticación extrema.',
                    exampleBodyStyle: { fontFamily: "'Montserrat', sans-serif" }
                  },
                  {
                    id: 'prata_inter',
                    title: 'Boutique Grace',
                    desc: 'Prata + Inter',
                    exampleHeader: 'Rentun Group',
                    exampleHeaderStyle: { fontFamily: "'Prata', serif", fontWeight: 400 },
                    exampleBody: 'Elegancia suave con proporciones clásicas y serifs finos.',
                    exampleBodyStyle: { fontFamily: "'Inter', sans-serif" }
                  }
                ].map(fontOption => {
                  const isSelected = (cfg.fontPair || 'outfit_inter') === fontOption.id;
                  return (
                    <div
                      key={fontOption.id}
                      onClick={() => {
                        const newCfg = { ...cfg, fontPair: fontOption.id };
                        setCfg(newCfg);
                        handleSave(newCfg);
                      }}
                      style={{
                        border: `2px solid ${isSelected ? '#F57C00' : '#E6E7E8'}`,
                        borderRadius: 16,
                        padding: '1rem',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(245,124,0,0.02)' : 'white',
                        transition: 'all 0.2s',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 15px rgba(245,124,0,0.06)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0d1724' }}>
                          {fontOption.title} <span style={{ fontWeight: 500, color: '#B0B4B8', fontSize: '0.72rem', display: 'block', marginTop: '0.15rem' }}>({fontOption.desc})</span>
                        </span>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#F57C00' : '#B0B4B8'}`,
                          background: isSelected ? '#F57C00' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {isSelected && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                        </div>
                      </div>
                      
                      {/* Live Font Preview Card */}
                      <div style={{ background: '#F3F5F8', borderRadius: 10, padding: '0.8rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ ...fontOption.exampleHeaderStyle, fontSize: '1.2rem', color: '#0d1724', margin: '0 0 0.15rem' }}>
                          {fontOption.exampleHeader}
                        </h4>
                        <p style={{ ...fontOption.exampleBodyStyle, fontSize: '0.72rem', color: '#5c6d80', margin: 0, lineHeight: 1.4 }}>
                          {fontOption.exampleBody}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminSection>
          </div>
          </>
        )}

        {activeTab === 'properties' && (
          /* TAB: APARTAMENTOS (CRUD) */
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
            <style>{`
              @media (max-width: 900px) {
                .prop-crud-container { grid-template-columns: 1fr !important; }
              }
            `}</style>
            <div className="prop-crud-container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem', gridColumn:'span 2' }}>
              
              {/* Form Side */}
              <div>
                <AdminSection title={isEditingProp ? 'Editar Apartamento' : 'Añadir Apartamento'} icon="🏨">
                  <form onSubmit={saveProperty} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    
                    {/* Nombre y Ubicación */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                      <Field label="Nombre del apartamento *" value={propForm.name} onChange={e => setPropForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Suite Premium Bogotá" />
                      <Field label="Ubicación *" value={propForm.location} onChange={e => setPropForm(p => ({ ...p, location: e.target.value }))} placeholder="Ej: Chapinero, Bogotá" />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', opacity: 0.8 }}>
                      <Field label="Nombre (Inglés)" value={propForm.nameEn || ''} onChange={e => setPropForm(p => ({ ...p, nameEn: e.target.value }))} placeholder="Ej: Premium Suite Bogotá" />
                      <Field label="Ubicación (Inglés)" value={propForm.locationEn || ''} onChange={e => setPropForm(p => ({ ...p, locationEn: e.target.value }))} placeholder="Ej: Chapinero, Bogota" />
                    </div>

                    {/* Precio y Tipo */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                      <Field label="Tarifa / Precio (Texto)" value={propForm.price} onChange={e => setPropForm(p => ({ ...p, price: e.target.value }))} placeholder="Ej: $250.000 COP / noche" />
                      <SelectField
                        label="Tipo de Alojamiento"
                        value={propForm.isAirbnb ? "true" : "false"}
                        onChange={e => setPropForm(p => ({ ...p, isAirbnb: e.target.value === "true" }))}
                        options={[
                          { label: '🔴 Apartamento en Airbnb', value: 'true' },
                          { label: '🟢 Renta Directa (Independiente)', value: 'false' },
                        ]}
                      />
                    </div>

                    <Field label="Descripción corta *" value={propForm.description} onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))} multiline placeholder="Describe el apartamento para la landing page..." />
                    <Field label="Descripción corta (Inglés)" value={propForm.descriptionEn || ''} onChange={e => setPropForm(p => ({ ...p, descriptionEn: e.target.value }))} multiline placeholder="Describe in English..." />
                    
                    {/* Habitaciones, Camas, Baños */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.8rem' }}>
                      <Field label="Habitaciones" type="number" value={propForm.bedrooms} onChange={e => setPropForm(p => ({ ...p, bedrooms: parseInt(e.target.value) || 1 }))} />
                      <Field label="Camas" type="number" value={propForm.beds} onChange={e => setPropForm(p => ({ ...p, beds: parseInt(e.target.value) || 1 }))} />
                      <Field label="Baños" type="number" value={propForm.baths} onChange={e => setPropForm(p => ({ ...p, baths: parseFloat(e.target.value) || 1 }))} />
                    </div>

                    <AdminSection title="Datos de la Guía" icon="🔑">
                      <Field label="Dirección física exacta" value={propForm.address} onChange={e => setPropForm(p => ({ ...p, address: e.target.value }))} multiline hint="Se muestra en la tarjeta imprimible y en la guía" />
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                        <Field label="Nombre Red WiFi" value={propForm.wifiSSID} onChange={e => setPropForm(p => ({ ...p, wifiSSID: e.target.value }))} />
                        <Field label="Contraseña WiFi" value={propForm.wifiPassword} onChange={e => setPropForm(p => ({ ...p, wifiPassword: e.target.value }))} />
                      </div>
                    </AdminSection>

                    {/* Acordeón Enlaces de Airbnb */}
                    {propForm.isAirbnb && (
                      <div style={{ border:'1px solid #E6E7E8', borderRadius:16, overflow:'hidden' }}>
                        <button type="button" onClick={() => setOpenAirbnb(!openAirbnb)}
                                style={{ width:'100%', padding:'0.8rem 1.2rem', background:'#f8fafc', border:'none', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontWeight:700, color:'#0F4C81', fontSize:'0.82rem', fontFamily:'inherit' }}>
                          <span>🔗 Enlaces de Airbnb ({openAirbnb ? 'Ocultar' : 'Mostrar'})</span>
                          <span style={{ fontSize:'0.7rem' }}>{openAirbnb ? '▲' : '▼'}</span>
                        </button>
                        {openAirbnb && (
                          <div style={{ padding:'1.2rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', background:'white', borderTop:'1px solid #E6E7E8' }}>
                            <Field label="Código del Listing (Embed ID)" value={propForm.airbnbEmbedId} onChange={e => setPropForm(p => ({ ...p, airbnbEmbedId: e.target.value }))} placeholder="Ej: 1637747920094051201" />
                            <Field label="Link del Listing" value={propForm.airbnbListing} onChange={e => setPropForm(p => ({ ...p, airbnbListing: e.target.value }))} />
                            <Field label="Link de Reserva Directa (Booking)" value={propForm.airbnbBooking} onChange={e => setPropForm(p => ({ ...p, airbnbBooking: e.target.value }))} />
                            <Field label="Link de Reseñas" value={propForm.airbnbReviews} onChange={e => setPropForm(p => ({ ...p, airbnbReviews: e.target.value }))} />
                            <Field label="Link Contactar al Anfitrión" value={propForm.airbnbContact} onChange={e => setPropForm(p => ({ ...p, airbnbContact: e.target.value }))} />
                            <Field label="Link Calendario Disponibilidad" value={propForm.airbnbCalendar} onChange={e => setPropForm(p => ({ ...p, airbnbCalendar: e.target.value }))} />
                            <Field label="Link Reglas de Casa" value={propForm.airbnbRules} onChange={e => setPropForm(p => ({ ...p, airbnbRules: e.target.value }))} />
                            <Field label="Link Seguridad" value={propForm.airbnbSafety} onChange={e => setPropForm(p => ({ ...p, airbnbSafety: e.target.value }))} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image Manager */}
                    <AdminSection title="Fotos del Apartamento" icon="🖼️">
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <div style={{ flex:1 }}><input type="text" placeholder="Pegar URL de foto..." value={newImgUrl} onChange={e => setNewImgUrl(e.target.value)} style={{ width:'100%', padding:'0.7rem 1rem', border:'1.5px solid #E6E7E8', borderRadius:12, fontSize:'0.88rem' }} /></div>
                        <button type="button" onClick={addImgUrl} style={{ background:'#0F4C81', color:'white', border:'none', padding:'0 1.2rem', borderRadius:12, fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>Añadir URL</button>
                      </div>

                      <ImageUploader
                        id="propUploader"
                        label="O subir foto (Recomendado: 1200x800px)"
                        currentImage=""
                        onImageSelected={async (base64) => {
                          try {
                            const url = await uploadImage(base64, 'images');
                            setPropForm(prev => ({
                              ...prev,
                              images: [...(prev.images || []), url]
                            }));
                          } catch(e) {
                            alert("Error subiendo imagen");
                          }
                        }}
                      />

                      {/* Thumbnail Grid */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:'0.8rem', marginTop:'1rem' }}>
                        {(propForm.images || []).map((img, idx) => (
                          <div key={idx} style={{ position:'relative', height:80, borderRadius:12, overflow:'hidden', border:'1px solid #E6E7E8' }}>
                            <img src={img} alt="Thumbnail" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            <button type="button" onClick={() => removeImg(idx)}
                              style={{ position:'absolute', top:4, right:4, background:'rgba(255,56,92,0.85)', color:'white', border:'none', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.65rem', cursor:'pointer', fontWeight:'bold' }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </AdminSection>

                    {/* Acordeón QRs Personalizados */}
                    <div style={{ border:'1px solid #E6E7E8', borderRadius:16, overflow:'hidden' }}>
                      <button type="button" onClick={() => setOpenQRs(!openQRs)}
                              style={{ width:'100%', padding:'0.8rem 1.2rem', background:'#f8fafc', border:'none', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontWeight:700, color:'#0F4C81', fontSize:'0.82rem', fontFamily:'inherit' }}>
                        <span>📱 Códigos QR Personalizados (Opcional) ({openQRs ? 'Ocultar' : 'Mostrar'})</span>
                        <span style={{ fontSize:'0.7rem' }}>{openQRs ? '▲' : '▼'}</span>
                      </button>
                      {openQRs && (
                        <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', gap:'1.2rem', background:'white', borderTop:'1px solid #E6E7E8' }}>
                          <p style={{ fontSize:'0.72rem', color:'#5c6d80', margin:'0 0 0.5rem', lineHeight:1.4 }}>
                            Sube tus propios QRs (de WiFi, Guía o WhatsApp). Reemplazarán a los códigos autogenerados en la tarjeta de bienvenida.
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            <ImageUploader
                              id="qrWifi"
                              label="Código QR del WiFi"
                              currentImage={propForm.customWifiQR}
                              onImageSelected={(base64) => setPropForm(p => ({ ...p, customWifiQR: base64 }))}
                              onImageRemoved={() => setPropForm(p => ({ ...p, customWifiQR: '' }))}
                              objectFit="contain"
                            />
                            <ImageUploader
                              id="qrGuide"
                              label="Código QR de la Guía"
                              currentImage={propForm.customGuideQR}
                              onImageSelected={(base64) => setPropForm(p => ({ ...p, customGuideQR: base64 }))}
                              onImageRemoved={() => setPropForm(p => ({ ...p, customGuideQR: '' }))}
                              objectFit="contain"
                            />
                            <ImageUploader
                              id="qrWhatsapp"
                              label="Código QR de WhatsApp"
                              currentImage={propForm.customWhatsappQR}
                              onImageSelected={(base64) => setPropForm(p => ({ ...p, customWhatsappQR: base64 }))}
                              onImageRemoved={() => setPropForm(p => ({ ...p, customWhatsappQR: '' }))}
                              objectFit="contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'1rem' }}>
                      {(isEditingProp || propForm.name) && (
                        <button type="button" onClick={clearPropForm} style={{ padding:'0.7rem 1.4rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:700, cursor:'pointer' }}>
                          Cancelar
                        </button>
                      )}
                      <button type="submit" style={{ padding:'0.7rem 1.8rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 14px rgba(15,76,129,0.2)' }}>
                        {isEditingProp ? 'Guardar Cambios' : 'Añadir Apartamento'}
                      </button>
                    </div>
                  </form>
                </AdminSection>
              </div>

              {/* List Side */}
              <div>
                <AdminSection title="Apartamentos Registrados" icon="🏨">
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {properties.length === 0 ? (
                      <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay apartamentos registrados.</p>
                    ) : (
                      properties.map(p => (
                        <div key={p.id} style={{ background:'#f8fafc', padding:'1.2rem', borderRadius:20, border:'1px solid #E6E7E8', display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                          <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} style={{ width:70, height:70, borderRadius:12, objectFit:'cover', border:'1px solid #E6E7E8' }} />
                            ) : (
                              <div style={{ width:70, height:70, borderRadius:12, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>🏨</div>
                            )}
                            <div style={{ flex:1 }}>
                              <h4 style={{ fontSize:'0.95rem', fontWeight:800, color:'#0d1724', margin:0 }}>{p.name}</h4>
                              <span style={{ fontSize:'0.73rem', color:'#5c6d80' }}>📍 {p.location}</span>
                              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
                                <span style={{ fontSize:'0.65rem', textTransform:'uppercase', fontWeight:800, color: p.isAirbnb ? '#dc2626' : '#059669', background: p.isAirbnb ? 'rgba(220,38,38,0.08)' : 'rgba(5,150,105,0.08)', padding:'0.15rem 0.5rem', borderRadius:50 }}>
                                  {p.isAirbnb ? 'Airbnb' : 'Directo'}
                                </span>
                                <span style={{ fontSize:'0.65rem', textTransform:'uppercase', fontWeight:800, color:'#F57C00', background:'rgba(245,124,0,0.08)', padding:'0.15rem 0.5rem', borderRadius:50 }}>
                                  {p.price}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end', borderTop:'1px solid #E6E7E8', paddingTop:'0.8rem' }}>
                            <Link to={`/imprimir/${p.id}`} target="_blank"
                              style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', border:'1.5px solid rgba(15,76,129,0.3)', background:'white', color:'#0F4C81', padding:'0.45rem 1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, textDecoration:'none' }}>
                              🖨️ Tarjeta Bienvenida
                            </Link>
                            <button onClick={() => startEditProp(p)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.45rem 1.1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>
                              Editar
                            </button>
                            <button onClick={() => deleteProperty(p.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.45rem 1.1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AdminSection>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'guide-info' && (
          /* TAB 2: GENERAL GUIDE INFO & RULES */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title={isEditingEmergency ? 'Editar Contacto de Emergencia' : 'Añadir Contacto de Emergencia'} icon="🚨">
                <form onSubmit={saveEmergency} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Nombre / Título del Contacto *" value={emergencyForm.title} onChange={e => setEmergencyForm(em => ({ ...em, title: e.target.value }))} placeholder="Ej: 🏥 Centro Médico / Clínica" />
                  <Field label="Detalle / Dirección / Teléfono *" value={emergencyForm.value} onChange={e => setEmergencyForm(em => ({ ...em, value: e.target.value }))} placeholder="Ej: Clínica Reina Sofía — Tel: (601) 625-2111" multiline />
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                    {(isEditingEmergency || emergencyForm.title) && (
                      <button type="button" onClick={clearEmergencyForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingEmergency ? 'Guardar Cambios' : 'Añadir Contacto'}
                    </button>
                  </div>
                </form>
              </AdminSection>

              <AdminSection title="Contactos de Emergencia Registrados" icon="🚨">
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {(cfg.emergencies || []).length === 0 ? (
                    <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay contactos de emergencia registrados.</p>
                  ) : (
                    (cfg.emergencies || []).map(em => (
                      <div key={em.id} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem 1.2rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                        <div style={{ flex:1 }}>
                          <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{em.title}</h4>
                          <p style={{ fontSize:'0.8rem', color:'#5c6d80', margin:'0.3rem 0 0', lineHeight:1.4 }}>{em.value}</p>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button onClick={() => startEditEmergency(em)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteEmergency(em.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AdminSection>
            </div>

            <div>
              <AdminSection title={isEditingRule ? 'Editar Regla de la Casa' : 'Añadir Regla de la Casa'} icon="📋">
                <form onSubmit={saveRule} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Nombre de la regla *" value={ruleForm.title} onChange={e => setRuleForm(r => ({ ...r, title: e.target.value }))} placeholder="Ej: Fumar en la propiedad" />
                  <SelectField
                    label="Estado de la regla"
                    value={ruleForm.allowed ? "true" : "false"}
                    onChange={e => setRuleForm(r => ({ ...r, allowed: e.target.value === "true" }))}
                    options={[
                      { label: '❌ No permitido', value: 'false' },
                      { label: '✅ Permitido', value: 'true' }
                    ]}
                  />
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                    {(isEditingRule || ruleForm.title) && (
                      <button type="button" onClick={clearRuleForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingRule ? 'Guardar Regla' : 'Añadir Regla'}
                    </button>
                  </div>
                </form>
              </AdminSection>

              <AdminSection title="Reglas Registradas" icon="📋">
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {(cfg.houseRules || []).length === 0 ? (
                    <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay reglas registradas.</p>
                  ) : (
                    (cfg.houseRules || []).map(r => (
                      <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'0.8rem 1.2rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                        <div style={{ flex:1 }}>
                          <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{r.title}</h4>
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:'0.25rem', marginTop:'0.3rem',
                            background: r.allowed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: r.allowed ? '#059669' : '#dc2626',
                            border: `1px solid ${r.allowed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            borderRadius:50, padding:'0.15rem 0.5rem', fontSize:'0.65rem', fontWeight:800
                          }}>
                            {r.allowed ? '✓ Permitido' : '❌ No permitido'}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button onClick={() => startEditRule(r)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteRule(r.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AdminSection>
            </div>
          </div>
        )}

        {activeTab === 'guide-places' && (
          /* TAB 3: NEARBY PLACES (CRUD) */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title={isEditingPlace ? 'Editar Lugar Cercano' : 'Añadir Lugar Cercano'} icon="📍">
                <form onSubmit={savePlace} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Nombre / Título del Lugar *" value={placeForm.title} onChange={e => setPlaceForm(p => ({ ...p, title: e.target.value }))} />
                  <Field label="Subtítulo (Resumen corto)" value={placeForm.subtitle} onChange={e => setPlaceForm(p => ({ ...p, subtitle: e.target.value }))} hint="Ej: A 5 min caminando" />
                  <Field label="Descripción del lugar *" value={placeForm.description} onChange={e => setPlaceForm(p => ({ ...p, description: e.target.value }))} multiline />
                  
                  <SelectField
                    label="Categoría"
                    value={placeForm.category}
                    onChange={e => setPlaceForm(p => ({ ...p, category: e.target.value }))}
                    options={[
                      { label: '🛍️ Compras (Supermercados/Tiendas)', value: 'shopping' },
                      { label: '🍔 Comida (Restaurantes/Cafés)', value: 'food' },
                      { label: '🏛️ Turismo (Atracciones/Planes)', value: 'tourism' },
                      { label: '🏥 Servicios (Farmacias/Bancos/Otros)', value: 'services' },
                    ]}
                  />

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <Field label="Distancia (Ej: 200m)" value={placeForm.distance} onChange={e => setPlaceForm(p => ({ ...p, distance: e.target.value }))} />
                    <Field label="Tiempo a pie (Ej: 3 min)" value={placeForm.walkingTime} onChange={e => setPlaceForm(p => ({ ...p, walkingTime: e.target.value }))} />
                  </div>

                  <Field label="Enlace Google Maps (GPS) *" value={placeForm.mapLink} onChange={e => setPlaceForm(p => ({ ...p, mapLink: e.target.value }))} placeholder="https://maps.app.goo.gl/..." />

                  <ImageUploader
                    id="placeImage"
                    label="Foto del Lugar"
                    currentImage={placeForm.image}
                    onImageSelected={(base64) => setPlaceForm(p => ({ ...p, image: base64 }))}
                    onImageRemoved={() => setPlaceForm(p => ({ ...p, image: '' }))}
                  />

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                    {(isEditingPlace || placeForm.title) && (
                      <button type="button" onClick={clearPlaceForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingPlace ? 'Guardar Cambios' : 'Añadir Lugar'}
                    </button>
                  </div>
                </form>
              </AdminSection>
            </div>

            <div>
              <AdminSection title="Sitios Recomendados Guardados" icon="🗺️">
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {(cfg.places || []).length === 0 ? (
                    <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay lugares guardados.</p>
                  ) : (
                    (cfg.places || []).map(p => (
                      <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'0.8rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                        {p.image ? (
                          <img src={p.image} alt={p.title} style={{ width:54, height:54, borderRadius:10, objectFit:'cover' }} />
                        ) : (
                          <div style={{ width:54, height:54, borderRadius:10, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📍</div>
                        )}
                        <div style={{ flex:1 }}>
                          <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{p.title}</h4>
                          <span style={{ fontSize:'0.65rem', textTransform:'uppercase', fontWeight:800, color:'#FF9A2F' }}>
                            {p.category === 'shopping' ? '🛒 Compras' : p.category === 'food' ? '🍔 Comida' : p.category === 'tourism' ? '🏛️ Turismo' : '🏥 Servicios'}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button onClick={() => startEditPlace(p)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deletePlace(p.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AdminSection>
            </div>
          </div>
        )}

        {activeTab === 'guide-manuals' && (
          /* TAB 4: MANUALS (CRUD) */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title={isEditingManual ? 'Editar Manual de la Casa' : 'Añadir Manual de la Casa'} icon="📖">
                <form onSubmit={saveManual} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Título del manual *" value={manualForm.title} onChange={e => setManualForm(m => ({ ...m, title: e.target.value }))} hint="Ej: Instrucciones del Calentador" />
                  <Field label="Instrucciones / Descripción *" value={manualForm.description} onChange={e => setManualForm(m => ({ ...m, description: e.target.value }))} multiline />

                  <ImageUploader
                    id="manualImage"
                    label="Foto explicativa (opcional)"
                    currentImage={manualForm.image}
                    onImageSelected={(base64) => setManualForm(m => ({ ...m, image: base64 }))}
                    onImageRemoved={() => setManualForm(m => ({ ...m, image: '' }))}
                  />

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                    {(isEditingManual || manualForm.title) && (
                      <button type="button" onClick={clearManualForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingManual ? 'Guardar Cambios' : 'Añadir Manual'}
                    </button>
                  </div>
                </form>
              </AdminSection>
            </div>

            <div>
              <AdminSection title="Manuales Guardados" icon="📚">
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {(cfg.manuals || []).length === 0 ? (
                    <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay manuales guardados.</p>
                  ) : (
                    (cfg.manuals || []).map(m => (
                      <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'0.8rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                        {m.image ? (
                          <img src={m.image} alt={m.title} style={{ width:54, height:54, borderRadius:10, objectFit:'cover' }} />
                        ) : (
                          <div style={{ width:54, height:54, borderRadius:10, background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📖</div>
                        )}
                        <div style={{ flex:1 }}>
                          <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{m.title}</h4>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button onClick={() => startEditManual(m)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteManual(m.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AdminSection>
            </div>
          </div>
        )}

        {activeTab === 'guide-faqs' && (
          /* TAB 5: FAQS & CHECKOUT TASKS (CRUD) */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title={isEditingFaq ? 'Editar FAQ' : 'Añadir FAQ'} icon="❓">
                <form onSubmit={saveFaq} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Pregunta *" value={faqForm.question} onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))} />
                  <Field label="Respuesta *" value={faqForm.answer} onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))} multiline />

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                    {(isEditingFaq || faqForm.question) && (
                      <button type="button" onClick={clearFaqForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingFaq ? 'Guardar' : 'Añadir Pregunta'}
                    </button>
                  </div>
                </form>
              </AdminSection>

              <div style={{ marginTop:'1.5rem' }}>
                <AdminSection title="FAQs Guardadas" icon="❓">
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                    {(cfg.faqs || []).length === 0 ? (
                      <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay FAQs guardadas.</p>
                    ) : (
                      (cfg.faqs || []).map(f => (
                        <div key={f.id} style={{ background:'#f8fafc', padding:'0.8rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                          <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:'0 0 0.25rem' }}>{f.question}</h4>
                          <p style={{ fontSize:'0.78rem', color:'#5c6d80', margin:'0 0 0.8rem' }}>{f.answer}</p>
                          <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                            <button onClick={() => startEditFaq(f)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                              Editar
                            </button>
                            <button onClick={() => deleteFaq(f.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AdminSection>
              </div>
            </div>

            <div>
              <AdminSection title={isEditingTask ? 'Editar Tarea de Salida' : 'Añadir Tarea de Salida'} icon="✅">
                <form onSubmit={saveTask} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Descripción de la Tarea *" value={taskForm.task} onChange={e => setTaskForm(t => ({ ...t, task: e.target.value }))} hint="Ej: Apagar calentador de agua" />

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                    {(isEditingTask || taskForm.task) && (
                      <button type="button" onClick={clearTaskForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingTask ? 'Guardar' : 'Añadir Tarea'}
                    </button>
                  </div>
                </form>
              </AdminSection>

              <div style={{ marginTop:'1.5rem' }}>
                <AdminSection title="Checklist de Salida Guardado" icon="📝">
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                    {(cfg.checkoutTasks || []).length === 0 ? (
                      <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay tareas guardadas.</p>
                    ) : (
                      (cfg.checkoutTasks || []).map(t => (
                        <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'0.8rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:'0.85rem', color:'#0d1724', margin:0 }}>{t.task}</p>
                          </div>
                          <div style={{ display:'flex', gap:'0.4rem' }}>
                            <button onClick={() => startEditTask(t)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                              Editar
                            </button>
                            <button onClick={() => deleteTask(t.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AdminSection>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          /* TAB: EDITAR PAGINA LEGAL */
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <AdminSection title="Encabezado y Datos de Página Legal" icon="⚖️">
              <Field label="Tag Superior" name="legalTag" value={cfg.legalTag || ''} onChange={handle} />
              <Field label="Título de la Página" name="legalTitle" value={cfg.legalTitle || ''} onChange={handle} />
              <Field label="Subtítulo / Introducción" name="legalSubtitle" value={cfg.legalSubtitle || ''} onChange={handle} multiline />
            </AdminSection>

            <AdminSection title="Sección 1: Advertencia de Protección a Menores (ESCNNA)" icon="🚨">
              <Field label="Título de la Sección" name="legalEscnnaTitle" value={cfg.legalEscnnaTitle || ''} onChange={handle} />
              <Field label="Contenido Legal (ESCNNA)" name="legalEscnna" value={cfg.legalEscnna || ''} onChange={handle} multiline hint="Leyes sobre explotación sexual de menores (Ley 679 de 2001, Ley 1098 de 2006 y Ley 1336 de 2009)." />
            </AdminSection>

            <AdminSection title="Sección 2: Protección de Datos Personales (Habeas Data)" icon="📂">
              <Field label="Título de la Sección" name="legalHabeasTitle" value={cfg.legalHabeasTitle || ''} onChange={handle} />
              <Field label="Contenido Legal (Habeas Data)" name="legalHabeasData" value={cfg.legalHabeasData || ''} onChange={handle} multiline hint="Ley 1581 de 2012 y Decreto 1377 de 2013." />
            </AdminSection>

            <AdminSection title="Sección 3: Conservación del Patrimonio Natural y Cultural" icon="🌱">
              <Field label="Título de la Sección" name="legalFloraTitle" value={cfg.legalFloraTitle || ''} onChange={handle} />
              <Field label="Contenido Legal (Patrimonio, Flora y Fauna)" name="legalFloraFauna" value={cfg.legalFloraFauna || ''} onChange={handle} multiline hint="Leyes sobre fauna y flora (Ley 17 de 1981, 299 de 1996) y bienes de interés cultural (Ley 397 de 1997)." />
            </AdminSection>
          </div>
        )}

        {/* Info panel: próximas conexiones */}
        <div style={{ background:'linear-gradient(135deg,rgba(15,76,129,0.05),rgba(245,124,0,0.04))', border:'1.5px dashed rgba(15,76,129,0.2)', borderRadius:20, padding:'1.5rem 2rem', marginTop:'2rem' }}>
          <h3 style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.95rem', margin:'0 0 1rem' }}>🔮 Próximas integraciones</h3>
          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.7rem', padding:0, margin:0 }}>
            {[
              { icon:'🗄️', text:'Supabase — Persistencia en la nube (esperando credenciales del proyecto)' },
              { icon:'🐙', text:'GitHub — Repositorio de control de versiones del proyecto' },
              { icon:'▲', text:'Vercel — Deploy automático desde GitHub (gratis con plan Hobby)' },
              { icon:'▲', text:'Auth Admin — Login protegido para el panel (con Supabase Auth)' },
            ].map(i => (
              <li key={i.text} style={{ display:'flex', alignItems:'center', gap:'0.7rem', fontSize:'0.85rem', color:'#5c6d80' }}>
                <span style={{ fontSize:'1.1rem' }}>{i.icon}</span> {i.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom save button */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'2.5rem', gap:'1rem' }}>
          <button onClick={handleReset}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'white', color:'#FF385C', border:'1.5px solid rgba(255,56,92,0.3)', padding:'0.9rem 2rem', borderRadius:50, fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            🔄 Restablecer todo
          </button>
          <button onClick={() => handleSave()}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'linear-gradient(135deg,#F57C00,#FF9A2F)', color:'white', border:'none', padding:'0.9rem 2.2rem', borderRadius:50, fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 28px rgba(245,124,0,0.42)' }}>
            {saved ? '✅ ¡Guardado correctamente!' : '💾 Guardar todos los cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}
