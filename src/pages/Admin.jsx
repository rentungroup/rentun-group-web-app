import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, RotateCcw, AlertTriangle, Eye, ArrowUp, ArrowDown, UploadCloud } from 'lucide-react';
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

  // Estados para CRUD de páginas legales dinámicas
  const [legalPageForm, setLegalPageForm] = useState({ id:'', title:'', icon:'📄', content:'', is_active:true, sort_order:0 });
  const [isEditingLegalPage, setIsEditingLegalPage] = useState(false);

  // Estados para CRUD de emergencias dinámicas
  const [emergencyForm, setEmergencyForm] = useState({ id: '', title: '', value: '' });
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);

  // Estados para CRUD de servicios inmobiliarios
  const [realEstateForm, setRealEstateForm] = useState({ id: '', title: '', titleEn: '', description: '', descriptionEn: '', icon: 'Home', sortOrder: 0 });
  const [isEditingRealEstate, setIsEditingRealEstate] = useState(false);

  // Estados para página inmobiliaria ampliada
  const [reSubTab, setReSubTab] = useState('general');
  const [projectVideoForm, setProjectVideoForm] = useState({ title: '', titleEn: '', url: '', description: '', descriptionEn: '' });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingWelcomeVideo, setUploadingWelcomeVideo] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ id: '', title: '', titleEn: '', description: '', descriptionEn: '', price: '', location: '', locationEn: '', specs: '', specsEn: '', images: [] });
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [uploadingPortfolioPhoto, setUploadingPortfolioPhoto] = useState(false);

  // Estados para acordeones de formularios de apartamentos
  const [openAirbnb, setOpenAirbnb] = useState(false);
  const [openQRs, setOpenQRs] = useState(false);

  // Estados para CRUD de propiedades (apartamentos)
  const [propForm, setPropForm] = useState({
    id: '', name: '', description: '', location: '', address: '', wifiSSID: '', wifiPassword: '', price: '',
    bedrooms: 1, beds: 1, baths: 1, guests: 2, isAirbnb: true,
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
      bedrooms: 1, beds: 1, baths: 1, guests: 2, isAirbnb: true,
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

  // ── Legal Pages CRUD ──
  const saveLegalPage = (e) => {
    if (e) e.preventDefault();
    if (!legalPageForm.title) return;
    const currentPages = cfg.legalPages || [];
    let updatedPages;
    if (isEditingLegalPage) {
      updatedPages = currentPages.map(p => p.id === legalPageForm.id ? { ...legalPageForm } : p);
    } else {
      const newPage = { ...legalPageForm, id: 'lp-' + Date.now(), sort_order: currentPages.length };
      updatedPages = [...currentPages, newPage];
    }
    const newCfg = { ...cfg, legalPages: updatedPages };
    handleSave(newCfg);
    clearLegalPageForm();
  };

  const startEditLegalPage = (p) => {
    setLegalPageForm(p);
    setIsEditingLegalPage(true);
  };

  const deleteLegalPage = (id) => {
    if (!window.confirm('¿Eliminar esta página legal?')) return;
    const updated = (cfg.legalPages || []).filter(p => p.id !== id);
    const newCfg = { ...cfg, legalPages: updated };
    handleSave(newCfg);
  };

  const toggleLegalPage = (id) => {
    const updated = (cfg.legalPages || []).map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    const newCfg = { ...cfg, legalPages: updated };
    handleSave(newCfg);
  };

  const clearLegalPageForm = () => {
    setLegalPageForm({ id:'', title:'', icon:'📄', content:'', is_active:true, sort_order:0 });
    setIsEditingLegalPage(false);
  };

  // ── Real Estate CRUD ──
  const saveRealEstate = (e) => {
    if (e) e.preventDefault();
    if (!realEstateForm.title || !realEstateForm.description) {
      alert('El título y la descripción son obligatorios.');
      return;
    }
    let updatedServices;
    const currentServices = cfg.realEstateServices || [];
    if (isEditingRealEstate) {
      updatedServices = currentServices.map(s => s.id === realEstateForm.id ? { ...realEstateForm } : s);
    } else {
      updatedServices = [...currentServices, { ...realEstateForm, id: 're-' + Date.now(), sortOrder: currentServices.length + 1 }];
    }
    const newCfg = { ...cfg, realEstateServices: updatedServices };
    handleSave(newCfg);
    clearRealEstateForm();
  };

  const startEditRealEstate = (s) => {
    setRealEstateForm(s);
    setIsEditingRealEstate(true);
  };

  const deleteRealEstate = (id) => {
    if (!window.confirm('¿Eliminar este servicio inmobiliario?')) return;
    const updated = (cfg.realEstateServices || []).filter(s => s.id !== id);
    const reordered = updated.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    const newCfg = { ...cfg, realEstateServices: reordered };
    handleSave(newCfg);
  };

  const clearRealEstateForm = () => {
    setRealEstateForm({ id: '', title: '', titleEn: '', description: '', descriptionEn: '', icon: 'Home', sortOrder: 0 });
    setIsEditingRealEstate(false);
  };

  const moveRealEstate = (index, direction) => {
    const services = [...(cfg.realEstateServices || [])];
    if (direction === 'up' && index > 0) {
      [services[index], services[index - 1]] = [services[index - 1], services[index]];
    } else if (direction === 'down' && index < services.length - 1) {
      [services[index], services[index + 1]] = [services[index + 1], services[index]];
    }
    const updated = services.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    const newCfg = { ...cfg, realEstateServices: updated };
    handleSave(newCfg);
  };

  // ── Página Inmobiliaria Ampliada ──
  const uploadHeroImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImage(true);
    try {
      const url = await uploadImage(file, 'images');
      setCfg(prev => ({ ...prev, rePageHeroImage: url }));
      alert("Imagen de fondo del banner subida con éxito.");
    } catch (err) {
      alert("Error al subir imagen: " + err.message);
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const uploadProjectVideoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadImage(file, 'images');
      setProjectVideoForm(prev => ({ ...prev, url }));
      alert("Archivo de video subido. Puedes añadir el video ahora.");
    } catch (err) {
      alert("Error al subir video: " + err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const addProjectVideo = (e) => {
    if (e) e.preventDefault();
    if (!projectVideoForm.title || !projectVideoForm.url) {
      alert("El título y la URL del video son obligatorios.");
      return;
    }
    const currentVideos = cfg.rePageVideos || [];
    const updated = [...currentVideos, { ...projectVideoForm }];
    setCfg(prev => ({ ...prev, rePageVideos: updated }));
    setProjectVideoForm({ title: '', titleEn: '', url: '', description: '', descriptionEn: '' });
  };

  const deleteProjectVideo = (index) => {
    const current = cfg.rePageVideos || [];
    const updated = current.filter((_, idx) => idx !== index);
    setCfg(prev => ({ ...prev, rePageVideos: updated }));
  };

  const uploadPortfolioPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if ((portfolioForm.images || []).length >= 4) {
      alert("Puedes subir un máximo de 4 fotos por propiedad.");
      return;
    }
    setUploadingPortfolioPhoto(true);
    try {
      const url = await uploadImage(file, 'images');
      setPortfolioForm(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    } catch (err) {
      alert("Error al subir foto: " + err.message);
    } finally {
      setUploadingPortfolioPhoto(false);
    }
  };

  const removePortfolioFormPhoto = (idxToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const savePortfolioItem = (e) => {
    if (e) e.preventDefault();
    if (!portfolioForm.title || (portfolioForm.images || []).length === 0) {
      alert("El título y al menos una foto son obligatorios.");
      return;
    }

    const currentItems = (cfg.rePageGallery || []).map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `legacy-${idx}`,
          title: `Espacio ${idx + 1}`,
          titleEn: `Space ${idx + 1}`,
          description: '',
          descriptionEn: '',
          price: '',
          location: '',
          locationEn: '',
          specs: '',
          specsEn: '',
          images: [item]
        };
      }
      return item;
    });

    let updated;
    if (isEditingPortfolio) {
      updated = currentItems.map(item => item.id === portfolioForm.id ? { ...portfolioForm } : item);
    } else {
      const newItem = { 
        ...portfolioForm, 
        id: crypto.randomUUID() 
      };
      updated = [...currentItems, newItem];
    }

    setCfg(prev => ({ ...prev, rePageGallery: updated }));
    clearPortfolioForm();
  };

  const deletePortfolioItem = (id) => {
    if (!window.confirm('¿Eliminar esta propiedad del portafolio?')) return;
    const currentItems = (cfg.rePageGallery || []).map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `legacy-${idx}`,
          title: `Espacio ${idx + 1}`,
          titleEn: `Space ${idx + 1}`,
          description: '',
          descriptionEn: '',
          price: '',
          location: '',
          locationEn: '',
          specs: '',
          specsEn: '',
          images: [item]
        };
      }
      return item;
    });
    const updated = currentItems.filter(item => item.id !== id);
    setCfg(prev => ({ ...prev, rePageGallery: updated }));
  };

  const startEditPortfolioItem = (item) => {
    setPortfolioForm(item);
    setIsEditingPortfolio(true);
  };

  const clearPortfolioForm = () => {
    setPortfolioForm({ id: '', title: '', titleEn: '', description: '', descriptionEn: '', price: '', location: '', locationEn: '', specs: '', specsEn: '', images: [] });
    setIsEditingPortfolio(false);
  };

  const uploadWelcomeVideoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingWelcomeVideo(true);
    try {
      const url = await uploadImage(file, 'images');
      setCfg(prev => ({ ...prev, rePageWelcomeVideo: url }));
      alert("Video de bienvenida subido con éxito.");
    } catch (err) {
      alert("Error al subir video: " + err.message);
    } finally {
      setUploadingWelcomeVideo(false);
    }
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
              Edita el contenido del sitio
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
            📖 Vista previa de Estadía
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



      {/* ── Tab Switcher ── */}
      <div style={{ display:'flex', justifyContent:'center', gap:'1rem', margin:'2rem 0 0.5rem', flexWrap:'wrap', padding:'0 2rem' }}>
        {[
          { id: 'landing', label: '🏠 Inicio' },
          { id: 'properties', label: '🏨 Apartamentos' },
          { id: 'inmobiliaria', label: '🏢 Inmobiliaria' },
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
                    
                    {/* Habitaciones, Camas, Baños, Personas */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.8rem' }}>
                      <Field label="Habitaciones" type="number" value={propForm.bedrooms} onChange={e => setPropForm(p => ({ ...p, bedrooms: parseInt(e.target.value) || 1 }))} />
                      <Field label="Camas" type="number" value={propForm.beds} onChange={e => setPropForm(p => ({ ...p, beds: parseInt(e.target.value) || 1 }))} />
                      <Field label="Baños" type="number" value={propForm.baths} onChange={e => setPropForm(p => ({ ...p, baths: parseFloat(e.target.value) || 1 }))} />
                      <Field label="Personas" type="number" value={propForm.guests || 2} onChange={e => setPropForm(p => ({ ...p, guests: parseInt(e.target.value) || 2 }))} />
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
          <>
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

          {/* Texto libre de reglas adicionales de la casa */}
          <div style={{ marginTop: '2rem' }}>
            <AdminSection title="Texto Libre de Reglas Adicionales" icon="📝">
              <p style={{ fontSize:'0.78rem', color:'#5c6d80', marginBottom:'1rem', lineHeight:1.5 }}>
                Escribe aquí reglas adicionales en formato libre (como en Airbnb). Se mostrarán en la guía del huésped como bloque de texto.
              </p>
              <textarea
                value={cfg.houseRulesText || ''}
                onChange={e => {
                  const newCfg = { ...cfg, houseRulesText: e.target.value };
                  setCfg(newCfg);
                }}
                placeholder={`Ej:\n• Los huéspedes deben registrarse en la portería al llegar.\n• Está prohibido el ingreso de mascotas.\n• Silencio a partir de las 10 PM.\n• Los visitantes deben retirarse antes de las 10 PM.`}
                rows={10}
                style={{
                  width:'100%', padding:'0.9rem 1rem', border:'1.5px solid #E6E7E8', borderRadius:12,
                  fontSize:'0.88rem', fontFamily:'Outfit,sans-serif', color:'#0d1724',
                  outline:'none', resize:'vertical', lineHeight:1.6
                }}
              />
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.8rem' }}>
                <button
                  onClick={() => handleSave()}
                  style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                  💾 Guardar Texto de Reglas
                </button>
              </div>
            </AdminSection>
          </div>
          </>
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

        {activeTab === 'inmobiliaria' && (
          <div>
            {/* Sub-tab navigation */}
            <div style={{ display:'flex', gap:'0.8rem', marginBottom:'2rem', borderBottom:'1px solid #E6E7E8', paddingBottom:'0.8rem', flexWrap:'wrap' }}>
              {[
                { id: 'general', label: '⚙️ General & Hero' },
                { id: 'services', label: '🛠️ Servicios Pilares' },
                { id: 'videos', label: '🎬 Videos de Proyectos' },
                { id: 'gallery', label: '🏢 Portafolio de Propiedades' }
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setReSubTab(sub.id)}
                  style={{
                    border: 'none',
                    background: reSubTab === sub.id ? 'rgba(15,76,129,0.1)' : 'transparent',
                    color: reSubTab === sub.id ? '#0F4C81' : '#5c6d80',
                    padding: '0.5rem 1.2rem',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab: General */}
            {reSubTab === 'general' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
                <div>
                  <AdminSection title="Hero Inmobiliario — Textos" icon="✍️">
                    <Field label="Título del Banner (Español) *" value={cfg.rePageTitle || ''} onChange={e => setCfg({ ...cfg, rePageTitle: e.target.value })} />
                    <Field label="Título del Banner (Inglés)" value={cfg.rePageTitleEn || ''} onChange={e => setCfg({ ...cfg, rePageTitleEn: e.target.value })} />
                    <Field label="Subtítulo del Banner (Español) *" value={cfg.rePageSub || ''} onChange={e => setCfg({ ...cfg, rePageSub: e.target.value })} multiline />
                    <Field label="Subtítulo del Banner (Inglés)" value={cfg.rePageSubEn || ''} onChange={e => setCfg({ ...cfg, rePageSubEn: e.target.value })} multiline />
                  </AdminSection>

                  <div style={{ marginTop:'1.5rem' }}>
                    <AdminSection title="Introducción / Enfoque" icon="📖">
                      <Field label="Descripción de la Página (Español) *" value={cfg.rePageDescription || ''} onChange={e => setCfg({ ...cfg, rePageDescription: e.target.value })} multiline />
                      <Field label="Descripción de la Página (Inglés)" value={cfg.rePageDescriptionEn || ''} onChange={e => setCfg({ ...cfg, rePageDescriptionEn: e.target.value })} multiline />
                    </AdminSection>
                  </div>
                </div>

                <div>
                  <AdminSection title="Fondo de Banner (Imagen de Fondo)" icon="🖼️">
                    <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      <Field 
                        label="URL de la Imagen de Fondo" 
                        value={cfg.rePageHeroImage || ''} 
                        onChange={e => setCfg({ ...cfg, rePageHeroImage: e.target.value })} 
                        placeholder="Ej: https://.../imagen.webp"
                        hint="Esta imagen se mostrará como fondo oscuro y elegante detrás del video de presentación en la cabecera."
                      />
                      
                      <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
                          Subir Imagen de Fondo desde PC (Recomendado: Máx. 3MB, formato .webp o .jpg)
                        </label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={uploadHeroImageFile} 
                          style={{ fontSize:'0.82rem', color:'#5c6d80' }} 
                        />
                        {uploadingHeroImage && <p style={{ fontSize:'0.75rem', color:'#0F4C81', fontWeight:600, margin:'0.4rem 0 0' }}>⏳ Subiendo imagen de fondo...</p>}
                      </div>
                    </div>
                  </AdminSection>

                  <div style={{ marginTop:'1.5rem' }}>
                    <AdminSection title="Video de Bienvenida / Presentación" icon="👋">
                      <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                        <Field 
                          label="URL del Video de Bienvenida (MP4 o YouTube)" 
                          value={cfg.rePageWelcomeVideo || ''} 
                          onChange={e => setCfg({ ...cfg, rePageWelcomeVideo: e.target.value })} 
                          placeholder="Ej: https://.../welcome.mp4" 
                          hint="Puedes pegar un enlace de YouTube o una URL directa MP4. Se mostrará en la sección de enfoque en la cabecera de la página."
                        />
                        
                        <div>
                          <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
                            Subir Video de Presentación desde PC (Recomendado: Máx. 30MB, formato .mp4)
                          </label>
                          <input 
                            type="file" 
                            accept="video/mp4,video/*" 
                            onChange={uploadWelcomeVideoFile} 
                            style={{ fontSize:'0.82rem', color:'#5c6d80' }} 
                          />
                          {uploadingWelcomeVideo && <p style={{ fontSize:'0.75rem', color:'#0F4C81', fontWeight:600, margin:'0.4rem 0 0' }}>⏳ Subiendo video de bienvenida...</p>}
                        </div>

                        {cfg.rePageWelcomeVideo && (
                          <div style={{ marginTop:'1rem' }}>
                            <span style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>Vista previa del Video de Bienvenida:</span>
                            {cfg.rePageWelcomeVideo.includes('youtube.com') || cfg.rePageWelcomeVideo.includes('youtu.be') ? (
                              <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>Enlace de YouTube detectado (Vista previa de video disponible en la página pública).</p>
                            ) : (
                              <video 
                                src={cfg.rePageWelcomeVideo} 
                                controls 
                                muted 
                                style={{ width:'100%', height:180, borderRadius:12, objectFit:'cover', background:'#000' }} 
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </AdminSection>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: Services */}
            {reSubTab === 'services' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
                {/* Formulario para agregar/editar servicio */}
                <div>
                  <AdminSection title={isEditingRealEstate ? 'Editar Servicio Inmobiliario' : 'Añadir Servicio Inmobiliario'} icon="🏢">
                    <form onSubmit={saveRealEstate} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Título (Español) *" value={realEstateForm.title} onChange={e => setRealEstateForm(s => ({ ...s, title: e.target.value }))} placeholder="Ej: Gestión de Rentas Cortas" />
                        <Field label="Título (Inglés)" value={realEstateForm.titleEn} onChange={e => setRealEstateForm(s => ({ ...s, titleEn: e.target.value }))} placeholder="Ej: Short-Term Rental Management" />
                      </div>

                      <Field label="Descripción (Español) *" value={realEstateForm.description} onChange={e => setRealEstateForm(s => ({ ...s, description: e.target.value }))} multiline placeholder="Escribe aquí los detalles del servicio en español..." />
                      <Field label="Descripción (Inglés)" value={realEstateForm.descriptionEn} onChange={e => setRealEstateForm(s => ({ ...s, descriptionEn: e.target.value }))} multiline placeholder="Escribe aquí los detalles del servicio en inglés..." />

                      <SelectField
                        label="Icono Visual"
                        value={realEstateForm.icon}
                        onChange={e => setRealEstateForm(s => ({ ...s, icon: e.target.value }))}
                        options={[
                          { label: '🔑 Llave (Key / Gestión)', value: 'Key' },
                          { label: '📈 Gráfico de Crecimiento (TrendingUp / Inversión)', value: 'TrendingUp' },
                          { label: '💼 Portafolio / Maletín (Briefcase / Consultoría)', value: 'Briefcase' },
                          { label: '🏠 Casa (Home / Inmobiliaria)', value: 'Home' },
                          { label: '🛡️ Escudo de Seguridad (Shield / Confianza)', value: 'Shield' },
                          { label: '👥 Personas / Clientes (Users / Asesoría)', value: 'Users' }
                        ]}
                      />

                      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                        {(isEditingRealEstate || realEstateForm.title) && (
                          <button type="button" onClick={clearRealEstateForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                            Cancelar
                          </button>
                        )}
                        <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                          {isEditingRealEstate ? 'Guardar Cambios' : 'Añadir Servicio'}
                        </button>
                      </div>
                    </form>
                  </AdminSection>
                </div>

                {/* Lista de servicios */}
                <div>
                  <AdminSection title="Servicios Inmobiliarios Registrados" icon="📋">
                    <p style={{ fontSize:'0.78rem', color:'#5c6d80', margin:'0 0 1.2rem', lineHeight:1.5 }}>
                      Estos servicios aparecen en la sección de <strong>Inmobiliaria</strong> en la página principal. Puedes reordenarlos usando las flechas de posición.
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                      {(cfg.realEstateServices || []).length === 0 ? (
                        <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay servicios inmobiliarios registrados.</p>
                      ) : (
                        (cfg.realEstateServices || []).map((s, idx) => (
                          <div key={s.id || idx} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                            <div style={{ width:44, height:44, borderRadius:10, background:'rgba(196,154,60,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>
                              {s.icon === 'Key' ? '🔑' : s.icon === 'TrendingUp' ? '📈' : s.icon === 'Briefcase' ? '💼' : s.icon === 'Home' ? '🏠' : s.icon === 'Shield' ? '🛡️' : s.icon === 'Users' ? '👥' : '🏢'}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{s.title}</h4>
                              <span style={{ fontSize:'0.7rem', color:'#B0B4B8', display:'block', textTransform:'uppercase', fontWeight:800 }}>{s.titleEn || '(Sin título EN)'}</span>
                              <p style={{ fontSize:'0.75rem', color:'#5c6d80', margin:'0.2rem 0 0', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                {s.description}
                              </p>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                <button disabled={idx === 0} onClick={() => moveRealEstate(idx, 'up')} style={{ border:'none', background:'none', color: idx === 0 ? '#cbd5e1' : '#0F4C81', padding:2, cursor: idx === 0 ? 'default' : 'pointer' }} title="Subir">
                                  <ArrowUp size={16} />
                                </button>
                                <button disabled={idx === (cfg.realEstateServices || []).length - 1} onClick={() => moveRealEstate(idx, 'down')} style={{ border:'none', background:'none', color: idx === (cfg.realEstateServices || []).length - 1 ? '#cbd5e1' : '#0F4C81', padding:2, cursor: idx === (cfg.realEstateServices || []).length - 1 ? 'default' : 'pointer' }} title="Bajar">
                                  <ArrowDown size={16} />
                                </button>
                              </div>
                              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                                <button onClick={() => startEditRealEstate(s)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.3rem 0.6rem', borderRadius:6, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                                  Editar
                                </button>
                                <button onClick={() => deleteRealEstate(s.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.3rem 0.6rem', borderRadius:6, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                                  Borrar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </AdminSection>
                </div>
              </div>
            )}

            {/* Sub-tab: Videos */}
            {reSubTab === 'videos' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
                <div>
                  <AdminSection title="Añadir Video de Proyecto" icon="🎬">
                    <form onSubmit={addProjectVideo} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Título del Video (Español) *" value={projectVideoForm.title} onChange={e => setProjectVideoForm({ ...projectVideoForm, title: e.target.value })} placeholder="Ej: Recorrido del Proyecto" />
                        <Field label="Título del Video (Inglés)" value={projectVideoForm.titleEn} onChange={e => setProjectVideoForm({ ...projectVideoForm, titleEn: e.target.value })} placeholder="Ej: Project Tour" />
                      </div>
                      
                      <Field 
                        label="URL del Video (MP4 o enlace de YouTube)" 
                        value={projectVideoForm.url} 
                        onChange={e => setProjectVideoForm({ ...projectVideoForm, url: e.target.value })} 
                        placeholder="Ej: https://.../video.mp4" 
                      />

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field 
                          label="Descripción del Video (Español)" 
                          value={projectVideoForm.description || ''} 
                          onChange={e => setProjectVideoForm({ ...projectVideoForm, description: e.target.value })} 
                          multiline 
                          placeholder="Ej: Recorrido completo del apartamento..." 
                        />
                        <Field 
                          label="Descripción del Video (Inglés)" 
                          value={projectVideoForm.descriptionEn || ''} 
                          onChange={e => setProjectVideoForm({ ...projectVideoForm, descriptionEn: e.target.value })} 
                          multiline 
                          placeholder="Ej: Full apartment tour..." 
                        />
                      </div>

                      <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
                          O subir video desde PC (Recomendado: Aspecto 16:9, resolución 1080p o 720p, peso máximo 20MB, formato .mp4)
                        </label>
                        <input 
                          type="file" 
                          accept="video/mp4,video/*" 
                          onChange={uploadProjectVideoFile} 
                          style={{ fontSize:'0.82rem', color:'#5c6d80' }} 
                        />
                        {uploadingVideo && <p style={{ fontSize:'0.75rem', color:'#0F4C81', fontWeight:600, margin:'0.4rem 0 0' }}>⏳ Subiendo video a Supabase...</p>}
                      </div>

                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                          Añadir Video
                        </button>
                      </div>
                    </form>
                  </AdminSection>
                </div>

                <div>
                  <AdminSection title="Videos Guardados" icon="📋">
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                      {(cfg.rePageVideos || []).length === 0 ? (
                        <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay videos guardados para la inmobiliaria.</p>
                      ) : (
                        (cfg.rePageVideos || []).map((vid, idx) => (
                          <div key={idx} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{vid.title}</h4>
                              {vid.description && (
                                <p style={{ fontSize:'0.75rem', color:'#5c6d80', margin:'0.2rem 0 0.1rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{vid.description}</p>
                              )}
                              <span style={{ fontSize:'0.7rem', color:'#cbd5e1', display:'block' }}>{vid.url}</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => deleteProjectVideo(idx)} 
                              style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}
                            >
                              Eliminar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </AdminSection>
                </div>
              </div>
            )}

            {/* Sub-tab: Portfolio (Legacy key 'gallery') */}
            {reSubTab === 'gallery' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
                <div>
                  <AdminSection title={isEditingPortfolio ? 'Editar Propiedad del Portafolio' : 'Añadir Propiedad al Portafolio'} icon="🏢">
                    <form onSubmit={savePortfolioItem} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Título / Nombre (Español) *" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })} placeholder="Ej: Penthouse Chicó Reservado" />
                        <Field label="Título / Nombre (Inglés)" value={portfolioForm.titleEn} onChange={e => setPortfolioForm({ ...portfolioForm, titleEn: e.target.value })} placeholder="Ej: Chico Reservado Penthouse" />
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Ubicación (Español)" value={portfolioForm.location} onChange={e => setPortfolioForm({ ...portfolioForm, location: e.target.value })} placeholder="Ej: Chicó, Bogotá" />
                        <Field label="Ubicación (Inglés)" value={portfolioForm.locationEn} onChange={e => setPortfolioForm({ ...portfolioForm, locationEn: e.target.value })} placeholder="Ej: Chico, Bogota" />
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Especificaciones (Español)" value={portfolioForm.specs} onChange={e => setPortfolioForm({ ...portfolioForm, specs: e.target.value })} placeholder="Ej: 3 Hab • 4 Baños • 150m²" />
                        <Field label="Especificaciones (Inglés)" value={portfolioForm.specsEn} onChange={e => setPortfolioForm({ ...portfolioForm, specsEn: e.target.value })} placeholder="Ej: 3 Beds • 4 Baths • 1,610 sqft" />
                      </div>

                      <Field label="Precio (Ej: $950.000.000 COP o Consultar)" value={portfolioForm.price} onChange={e => setPortfolioForm({ ...portfolioForm, price: e.target.value })} placeholder="Ej: $950.000.000 COP" />

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                        <Field label="Descripción Detallada (Español)" value={portfolioForm.description || ''} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })} multiline placeholder="Describe detalladamente la vivienda..." />
                        <Field label="Descripción Detallada (Inglés)" value={portfolioForm.descriptionEn || ''} onChange={e => setPortfolioForm({ ...portfolioForm, descriptionEn: e.target.value })} multiline placeholder="Detailed description of the property..." />
                      </div>

                      <div>
                        <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
                          Fotos de la Propiedad (Sube hasta 4 fotos. La primera será la foto de portada)
                        </label>
                        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.8rem' }}>
                          {(portfolioForm.images || []).map((imgUrl, idx) => (
                            <div key={idx} style={{ position:'relative', width:80, height:80, borderRadius:12, overflow:'hidden', border:'1px solid #E6E7E8' }}>
                              <img src={imgUrl} alt={`prop-img-${idx}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              <button 
                                type="button" 
                                onClick={() => removePortfolioFormPhoto(idx)} 
                                style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:'50%', border:'none', background:'#FF385C', color:'white', fontSize:'0.6rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:5 }}
                              >
                                ✕
                              </button>
                              {idx === 0 && (
                                <span style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(10,53,96,0.85)', color:'white', fontSize:'0.55rem', textAlign:'center', display:'block', padding:'2px 0', fontWeight:600 }}>Portada</span>
                              )}
                            </div>
                          ))}
                          
                          {(portfolioForm.images || []).length < 4 && (
                            <div style={{ position:'relative', width:80, height:80, borderRadius:12, border:'2px dashed #B0B4B8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', cursor:'pointer' }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={uploadPortfolioPhoto} 
                                style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} 
                              />
                              <span style={{ fontSize:'1.2rem', color:'#5c6d80' }}>+</span>
                              <span style={{ fontSize:'0.55rem', color:'#5c6d80', fontWeight:600 }}>Subir</span>
                            </div>
                          )}
                        </div>
                        {uploadingPortfolioPhoto && <p style={{ fontSize:'0.75rem', color:'#0F4C81', fontWeight:600, margin:'0.4rem 0 0' }}>⏳ Subiendo foto...</p>}
                      </div>

                      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                        {(isEditingPortfolio || portfolioForm.title || (portfolioForm.images || []).length > 0) && (
                          <button type="button" onClick={clearPortfolioForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                            Cancelar
                          </button>
                        )}
                        <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                          {isEditingPortfolio ? 'Guardar Cambios' : 'Añadir Propiedad'}
                        </button>
                      </div>
                    </form>
                  </AdminSection>
                </div>

                <div>
                  <AdminSection title="Propiedades en el Portafolio" icon="📋">
                    <p style={{ fontSize:'0.78rem', color:'#5c6d80', margin:'0 0 1.2rem', lineHeight:1.5 }}>
                      Estas propiedades aparecen en la sección "Portafolio de Espacios & Propiedades" de la página de Inmobiliaria. Haz clic en una para editar sus detalles.
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                      {((cfg.rePageGallery || []).map((item, idx) => {
                        if (typeof item === 'string') {
                          return {
                            id: `legacy-${idx}`,
                            title: `Espacio ${idx + 1}`,
                            titleEn: `Space ${idx + 1}`,
                            description: '',
                            descriptionEn: '',
                            price: '',
                            location: '',
                            locationEn: '',
                            specs: '',
                            specsEn: '',
                            images: [item]
                          };
                        }
                        return item;
                      })).length === 0 ? (
                        <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay propiedades registradas en el portafolio.</p>
                      ) : (
                        ((cfg.rePageGallery || []).map((item, idx) => {
                          const p = typeof item === 'string' ? {
                            id: `legacy-${idx}`,
                            title: `Espacio ${idx + 1}`,
                            titleEn: `Space ${idx + 1}`,
                            description: '',
                            descriptionEn: '',
                            price: '',
                            location: '',
                            locationEn: '',
                            specs: '',
                            specsEn: '',
                            images: [item]
                          } : item;

                          return (
                            <div key={p.id || idx} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f8fafc', padding:'0.8rem', borderRadius:16, border:'1px solid #E6E7E8' }}>
                              <img src={p.images?.[0]} alt={p.title} style={{ width:54, height:54, borderRadius:10, objectFit:'cover' }} />
                              <div style={{ flex:1, minWidth:0 }}>
                                <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{p.title}</h4>
                                {p.price && <span style={{ fontSize:'0.75rem', color:'var(--orange)', fontWeight:800, display:'block' }}>{p.price}</span>}
                                {p.specs && <span style={{ fontSize:'0.7rem', color:'#5c6d80', display:'block' }}>{p.specs}</span>}
                              </div>
                              <div style={{ display:'flex', gap:'0.3rem' }}>
                                <button onClick={() => startEditPortfolioItem(p)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.3rem 0.6rem', borderRadius:6, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                                  Editar
                                </button>
                                <button onClick={() => deletePortfolioItem(p.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.3rem 0.6rem', borderRadius:6, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                                  Borrar
                                </button>
                              </div>
                            </div>
                          );
                        }))
                      )}
                    </div>
                  </AdminSection>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'legal' && (
          /* TAB: EDITAR PÁGINAS LEGALES DINÁMICAS */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>

            {/* Formulario para agregar/editar página */}
            <div>
              <AdminSection title={isEditingLegalPage ? 'Editar Página Legal' : 'Agregar Página Legal'} icon="⚖️">
                <form onSubmit={saveLegalPage} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'0.8rem', alignItems:'end' }}>
                    <Field label="Icono" value={legalPageForm.icon} onChange={e => setLegalPageForm(p => ({ ...p, icon: e.target.value }))} placeholder="📄" />
                    <Field label="Título de la página *" value={legalPageForm.title} onChange={e => setLegalPageForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Política de Cancelación" />
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>Contenido *</label>
                    <textarea
                      value={legalPageForm.content}
                      onChange={e => setLegalPageForm(p => ({ ...p, content: e.target.value }))}
                      rows={8}
                      placeholder="Escribe aquí el contenido legal de esta página..."
                      style={{ width:'100%', padding:'0.9rem 1rem', border:'1.5px solid #E6E7E8', borderRadius:12, fontSize:'0.88rem', fontFamily:'Outfit,sans-serif', color:'#0d1724', outline:'none', resize:'vertical', lineHeight:1.6 }}
                    />
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', fontWeight:600, color:'#0d1724', cursor:'pointer' }}>
                      <input
                        type="checkbox"
                        checked={legalPageForm.is_active}
                        onChange={e => setLegalPageForm(p => ({ ...p, is_active: e.target.checked }))}
                        style={{ width:16, height:16, accentColor:'#F57C00' }}
                      />
                      Página activa (visible en el sitio)
                    </label>
                  </div>

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                    {(isEditingLegalPage || legalPageForm.title) && (
                      <button type="button" onClick={clearLegalPageForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingLegalPage ? 'Guardar Cambios' : 'Agregar Página'}
                    </button>
                  </div>
                </form>
              </AdminSection>

              <div style={{ marginTop:'1.5rem' }}>
                <AdminSection title="Encabezado de la Página Legal" icon="🏷️">
                  <Field label="Tag Superior" name="legalTag" value={cfg.legalTag || ''} onChange={handle} />
                  <Field label="Título de la Página" name="legalTitle" value={cfg.legalTitle || ''} onChange={handle} />
                  <Field label="Subtítulo / Introducción" name="legalSubtitle" value={cfg.legalSubtitle || ''} onChange={handle} multiline />
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                    <button onClick={() => handleSave()} style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      Guardar Encabezado
                    </button>
                  </div>
                </AdminSection>
              </div>
            </div>

            {/* Lista de páginas registradas */}
            <div>
              <AdminSection title="Páginas Legales Registradas" icon="📚">
                <p style={{ fontSize:'0.78rem', color:'#5c6d80', margin:'0 0 1rem', lineHeight:1.5 }}>
                  Activa o desactiva páginas para que aparezcan o no en <strong>/legal</strong>. Puedes editar el contenido o agregar nuevas.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {(cfg.legalPages || []).length === 0 ? (
                    <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay páginas legales registradas.</p>
                  ) : (
                    (cfg.legalPages || []).map(p => (
                      <div key={p.id} style={{ display:'flex', alignItems:'flex-start', gap:'0.8rem', background:'#f8fafc', padding:'1rem 1.2rem', borderRadius:16, border:`1px solid ${p.is_active ? '#E6E7E8' : 'rgba(239,68,68,0.2)'}` }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
                            <span style={{ fontSize:'1.1rem' }}>{p.icon}</span>
                            <h4 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0d1724', margin:0 }}>{p.title}</h4>
                            <span style={{
                              display:'inline-flex', alignItems:'center', fontSize:'0.6rem', fontWeight:800,
                              background: p.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: p.is_active ? '#059669' : '#dc2626',
                              border: `1px solid ${p.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              borderRadius:50, padding:'0.15rem 0.5rem'
                            }}>
                              {p.is_active ? 'Activa' : 'Oculta'}
                            </span>
                          </div>
                          <p style={{ fontSize:'0.75rem', color:'#5c6d80', margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                            {p.content || '(Sin contenido)'}
                          </p>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', flexShrink:0 }}>
                          <button
                            onClick={() => toggleLegalPage(p.id)}
                            style={{ border:'none', background: p.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: p.is_active ? '#dc2626' : '#059669', padding:'0.35rem 0.7rem', borderRadius:8, fontSize:'0.7rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                            {p.is_active ? '🚫 Ocultar' : '✅ Activar'}
                          </button>
                          <button
                            onClick={() => startEditLegalPage(p)}
                            style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.35rem 0.7rem', borderRadius:8, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => deleteLegalPage(p.id)}
                            style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.35rem 0.7rem', borderRadius:8, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                            🗑️ Eliminar
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
