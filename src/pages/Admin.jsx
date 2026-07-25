import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, RotateCcw, AlertTriangle, Eye, ArrowUp, ArrowDown, Search, FileText, Upload, X, Check, EyeOff } from 'lucide-react';
import { saveConfig, resetConfig, DEFAULTS, uploadImage } from '../utils/db';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { SITE } from '../config/site';
import ImageUploader from '../components/ImageUploader';
import { addWatermarkToImage } from '../utils/watermark';

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
function Field({ label, name, value, onChange, type = 'text', hint, multiline, disabled }) {
  const common = {
    width:'100%', padding:'0.7rem 1rem',
    border:'1.5px solid #E6E7E8', borderRadius:12,
    fontSize:'0.88rem', fontFamily:'Outfit,sans-serif',
    color: disabled ? '#8c9ba5' : '#0d1724', outline:'none',
    background: disabled ? '#f1f5f9' : 'white',
    transition:'border-color 0.2s',
  };
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
        {label}
      </label>
      {multiline
        ? <textarea name={name} value={value} onChange={onChange} rows={4} style={{ ...common, resize:'vertical' }} disabled={disabled} />
        : <input type={type} name={name} value={value} onChange={onChange} style={common} disabled={disabled} />
      }
      {hint && <p style={{ fontSize:'0.7rem', color:'#B0B4B8', marginTop:'0.3rem', margin:0 }}>{hint}</p>}
    </div>
  );
}

// ── Select field ────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, hint, disabled }) {
  const common = {
    width:'100%', padding:'0.7rem 1rem',
    border:'1.5px solid #E6E7E8', borderRadius:12,
    fontSize:'0.88rem', fontFamily:'Outfit,sans-serif',
    color: disabled ? '#8c9ba5' : '#0d1724', outline:'none',
    background: disabled ? '#f1f5f9' : 'white',
    transition:'border-color 0.2s',
  };
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#5c6d80', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
        {label}
      </label>
      <select name={name} value={value} onChange={onChange} style={common} disabled={disabled}>
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

  // --- Portal de Asesores y Contratos ---
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentForm, setAgentForm] = useState({ id: '', name: '', phone: '', email: '', emergency_contact_phone: '', blood_type: '', address: '', allergies: '', base_salary: 0, commission_per_contract: 0, active: true, password: '' });
  const [isEditingAgent, setIsEditingAgent] = useState(false);

  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [contractSettings, setContractSettings] = useState(null);
  const [loadingContractSettings, setLoadingContractSettings] = useState(false);
  const [contractSettingsForm, setContractSettingsForm] = useState({ logo_url: '', contract_text: '', last_code_number: 0, client_email_webhook: '' });

  const DEFAULT_CONTRACT_FORM = {
    id: '', agent_id: '', client_name: '', property_address: '', code: '',
    mandante1: { razonSocial: '', nombre: '', documento: '', tipoDoc: 'CC', expedido: '', fechaNacimiento: '', telefono: '', celular: '', direccion: '', casaApto: '', torre: '', barrio: '', conjunto: '', ciudad: '', email: '', direccionOficina: '', barrioOficina: '', ciudadOficina: '', regimen: 'No responsable de IVA', agenteRetenedor: 'No', pep: 'No', pepTipo: '' },
    mandante2: { razonSocial: '', nombre: '', documento: '', tipoDoc: 'CC', expedido: '', fechaNacimiento: '', telefono: '', celular: '', direccion: '', casaApto: '', torre: '', barrio: '', conjunto: '', ciudad: '', email: '', direccionOficina: '', barrioOficina: '', ciudadOficina: '', regimen: 'No responsable de IVA', agenteRetenedor: 'No', pep: 'No', pepTipo: '' },
    pagoRenta: { formaPago: 'Transferencia Bancaria', cuentaNumero: '', banco: '', tipoCuenta: 'Ahorros', ciudadApertura: '', titularCuenta: '', titularDocumento: '', titularDocTipo: 'CC' },
    emergencia: { nombre: '', documento: '', tipoDoc: 'CC', expedido: '', direccion: '', barrio: '', ciudad: '', celular: '', parentesco: '', email: '' },
    cedula_frontal_url: '', cedula_reversa_url: '', rut_url: '', camara_comercio_url: '',
    inmueble: { consignacion: 'Consignación', codigoInmueble: '', destinacion: 'Vivienda', predioMayor: 'No', direccion: '', barrio: '', ciudad: 'Bogotá', estrato: '4', areaConstruida: '', areaCubierta: '', areaDescubierta: '', regularizacionUso: 'Si', pot: '', matricula: '', catastro: '', tipoInmuebleVivienda: 'Apartamento', tipoCocina: 'Integral', tipoPisosVivienda: 'Madera laminada', nivelesVivienda: '1', banosVivienda: '1', salaComedorInd: false, ventilador: false, aireAcondicionado: false, aireCant: '', alcobaConBano: false, alcobaSinBano: false, balcon: false, terraza: false, estudio: false, hallTv: false, patio: false, zonaRopas: false, calentador: false, lavadero: false, closets: false, empotrados: false, rejasVivienda: false, cantLlaves: '', codigoLlaves: '', tipoInmuebleComercio: 'Local', tipoPisosComercio: 'Baldosa', tipoCubierta: 'Losa', tipoEstructura: 'Concreto', nivelesComercio: '1', zonaOficinas: false, salones: '', celaduriaComercio: false, alturaEntrepiso: '', banosComercio: '1', cableadoEstructurado: false, zonaDescargue: false, aguaComercio: false, luzComercio: false, gasIndustrial: false, subestacionElectrica: false, mezanine: false, capacidadPesoMezanine: '', aireComercio: '' },
    parqueadero: { tieneParqueadero: false, numeroParqueadero: '', comunal: false, tipoParqueadero: 'Cubierto', controlRemoto: false, tarjeta: false, tieneLocker: false, numeroLocker: '' },
    zonaSocial: { conjuntoCerrado: false, zonaJuegos: false, ascensor: false, piscina: false, salonSocial: false, citofono: false, gimnasio: false, bbq: false, caldera: false, celaduría: '24 horas' },
    evidence_images: [],
    canon: { valorCanon: '', canonIntegral: 'No', sostenimientoIncluido: false, pagarSostenimiento: false, sostenimientoEncargado: '', adminConDesc: '', adminSinDesc: '', adminIncluidaContrato: false, copropiedadNombre: '', copropiedadNit: '', copropiedadContacto: '', administradorNombre: '', horarioTrasteos: '', recoleccionServicios: false, recoleccionEncargado: '', pagoAdmin: false, pagoAdminEncargado: '', provisionServicios: false, tieneMasInmuebles: false, pagaPublicidad: false, valorPublicidad: '', valorPolizaServicios: '', valorAsegurado: '', observaciones: '', geoReferenciacion: '', librePleitos: true, compartidoInmobiliaria: false },
    documentos: { cedulas: false,  tradicionLibertad: false, rut: false, recibosPublicos: false, reciboAdmin: false, impuestoPredial: false, escrituras: false, propiedadHorizontal: false, normasConvivencia: false, nomenclatura: false,  licenciaConstruccion: false, planos: false },
    firma: { ciudadFirma: 'Bogotá', fechaFirma: '', captadoPor: '', medioContacto: 'WhatsApp' }
  };

  const [contractForm, setContractForm] = useState(DEFAULT_CONTRACT_FORM);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractFormStep, setContractFormStep] = useState(1);

  const [heroImgUrl, setHeroImgUrl] = useState('');

  // Role and Agent Context
  const [userRole, setUserRole] = useState(null); // 'admin', 'agent', 'unauthorized'
  const [currentAgent, setCurrentAgent] = useState(null);

  // Advisor self-registration states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regBloodType, setRegBloodType] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

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

  // Estados para acordeones de formularios de apartamentos
  const [openAirbnb, setOpenAirbnb] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openQRs, setOpenQRs] = useState(false);

  // Estados para CRUD de propiedades (apartamentos)
  const [propForm, setPropForm] = useState({
    id: '', name: '', description: '', location: '', address: '', wifiSSID: '', wifiPassword: '', price: '',
    bedrooms: 1, beds: 1, baths: 1, guests: 2, isAirbnb: true,
    airbnbListing: '', airbnbBooking: '', airbnbReviews: '', airbnbContact: '', airbnbCalendar: '', airbnbRules: '', airbnbSafety: '', airbnbEmbedId: '',
    bookingLink: '', whatsappNumber: '',
    images: [], customWifiQR: '', customGuideQR: '', customWhatsappQR: ''
  });
  const [isEditingProp, setIsEditingProp] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    if (activeTab === 'leads') {
      const fetchLeads = async () => {
        setLoadingLeads(true);
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          setLeads(data || []);
        } catch (err) {
          console.error('Error fetching leads:', err);
        } finally {
          setLoadingLeads(false);
        }
      };
      fetchLeads();
    }
  }, [activeTab]);

  useEffect(() => {
    if (dbConfig && Object.keys(dbConfig).length > 0) {
      setCfg(dbConfig);
    }
  }, [dbConfig]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const { data, error } = await supabase
        .from('external_agents')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchContracts = async () => {
    setLoadingContracts(true);
    try {
      let query = supabase
        .from('mandate_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole === 'agent' && currentAgent) {
        query = query.eq('agent_id', currentAgent.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchContractSettings = async () => {
    setLoadingContractSettings(true);
    try {
      const { data, error } = await supabase
        .from('contract_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setContractSettings(data);
        setContractSettingsForm({
          logo_url: data.logo_url || '',
          contract_text: data.contract_text || '',
          last_code_number: data.last_code_number || 0,
          client_email_webhook: data.client_email_webhook || ''
        });
      }
    } catch (err) {
      console.error('Error fetching contract settings:', err);
    } finally {
      setLoadingContractSettings(false);
    }
  };

  useEffect(() => {
    if (!session?.user) {
      setUserRole(null);
      setCurrentAgent(null);
      return;
    }

    const checkRole = async () => {
      try {
        const userEmail = session.user.email;

        // Check if the user is in external_agents
        const { data: agentData, error } = await supabase
          .from('external_agents')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        if (error) throw error;

        if (agentData) {
          if (!agentData.active) {
            setUserRole('unauthorized');
            setCurrentAgent(null);
          } else {
            setUserRole('agent');
            setCurrentAgent(agentData);
            setActiveTab('contracts'); // Force advisor to contracts tab
          }
        } else {
          setUserRole('admin');
        }
      } catch (err) {
        console.error('Error during role verification:', err);
        setUserRole('admin');
      }
    };

    checkRole();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (activeTab === 'agents') {
      fetchAgents();
      fetchContracts();
    } else if (activeTab === 'contracts') {
      fetchContracts();
      fetchAgents();
    } else if (activeTab === 'contract-settings') {
      fetchContractSettings();
    }
  }, [activeTab, userRole, currentAgent, session]);

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

    const handleRegister = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setRegError('');
      setRegSuccess('');

      try {
        if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
          throw new Error("Por favor completa los campos obligatorios (*)");
        }

        // 1. Sign up user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
        });

        if (authError) throw authError;

        // 2. Insert into external_agents as inactive
        const { error: dbError } = await supabase
          .from('external_agents')
          .insert({
            name: regName,
            email: regEmail,
            phone: regPhone,
            active: false,
            base_salary: 0,
            commission_per_contract: 0,
            emergency_contact_phone: regEmergencyPhone,
            blood_type: regBloodType,
            address: regAddress,
            password: regPassword
          });

        if (dbError) throw dbError;

        setRegSuccess("¡Registro exitoso! Tu cuenta está en espera de aprobación por el administrador.");
        setRegName('');
        setRegPhone('');
        setRegEmail('');
        setRegPassword('');
        setRegEmergencyPhone('');
        setRegBloodType('');
        setRegAddress('');
        setTimeout(() => {
          setIsRegistering(false);
          setRegSuccess('');
        }, 4000);
      } catch (err) {
        setRegError(err.message || "Error al registrarse");
      } finally {
        setIsLoggingIn(false);
      }
    };

    if (isRegistering) {
      return (
        <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#F3F5F8', fontFamily:'Outfit,sans-serif' }}>
          <form onSubmit={handleRegister} style={{ background:'white', padding:'3rem', borderRadius:16, width:450, boxShadow:'0 10px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <h2 style={{ margin:0, color:'#0F4C81', fontSize:'1.6rem' }}>Registro de Asesor</h2>
              <p style={{ margin:'0.5rem 0 0', color:'#5c6d80', fontSize:'0.9rem' }}>Crea tu cuenta de asesor externo</p>
            </div>
            {regError && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'0.8rem', borderRadius:8, marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight:600 }}>{regError}</div>}
            {regSuccess && <div style={{ background:'#d1fae5', color:'#065f46', padding:'0.8rem', borderRadius:8, marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight:600 }}>{regSuccess}</div>}
            
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <Field label="Nombre Completo *" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ej: Carlos Silva" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                <Field label="Teléfono Celular" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Ej: 320 123 4567" />
                <Field label="Correo electrónico *" value={regEmail} onChange={e => setRegEmail(e.target.value)} type="email" placeholder="carlos@gmail.com" />
              </div>
              <Field label="Contraseña *" value={regPassword} onChange={e => setRegPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" />
              <Field label="Dirección de Residencia" value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Ej: Calle 100 # 15-20" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                <Field label="Tipo Sangre (RH)" value={regBloodType} onChange={e => setRegBloodType(e.target.value)} placeholder="Ej: O+" />
                <Field label="Contacto Emergencia" value={regEmergencyPhone} onChange={e => setRegEmergencyPhone(e.target.value)} placeholder="Ej: 300 987 6543" />
              </div>
            </div>

            <button disabled={isLoggingIn} style={{ width:'100%', padding:'1rem', background:'linear-gradient(135deg,#F57C00,#FF9A2F)', color:'white', border:'none', borderRadius:12, marginTop:'2rem', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,124,0,0.3)' }}>
              {isLoggingIn ? 'Registrando...' : 'Registrarse'}
            </button>
            
            <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
              <button type="button" onClick={() => setIsRegistering(false)} style={{ background:'none', border:'none', color:'#0F4C81', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#F3F5F8', fontFamily:'Outfit,sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background:'white', padding:'3rem', borderRadius:16, width:420, boxShadow:'0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h2 style={{ margin:0, color:'#0F4C81', fontSize:'1.6rem' }}>Acceso Administrador / Asesor</h2>
            <p style={{ margin:'0.5rem 0 0', color:'#5c6d80', fontSize:'0.9rem' }}>Ingresa tus credenciales de Rentun Group</p>
          </div>
          {loginError && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'0.8rem', borderRadius:8, marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight:600 }}>{loginError}</div>}
          <Field label="Correo electrónico" name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <div style={{ marginTop:'1.2rem' }}>
            <Field label="Contraseña" name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
          </div>
          <button disabled={isLoggingIn} style={{ width:'100%', padding:'1rem', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', border:'none', borderRadius:12, marginTop:'2rem', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(15,76,129,0.3)' }}>
            {isLoggingIn ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
          
          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <button type="button" onClick={() => setIsRegistering(true)} style={{ background:'none', border:'none', color:'#F57C00', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
              ¿Eres nuevo asesor? Regístrate aquí
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (userRole === 'unauthorized') {
    return (
      <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#F3F5F8', fontFamily:'Outfit,sans-serif' }}>
        <div style={{ background:'white', padding:'3rem', borderRadius:16, width:450, boxShadow:'0 10px 40px rgba(0,0,0,0.08)', textAlign:'center' }}>
          <AlertTriangle size={48} style={{ color:'#FF385C', marginBottom:'1.5rem', display:'inline-block' }} />
          <h2 style={{ margin:0, color:'#0F4C81', fontSize:'1.4rem' }}>Cuenta en Espera de Aprobación</h2>
          <p style={{ margin:'1rem 0 2rem', color:'#5c6d80', fontSize:'0.9rem', lineHeight:1.6 }}>
            Hola, tu perfil de asesor ha sido registrado correctamente. Para poder acceder al portal de creación de contratos, un administrador de Rentun Group debe revisar y activar tu cuenta.
          </p>
          <button onClick={() => supabase.auth.signOut()} style={{ width:'100%', padding:'1rem', background:'#0F4C81', color:'white', border:'none', borderRadius:12, fontSize:'0.95rem', fontWeight:700, cursor:'pointer' }}>
            Cerrar Sesión / Volver
          </button>
        </div>
      </div>
    );
  }

  const properties = cfg.properties || [];

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
      bookingLink: p.bookingLink || '',
      whatsappNumber: p.whatsappNumber || '',
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
      bookingLink: '', whatsappNumber: '',
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

  // --- Asesores Externos Helpers ---
  const saveAgent = async (e) => {
    if (e) e.preventDefault();
    if (!agentForm.name) {
      alert('El nombre es obligatorio.');
      return;
    }
    try {
      let err;
      const payload = {
        name: agentForm.name,
        phone: agentForm.phone || '',
        email: agentForm.email || '',
        emergency_contact_phone: agentForm.emergency_contact_phone || '',
        blood_type: agentForm.blood_type || '',
        address: agentForm.address || '',
        allergies: agentForm.allergies || '',
        base_salary: Number(agentForm.base_salary || 0),
        commission_per_contract: Number(agentForm.commission_per_contract || 0),
        active: agentForm.active ?? true,
        password: agentForm.password || ''
      };

      if (isEditingAgent) {
        const { error } = await supabase
          .from('external_agents')
          .update(payload)
          .eq('id', agentForm.id);
        err = error;
      } else {
        const { error } = await supabase
          .from('external_agents')
          .insert(payload);
        err = error;
      }
      if (err) throw err;
      alert(isEditingAgent ? 'Asesor actualizado con éxito.' : 'Asesor registrado con éxito.');
      clearAgentForm();
      fetchAgents();
    } catch (err) {
      console.error('Error saving agent:', err);
      alert('Error al guardar el asesor: ' + err.message);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm('¿Eliminar este asesor?')) return;
    try {
      const { error } = await supabase
        .from('external_agents')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAgents();
    } catch (err) {
      console.error('Error deleting agent:', err);
      alert('Error al eliminar asesor: ' + err.message);
    }
  };

  const clearAgentForm = () => {
    setAgentForm({ id: '', name: '', phone: '', email: '', emergency_contact_phone: '', blood_type: '', address: '', allergies: '', base_salary: 0, commission_per_contract: 0, active: true, password: '' });
    setIsEditingAgent(false);
  };

  const startEditAgent = (a) => {
    setAgentForm(a);
    setIsEditingAgent(true);
  };

  // --- Configuración de Contratos Helpers ---
  const saveContractSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const { error } = await supabase
        .from('contract_settings')
        .upsert({
          id: 1,
          logo_url: contractSettingsForm.logo_url,
          contract_text: contractSettingsForm.contract_text,
          last_code_number: Number(contractSettingsForm.last_code_number || 0),
          client_email_webhook: contractSettingsForm.client_email_webhook
        });
      if (error) throw error;
      alert('Configuración de contratos guardada con éxito.');
      fetchContractSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error al guardar configuración: ' + err.message);
    }
  };

  // --- Carga de imágenes con Marca de Agua ---
  const handleDocUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const watermarkedBlob = await addWatermarkToImage(file);
      const ext = file.type ? file.type.split('/')[1] : 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadErr } = await supabase.storage
        .from('contracts-docs')
        .upload(fileName, watermarkedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadErr) throw uploadErr;
      
      const { data: publicUrlData } = supabase.storage
        .from('contracts-docs')
        .getPublicUrl(fileName);
        
      const publicUrl = publicUrlData.publicUrl;
      
      setContractForm(prev => ({
        ...prev,
        [fieldName]: publicUrl
      }));
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Error al procesar y subir el archivo: ' + err.message);
    }
  };

  const handleEvidenceUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    for (const file of files) {
      try {
        const watermarkedBlob = await addWatermarkToImage(file);
        const ext = file.type ? file.type.split('/')[1] : 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('contracts-docs')
          .upload(fileName, watermarkedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadErr) throw uploadErr;
        
        const { data: publicUrlData } = supabase.storage
          .from('contracts-docs')
          .getPublicUrl(fileName);
          
        const publicUrl = publicUrlData.publicUrl;
        
        setContractForm(prev => ({
          ...prev,
          evidence_images: [...(prev.evidence_images || []), publicUrl]
        }));
      } catch (err) {
        console.error('Error uploading evidence:', err);
        alert('Error al subir evidencia: ' + err.message);
      }
    }
  };

  const removeEvidenceImg = (index) => {
    setContractForm(prev => ({
      ...prev,
      evidence_images: (prev.evidence_images || []).filter((_, idx) => idx !== index)
    }));
  };

  // --- Contratos CRUD Helpers ---
  const handleSaveContract = async (e) => {
    if (e) e.preventDefault();
    if (!contractForm.client_name || !contractForm.property_address) {
      alert('El nombre del mandante y la dirección del inmueble son obligatorios.');
      return;
    }
    
    try {
      let nextCode = contractForm.code;
      
      if (!isEditingContract) {
        // Obtener configuración para ver el último código
        const { data: settingsData, error: settingsErr } = await supabase
          .from('contract_settings')
          .select('*')
          .eq('id', 1)
          .single();
          
        if (settingsErr) throw settingsErr;
        
        const nextNum = (settingsData?.last_code_number || 0) + 1;
        nextCode = `RENTUN-${String(nextNum).padStart(4, '0')}`;
        
        // Incrementar en settings
        const { error: updateSettingsErr } = await supabase
          .from('contract_settings')
          .update({ last_code_number: nextNum })
          .eq('id', 1);
          
        if (updateSettingsErr) throw updateSettingsErr;
      }
      
      const payload = {
        agent_id: contractForm.agent_id || null,
        client_name: contractForm.client_name,
        property_address: contractForm.property_address,
        contract_data: {
          ...contractForm,
          code: nextCode // Guardar el código dentro del JSON también
        }
      };
      
      let dbErr;
      if (isEditingContract) {
        const { error } = await supabase
          .from('mandate_contracts')
          .update(payload)
          .eq('id', contractForm.id);
        dbErr = error;
      } else {
        const { error } = await supabase
          .from('mandate_contracts')
          .insert({
            ...payload,
            code: nextCode
          });
        dbErr = error;
      }
      
      if (dbErr) throw dbErr;

      // Enviar correo al cliente (Mandante 1) usando nuestro propio servicio interno de mailer
      if (contractForm.mandante1.email) {
        // Enviar a nuestro servicio propio /api/send-email (Vercel serverless nodemailer)
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: contractForm.mandante1.nombre || contractForm.client_name,
            client_email: contractForm.mandante1.email,
            contract_code: nextCode,
            property_address: contractForm.property_address,
            print_link: `${window.location.origin}/imprimir-contrato/${nextCode}`
          })
        })
        .then(res => res.json())
        .then(resData => console.log("Internal mailer response:", resData))
        .catch(e => console.error("Error calling internal mailer:", e));

        // Adicionalmente, disparar el webhook personalizado si el administrador configuró uno
        if (contractSettingsForm.client_email_webhook) {
          fetch(contractSettingsForm.client_email_webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_name: contractForm.mandante1.nombre || contractForm.client_name,
              client_email: contractForm.mandante1.email,
              contract_code: nextCode,
              property_address: contractForm.property_address,
              print_link: `${window.location.origin}/imprimir-contrato/${nextCode}`
            })
          }).catch(e => console.error("Error trigger custom email webhook:", e));
        }
      }

      alert(isEditingContract ? 'Contrato actualizado con éxito!' : `Contrato guardado con el código: ${nextCode}`);
      setShowContractModal(false);
      setContractForm(DEFAULT_CONTRACT_FORM);
      setIsEditingContract(false);
      fetchContracts();
    } catch (err) {
      console.error('Error saving contract:', err);
      alert('Error al guardar contrato: ' + err.message);
    }
  };

  const deleteContract = async (id) => {
    if (!window.confirm('¿Eliminar este contrato de mandato?')) return;
    try {
      const { error } = await supabase
        .from('mandate_contracts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchContracts();
    } catch (err) {
      console.error('Error deleting contract:', err);
      alert('Error al eliminar: ' + err.message);
    }
  };

  const startEditContract = (c) => {
    setContractForm({
      ...DEFAULT_CONTRACT_FORM,
      ...c.contract_data,
      id: c.id,
      agent_id: c.agent_id || '',
      client_name: c.client_name,
      property_address: c.property_address,
      code: c.code
    });
    setIsEditingContract(true);
    setContractFormStep(1);
    setShowContractModal(true);
  };

  const getContractCountForAgent = (agentId) => {
    return contracts.filter(c => c.agent_id === agentId).length;
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
          {userRole === 'admin' && (
            <>
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
            </>
          )}
          <button onClick={() => supabase.auth.signOut()}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.25)', padding:'0.55rem 1.2rem', borderRadius:50, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            🚪 Cerrar Sesión
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
          { id: 'landing', label: '🏠 Inicio', role: 'admin' },
          { id: 'properties', label: '🏨 Apartamentos', role: 'admin' },
          { id: 'guide-info', label: '📋 Info & Reglas', role: 'admin' },
          { id: 'guide-places', label: '📍 Lugares Cercanos', role: 'admin' },
          { id: 'guide-manuals', label: '📖 Manuales de la Casa', role: 'admin' },
          { id: 'guide-faqs', label: '❓ FAQs & Tareas', role: 'admin' },
          { id: 'legal', label: '⚖️ Pág. Legal', role: 'admin' },
          { id: 'leads', label: '👥 Leads de la IA', role: 'admin' },
          { id: 'agents', label: '👥 Asesores Externos', role: 'admin' },
          { id: 'contracts', label: '📄 Contratos Mandato', role: 'both' },
          { id: 'contract-settings', label: '⚙️ Config Contratos', role: 'admin' }
        ]
        .filter(t => t.role === 'both' || userRole === 'admin')
        .map(t => (
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
                      <div style={{ marginTop:'0.8rem' }}>
                        <Field label="Número de WhatsApp para Reservas de este apartamento (con código de país, sin +)" value={propForm.whatsappNumber || ''} onChange={e => setPropForm(p => ({ ...p, whatsappNumber: e.target.value }))} placeholder="Ej: 573219511173" hint="Si se deja vacío, usará el número de WhatsApp de la empresa configurado arriba." />
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

                    {/* Acordeón Enlace de Booking.com */}
                    <div style={{ border:'1px solid #E6E7E8', borderRadius:16, overflow:'hidden', marginTop:'0.8rem' }}>
                      <button type="button" onClick={() => setOpenBooking(!openBooking)}
                              style={{ width:'100%', padding:'0.8rem 1.2rem', background:'#f8fafc', border:'none', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontWeight:700, color:'#003580', fontSize:'0.82rem', fontFamily:'inherit' }}>
                        <span>🔗 Enlace de Booking.com ({openBooking ? 'Ocultar' : 'Mostrar'})</span>
                        <span style={{ fontSize:'0.7rem' }}>{openBooking ? '▲' : '▼'}</span>
                      </button>
                      {openBooking && (
                        <div style={{ padding:'1.2rem', background:'white', borderTop:'1px solid #E6E7E8' }}>
                          <Field label="Link del Listing en Booking.com" value={propForm.bookingLink} onChange={e => setPropForm(p => ({ ...p, bookingLink: e.target.value }))} placeholder="Ej: https://www.booking.com/Share-..." />
                        </div>
                      )}
                    </div>

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

        {activeTab === 'leads' && (
          <div style={{ background:'white', borderRadius:24, border:'1px solid #E6E7E8', padding:'2.2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize:'1.4rem', fontWeight:800, color:'#0F4C81', fontFamily:'var(--font-header, sans-serif)', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
              👥 Leads Capturados por la IA
            </h3>
            <p style={{ fontSize:'0.88rem', color:'#5c6d80', marginBottom:'2rem', lineHeight:1.5 }}>
              Esta tabla muestra a los huéspedes interesados que han completado el formulario de contacto (Habeas Data) antes de dirigirse a WhatsApp, Airbnb o Booking.com.
            </p>

            {loadingLeads ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'3rem', color:'#5c6d80', fontWeight:600 }}>
                ⏳ Cargando leads de la base de datos...
              </div>
            ) : leads.length === 0 ? (
              <div style={{ padding:'3rem 1.5rem', textAlign:'center', background:'#f8fafc', borderRadius:16, border:'1.5px dashed #E6E7E8' }}>
                <p style={{ fontSize:'0.95rem', color:'#5c6d80', fontWeight:600, margin:0 }}>No se han capturado leads todavía.</p>
                <p style={{ fontSize:'0.82rem', color:'#8c9ba5', margin:'0.4rem 0 0' }}>Los prospectos aparecerán aquí cuando hagan clic en los botones de reserva e ingresen sus datos.</p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem', minWidth:'650px' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #E6E7E8', color:'#0F4C81', textAlign:'left', fontWeight:700 }}>
                      <th style={{ padding:'1rem 0.8rem' }}>Fecha</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Nombre</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Teléfono / WhatsApp</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Correo Electrónico</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Plataforma</th>
                      <th style={{ padding:'1rem 0.8rem', textAlign:'center' }}>Habeas Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} style={{ borderBottom:'1px solid #E6E7E8', transition:'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='none'}>
                        <td style={{ padding:'1rem 0.8rem', whiteSpace:'nowrap', color:'#5c6d80' }}>
                          {new Date(l.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td style={{ padding:'1rem 0.8rem', fontWeight:700, color:'#0d1724' }}>{l.name}</td>
                        <td style={{ padding:'1rem 0.8rem' }}>
                          <a 
                            href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              color:'#059669', 
                              textDecoration:'none', 
                              fontWeight:700, 
                              display:'inline-flex', 
                              alignItems:'center', 
                              gap:'0.3rem' 
                            }}
                          >
                            🟢 {l.phone}
                          </a>
                        </td>
                        <td style={{ padding:'1rem 0.8rem', color: l.email ? '#0d1724' : '#8c9ba5', fontStyle: l.email ? 'normal' : 'italic' }}>
                          {l.email || 'No proporcionado'}
                        </td>
                        <td style={{ padding:'1rem 0.8rem' }}>
                          <span style={{ 
                            fontSize:'0.72rem', 
                            fontWeight:700, 
                            textTransform:'uppercase', 
                            padding:'0.25rem 0.6rem', 
                            borderRadius:50,
                            background: l.destination === 'airbnb' ? 'rgba(255,56,92,0.1)' : (l.destination === 'booking' ? 'rgba(0,53,128,0.1)' : 'rgba(37,211,102,0.1)'),
                            color: l.destination === 'airbnb' ? '#FF385C' : (l.destination === 'booking' ? '#003580' : '#059669')
                          }}>
                            {l.destination || 'whatsapp'}
                          </span>
                        </td>
                        <td style={{ padding:'1rem 0.8rem', textAlign:'center', color:'#059669', fontWeight:800 }}>
                          {l.consent ? '✅ Autorizado' : '❌ No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: ASESORES EXTERNOS --- */}
        {activeTab === 'agents' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(480px, 1fr))', gap:'2rem' }}>
            <div>
              <AdminSection title={isEditingAgent ? "Editar Asesor Externo" : "Registrar Nuevo Asesor Externo"} icon="👥">
                <form onSubmit={saveAgent} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                  <Field label="Nombre Completo *" value={agentForm.name} onChange={e => setAgentForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Juan Pérez" />
                  <Field label="Teléfono Celular" value={agentForm.phone} onChange={e => setAgentForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Ej: 3045788873" />
                  <Field label="Correo Electrónico" value={agentForm.email} onChange={e => setAgentForm(prev => ({ ...prev, email: e.target.value }))} type="email" placeholder="Ej: juan.perez@rentun.com" />
                  <Field label="Contacto Familiar de Emergencia" value={agentForm.emergency_contact_phone} onChange={e => setAgentForm(prev => ({ ...prev, emergency_contact_phone: e.target.value }))} placeholder="Ej: Mamá: 312 456-7890" />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <Field label="Tipo de Sangre" value={agentForm.blood_type} onChange={e => setAgentForm(prev => ({ ...prev, blood_type: e.target.value }))} placeholder="Ej: O+" />
                    <Field label="Alergias" value={agentForm.allergies} onChange={e => setAgentForm(prev => ({ ...prev, allergies: e.target.value }))} placeholder="Ej: NINGUNA" />
                  </div>
                  <Field label="Dirección de Residencia" value={agentForm.address} onChange={e => setAgentForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Calle 12 # 34-56" />
                  <Field label="Contraseña del Asesor" value={agentForm.password} onChange={e => setAgentForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Contraseña de acceso" />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <Field label="Salario Base ($ COP)" value={agentForm.base_salary} onChange={e => setAgentForm(prev => ({ ...prev, base_salary: e.target.value }))} type="number" />
                    <Field label="Comisión por Contrato ($ COP)" value={agentForm.commission_per_contract} onChange={e => setAgentForm(prev => ({ ...prev, commission_per_contract: e.target.value }))} type="number" />
                  </div>
                  {isEditingAgent && (
                    <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', fontWeight:600, color:'#0d1724', cursor:'pointer' }}>
                      <input type="checkbox" checked={agentForm.active} onChange={e => setAgentForm(prev => ({ ...prev, active: e.target.checked }))} style={{ width:16, height:16, accentColor:'#0F4C81' }} />
                      Asesor Activo
                    </label>
                  )}
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
                    {(isEditingAgent || agentForm.name) && (
                      <button type="button" onClick={clearAgentForm} style={{ padding:'0.6rem 1.2rem', borderRadius:50, border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', fontWeight:600, cursor:'pointer' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding:'0.6rem 1.5rem', borderRadius:50, border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', fontWeight:700, cursor:'pointer' }}>
                      {isEditingAgent ? 'Guardar Cambios' : 'Registrar Asesor'}
                    </button>
                  </div>
                </form>
              </AdminSection>
            </div>

            <div>
              <AdminSection title="Asesores Registrados" icon="📇">
                {loadingAgents ? (
                  <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>Cargando asesores...</p>
                ) : agents.length === 0 ? (
                  <p style={{ fontSize:'0.85rem', color:'#5c6d80', fontStyle:'italic' }}>No hay asesores registrados.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {agents.map(a => (
                      <div key={a.id} style={{ border:'1px solid #E6E7E8', borderRadius:16, padding:'1rem', background:'#f8fafc', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <h4 style={{ margin:'0 0 0.3rem 0', color:'#0F4C81', fontWeight:800, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                            {a.name}
                            {!a.active && <span style={{ fontSize:'0.6rem', background:'#fee2e2', color:'#991b1b', padding:'0.1rem 0.4rem', borderRadius:4 }}>Inactivo</span>}
                          </h4>
                          <p style={{ margin:0, fontSize:'0.75rem', color:'#5c6d80' }}>
                            📞 {a.phone || 'Sin tel'} | ✉️ {a.email || 'Sin email'}
                            {a.password && <span style={{ marginLeft: '0.4rem', color: '#0F4C81' }}> | 🔑 <strong>Contraseña:</strong> {a.password}</span>}
                          </p>
                          <p style={{ margin:'0.4rem 0 0', fontSize:'0.75rem', color:'#334155' }}>
                            🩸 <strong>Sangre:</strong> {a.blood_type || 'N/A'} | 🏥 <strong>Emergencia:</strong> {a.emergency_contact_phone || 'N/A'}
                          </p>
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.75rem', color:'#334155' }}>
                            💰 <strong>Salario Base:</strong> ${Number(a.base_salary || 0).toLocaleString('es-CO')} COP
                          </p>
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.75rem', color:'#059669', fontWeight:700 }}>
                            📈 <strong>Comisión/Contrato:</strong> ${Number(a.commission_per_contract || 0).toLocaleString('es-CO')} COP
                          </p>
                          <span style={{ display:'inline-block', marginTop:'0.5rem', fontSize:'0.7rem', fontWeight:800, background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.2rem 0.6rem', borderRadius:50 }}>
                            📑 {getContractCountForAgent(a.id)} Contrato(s)
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
                          <button onClick={() => startEditAgent(a)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteAgent(a.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AdminSection>
            </div>
          </div>
        )}

        {/* --- TAB: CONTRATOS DE MANDATO --- */}
        {activeTab === 'contracts' && (
          <div style={{ background:'white', borderRadius:24, border:'1px solid #E6E7E8', padding:'2.2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
              <div>
                <h3 style={{ fontSize:'1.4rem', fontWeight:800, color:'#0F4C81', margin:0, fontFamily:'var(--font-header, sans-serif)' }}>
                  📄 Gestión de Contratos de Mandato
                </h3>
                <p style={{ fontSize:'0.82rem', color:'#5c6d80', margin:'0.3rem 0 0 0' }}>Crea, edita y genera vistas de impresión de contratos para asesores externos.</p>
              </div>
              <button onClick={() => {
                setContractForm({
                  ...DEFAULT_CONTRACT_FORM,
                  agent_id: userRole === 'agent' && currentAgent ? currentAgent.id : ''
                });
                setIsEditingContract(false);
                setContractFormStep(1);
                setShowContractModal(true);
              }} style={{ padding:'0.75rem 1.8rem', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', border:'none', borderRadius:50, fontWeight:750, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 6px 16px rgba(15,76,129,0.25)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <Plus size={16} /> Crear Nuevo Contrato
              </button>
            </div>

            {/* Buscador */}
            <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.5rem', background:'#f8fafc', padding:'0.8rem 1.2rem', borderRadius:16, border:'1.5px solid #E6E7E8', alignItems:'center' }}>
              <Search size={18} style={{ color:'#8c9ba5' }} />
              <input type="text" placeholder="Buscar por cliente (mandante), código de contrato o dirección..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex:1, border:'none', background:'none', outline:'none', fontSize:'0.88rem', color:'#0d1724', fontFamily:'inherit' }} />
            </div>

            {loadingContracts ? (
              <p style={{ textAlign:'center', color:'#5c6d80', padding:'2rem', fontStyle:'italic' }}>Cargando contratos de mandato...</p>
            ) : contracts.length === 0 ? (
              <p style={{ textAlign:'center', color:'#5c6d80', padding:'2rem', fontStyle:'italic' }}>No se han registrado contratos de mandato todavía.</p>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #E6E7E8', color:'#0F4C81', textAlign:'left', fontWeight:700 }}>
                      <th style={{ padding:'1rem 0.8rem' }}>Código</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Cliente (Mandante)</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Inmueble / Dirección</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Asesor Externo</th>
                      <th style={{ padding:'1rem 0.8rem' }}>Fecha</th>
                      <th style={{ padding:'1rem 0.8rem', textAlign:'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts
                      .filter(c => {
                        const s = searchTerm.toLowerCase();
                        return c.code.toLowerCase().includes(s) || 
                               c.client_name.toLowerCase().includes(s) || 
                               (c.property_address && c.property_address.toLowerCase().includes(s));
                      })
                      .map(c => {
                        const agentObj = agents.find(a => a.id === c.agent_id);
                        return (
                          <tr key={c.id} style={{ borderBottom:'1px solid #E6E7E8', transition:'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='none'}>
                            <td style={{ padding:'1.1rem 0.8rem', fontWeight:850, color:'#F57C00' }}>{c.code}</td>
                            <td style={{ padding:'1.1rem 0.8rem', fontWeight:700, color:'#0d1724' }}>{c.client_name}</td>
                            <td style={{ padding:'1.1rem 0.8rem', color:'#5c6d80' }}>{c.property_address || 'No especificada'}</td>
                            <td style={{ padding:'1.1rem 0.8rem', fontWeight:600 }}>{agentObj ? agentObj.name : 'Interno / Oficina'}</td>
                            <td style={{ padding:'1.1rem 0.8rem', color:'#8c9ba5' }}>{new Date(c.created_at).toLocaleDateString('es-CO')}</td>
                            <td style={{ padding:'1.1rem 0.8rem', textAlign:'right' }}>
                              <div style={{ display:'inline-flex', gap:'0.4rem' }}>
                                <Link to={`/imprimir-contrato/${c.id}`} target="_blank" style={{ textDecoration:'none', border:'none', background:'rgba(5,150,105,0.1)', color:'#059669', padding:'0.45rem 1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.2rem' }}>
                                  👁️ Imprimir
                                </Link>
                                <button onClick={() => startEditContract(c)} style={{ border:'none', background:'rgba(15,76,129,0.1)', color:'#0F4C81', padding:'0.45rem 1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>
                                  Editar
                                </button>
                                <button onClick={() => deleteContract(c.id)} style={{ border:'none', background:'rgba(255,56,92,0.1)', color:'#FF385C', padding:'0.45rem 1rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: CONFIGURACIÓN DE CONTRATOS --- */}
        {activeTab === 'contract-settings' && (
          <div style={{ background:'white', borderRadius:24, border:'1px solid #E6E7E8', padding:'2.2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize:'1.4rem', fontWeight:800, color:'#0F4C81', fontFamily:'var(--font-header, sans-serif)', marginBottom:'0.5rem' }}>
              ⚙️ Configuración General de Contratos
            </h3>
            <p style={{ fontSize:'0.82rem', color:'#5c6d80', marginBottom:'2rem' }}>Define la plantilla de logo, el texto base de las cláusulas legales y controla la numeración de los contratos.</p>
            
            <form onSubmit={saveContractSettings} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ border:'1px solid #cbd5e1', borderRadius:16, padding:'1.5rem', background:'#f8fafc' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Logo Oficial del Contrato</span>
                
                <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
                  <img src={contractSettingsForm.logo_url || '/logos/rentungroupblue.webp'} alt="Contract Logo Preview" style={{ height:60, objectFit:'contain', background:'white', padding:'0.5rem', borderRadius:8, border:'1px solid #cbd5e1' }} />
                  
                  <div style={{ flex:1, minWidth:260 }}>
                    <Field label="URL del Logotipo" value={contractSettingsForm.logo_url} onChange={e => setContractSettingsForm(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="Ej: /logos/logo.webp" />
                    
                    <div style={{ marginTop:'0.5rem' }}>
                      <ImageUploader 
                        id="contractLogoUpload"
                        label="Subir nuevo logo de contrato"
                        onImageSelected={async (base64) => {
                          try {
                            const url = await uploadImage(base64, 'images');
                            setContractSettingsForm(prev => ({ ...prev, logo_url: url }));
                          } catch(e) {
                            alert("Error subiendo logo");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <AdminSection title="Numeración de Código" icon="🔢">
                    <Field label="Último Número Registrado" value={contractSettingsForm.last_code_number} onChange={e => setContractSettingsForm(prev => ({ ...prev, last_code_number: e.target.value }))} type="number" hint="El siguiente contrato creado usará este número + 1. (Ej: Si colocas 10, el siguiente será RENTUN-0011)" />
                  </AdminSection>

                  <AdminSection title="Webhook de Integración (Opcional)" icon="🔗">
                    <Field label="URL de Webhook Externo" value={contractSettingsForm.client_email_webhook} onChange={e => setContractSettingsForm(prev => ({ ...prev, client_email_webhook: e.target.value }))} placeholder="https://hook.us1.make.com/..." hint="Petición POST enviada al guardar un contrato. Útil para conectar con Make, Zapier, Google Sheets o CRMs externos. El correo de confirmación al cliente ya es enviado de forma interna y automática por el sistema." />
                  </AdminSection>
                </div>
                <div>
                  <AdminSection title="Cláusulas Legales Base" icon="📜">
                    <textarea 
                      value={contractSettingsForm.contract_text} 
                      onChange={e => setContractSettingsForm(prev => ({ ...prev, contract_text: e.target.value }))} 
                      rows={14} 
                      style={{ width:'100%', padding:'1rem', border:'1.5px solid #E6E7E8', borderRadius:12, fontSize:'0.82rem', fontFamily:'monospace', outline:'none', lineHeight:1.6, resize:'vertical' }} 
                      placeholder="Escribe el texto oficial del contrato aquí..."
                    />
                  </AdminSection>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" style={{ padding:'0.8rem 2.2rem', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', border:'none', borderRadius:50, fontWeight:750, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 6px 16px rgba(15,76,129,0.22)' }}>
                  💾 Guardar Configuración de Contratos
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- FORMULARIO DE CREACIÓN/EDICIÓN DE CONTRATO (PÁGINA COMPLETA) --- */}
        {showContractModal && (
          <div style={{ position:'fixed', inset:0, zIndex:1000, background:'#F3F5F8', display:'flex', justifyContent:'center', padding:'2.5rem 1.5rem', overflowY:'auto', fontFamily:'inherit' }}>
            <div style={{ background:'white', borderRadius:24, width:'100%', maxWidth:1100, height:'fit-content', minHeight:'calc(100vh - 5rem)', display:'flex', flexDirection:'column', border:'1px solid #E6E7E8', boxShadow:'0 10px 30px rgba(0,0,0,0.03)', overflow:'hidden' }}>
              
              {/* Page Header */}
              <div style={{ background:'linear-gradient(135deg,#071e36,#0F4C81)', padding:'1.6rem 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white' }}>
                <div>
                  <h3 style={{ margin:0, fontSize:'1.3rem', fontWeight:850 }}>
                    {isEditingContract ? `✏️ Editar Contrato de Mandato — ${contractForm.code}` : '📄 Crear Nuevo Contrato de Mandato'}
                  </h3>
                  <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', marginTop:'0.2rem', display:'block' }}>Paso {contractFormStep} de 4</span>
                </div>
                <button onClick={() => setShowContractModal(false)} style={{ border:'none', background:'none', color:'white', cursor:'pointer', fontSize:'1.8rem', fontWeight:700, lineHeight:1 }}>×</button>
              </div>

              {/* Steps Progress Indicator */}
              <div style={{ display:'flex', background:'#f8fafc', borderBottom:'1px solid #E6E7E8', padding:'1rem 2.5rem', fontSize:'0.82rem', fontWeight:800, gap:'2rem', overflowX:'auto' }}>
                {[
                  { step: 1, label: '👤 1. Mandantes y Renta' },
                  { step: 2, label: '🏨 2. Inmueble y Fotos' },
                  { step: 3, label: '💰 3. Canon y Administración' },
                  { step: 4, label: '✍️ 4. Adjuntos y Cierre' }
                ].map(s => (
                  <span key={s.step} 
                    onClick={() => setContractFormStep(s.step)}
                    style={{ 
                      color: contractFormStep === s.step ? '#F57C00' : '#8c9ba5', 
                      borderBottom: contractFormStep === s.step ? '2px solid #F57C00' : 'none', 
                      paddingBottom:'0.4rem', 
                      whiteSpace:'nowrap',
                      cursor: 'pointer'
                    }}>
                    {s.label}
                  </span>
                ))}
              </div>

              {/* Form Content */}
              <div style={{ padding:'2.5rem', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'2rem' }}>
                
                {/* STEP 1: Mandantes y Renta */}
                {contractFormStep === 1 && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
                      <SelectField label="Asesor Externo Captador" value={contractForm.agent_id} onChange={e => setContractForm(prev => ({ ...prev, agent_id: e.target.value }))} options={[
                        { value: '', label: 'Interno / Oficina (Oficina principal)' },
                        ...agents.map(a => ({ value: a.id, label: `${a.name} (${a.active ? 'Activo' : 'Inactivo'})` }))
                      ]} disabled={userRole === 'agent'} />
                      
                      <Field label="Nombre del Cliente Principal (Mandante 1) *" value={contractForm.client_name} onChange={e => setContractForm(prev => ({ ...prev, client_name: e.target.value }))} placeholder="Nombres del cliente principal" />
                    </div>

                    <div style={{ background:'rgba(15,76,129,0.02)', border:'1.5px dashed #0F4C81', padding:'1rem', borderRadius:16 }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Documentos Identidad Mandante 1 (Con Marca de Agua)</span>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem' }}>
                        <div>
                          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#5c6d80', marginBottom:'0.3rem' }}>Cédula Frontal</label>
                          <input type="file" accept="image/*" onChange={e => handleDocUpload(e, 'cedula_frontal_url')} style={{ fontSize:'0.75rem', width:'100%' }} />
                          {contractForm.cedula_frontal_url && <img src={contractForm.cedula_frontal_url} alt="Cédula Frontal" style={{ height:50, marginTop:'0.5rem', borderRadius:6, border:'1px solid #cbd5e1', objectFit:'contain' }} />}
                        </div>
                        <div>
                          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#5c6d80', marginBottom:'0.3rem' }}>Cédula Reverso</label>
                          <input type="file" accept="image/*" onChange={e => handleDocUpload(e, 'cedula_reversa_url')} style={{ fontSize:'0.75rem', width:'100%' }} />
                          {contractForm.cedula_reversa_url && <img src={contractForm.cedula_reversa_url} alt="Cédula Reverso" style={{ height:50, marginTop:'0.5rem', borderRadius:6, border:'1px solid #cbd5e1', objectFit:'contain' }} />}
                        </div>
                        <div>
                          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#5c6d80', marginBottom:'0.3rem' }}>RUT del Mandante</label>
                          <input type="file" accept="image/*" onChange={e => handleDocUpload(e, 'rut_url')} style={{ fontSize:'0.75rem', width:'100%' }} />
                          {contractForm.rut_url && <img src={contractForm.rut_url} alt="RUT" style={{ height:50, marginTop:'0.5rem', borderRadius:6, border:'1px solid #cbd5e1', objectFit:'contain' }} />}
                        </div>
                        <div>
                          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#5c6d80', marginBottom:'0.3rem' }}>Cámara de Comercio (opcional)</label>
                          <input type="file" accept="image/*" onChange={e => handleDocUpload(e, 'camara_comercio_url')} style={{ fontSize:'0.75rem', width:'100%' }} />
                          {contractForm.camara_comercio_url && <img src={contractForm.camara_comercio_url} alt="Cámara Comercio" style={{ height:50, marginTop:'0.5rem', borderRadius:6, border:'1px solid #cbd5e1', objectFit:'contain' }} />}
                        </div>
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                      <Field label="Razón Social (Personas jurídicas)" value={contractForm.mandante1.razonSocial} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, razonSocial: val } }));
                      }} />
                      <Field label="Nombre Completo Mandante 1 *" value={contractForm.mandante1.nombre} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, nombre: val }, client_name: val }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="N° Documento Identificación" value={contractForm.mandante1.documento} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, documento: val } }));
                      }} />
                      <SelectField label="Tipo Documento" value={contractForm.mandante1.tipoDoc} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, tipoDoc: val } }));
                      }} options={[
                        { value: 'CC', label: 'Cédula de Ciudadanía' },
                        { value: 'CE', label: 'Cédula de Extranjería' },
                        { value: 'PS', label: 'Pasaporte' },
                        { value: 'NIT', label: 'NIT' }
                      ]} />
                      <Field label="Expedido en" value={contractForm.mandante1.expedido} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, expedido: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Dirección de Residencia" value={contractForm.mandante1.direccion} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, direccion: val } }));
                      }} />
                      <Field label="Casa o Apto" value={contractForm.mandante1.casaApto} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, casaApto: val } }));
                      }} />
                      <Field label="Torre / Bloque" value={contractForm.mandante1.torre} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, torre: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Barrio" value={contractForm.mandante1.barrio} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, barrio: val } }));
                      }} />
                      <Field label="Conjunto" value={contractForm.mandante1.conjunto} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, conjunto: val } }));
                      }} />
                      <Field label="Ciudad" value={contractForm.mandante1.ciudad} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, ciudad: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Fecha Nacimiento" value={contractForm.mandante1.fechaNacimiento} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, fechaNacimiento: val } }));
                      }} placeholder="DD/MM/AAAA" />
                      <Field label="Teléfono" value={contractForm.mandante1.telefono} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, telefono: val } }));
                      }} />
                      <Field label="Celular" value={contractForm.mandante1.celular} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, celular: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
                      <Field label="Correo Electrónico (email)" value={contractForm.mandante1.email} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, email: val } }));
                      }} type="email" />
                      <Field label="Dirección Oficina (Trabajo)" value={contractForm.mandante1.direccionOficina} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, direccionOficina: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <SelectField label="Régimen IVA" value={contractForm.mandante1.regimen} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, regimen: val } }));
                      }} options={[
                        { value: 'No responsable de IVA', label: 'No responsable de IVA' },
                        { value: 'Responsable de IVA', label: 'Responsable de IVA' },
                        { value: 'Gran Contribuyente', label: 'Gran Contribuyente' }
                      ]} />
                      <SelectField label="Agente Retenedor" value={contractForm.mandante1.agenteRetenedor} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, agenteRetenedor: val } }));
                      }} options={[{ value: 'No', label: 'No' }, { value: 'Si', label: 'Sí' }]} />
                      <SelectField label="Persona PEP" value={contractForm.mandante1.pep} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante1: { ...prev.mandante1, pep: val } }));
                      }} options={[{ value: 'No', label: 'No' }, { value: 'Si', label: 'Sí' }]} />
                    </div>

                    {/* Mandante 2 toggle */}
                    <div style={{ borderTop:'1px solid #cbd5e1', paddingTop:'1.2rem' }}>
                      <span style={{ fontSize:'0.78rem', fontWeight:850, color:'#0F4C81', display:'block', marginBottom:'0.5rem' }}>¿Registrar Mandante 2 / Co-propietario?</span>
                      <input type="text" placeholder="Nombre completo Mandante 2 (dejar vacío si no aplica)" value={contractForm.mandante2.nombre} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, mandante2: { ...prev.mandante2, nombre: val } }));
                      }} style={{ width:'100%', padding:'0.7rem 1rem', border:'1.5px solid #E6E7E8', borderRadius:12, fontSize:'0.88rem' }} />
                      
                      {contractForm.mandante2.nombre && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginTop:'1rem' }}>
                          <Field label="Documento Identificación M2" value={contractForm.mandante2.documento} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, mandante2: { ...prev.mandante2, documento: val } }));
                          }} />
                          <Field label="Expedido en M2" value={contractForm.mandante2.expedido} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, mandante2: { ...prev.mandante2, expedido: val } }));
                          }} />
                          <Field label="Celular M2" value={contractForm.mandante2.celular} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, mandante2: { ...prev.mandante2, celular: val } }));
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Cuenta de Renta */}
                    <div style={{ borderTop:'1px solid #cbd5e1', paddingTop:'1.2rem' }}>
                      <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Información para Pago de Renta</span>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                        <SelectField label="Forma de Pago" value={contractForm.pagoRenta.formaPago} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, formaPago: val } }));
                        }} options={[{ value: 'Transferencia Bancaria', label: 'Transferencia Bancaria' }, { value: 'Cheque', label: 'Cheque' }, { value: 'Efectivo', label: 'Efectivo' }]} />
                        <Field label="Número Cuenta" value={contractForm.pagoRenta.cuentaNumero} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, cuentaNumero: val } }));
                        }} />
                        <Field label="Entidad Bancaria" value={contractForm.pagoRenta.banco} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, banco: val } }));
                        }} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginTop:'1rem' }}>
                        <SelectField label="Tipo Cuenta" value={contractForm.pagoRenta.tipoCuenta} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, tipoCuenta: val } }));
                        }} options={[{ value: 'Ahorros', label: 'Ahorros' }, { value: 'Corriente', label: 'Corriente' }]} />
                        <Field label="Ciudad Apertura" value={contractForm.pagoRenta.ciudadApertura} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, ciudadApertura: val } }));
                        }} />
                        <Field label="Titular de la Cuenta" value={contractForm.pagoRenta.titularCuenta} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, pagoRenta: { ...prev.pagoRenta, titularCuenta: val } }));
                        }} />
                      </div>
                    </div>

                    {/* Contacto Emergencia */}
                    <div style={{ borderTop:'1px solid #cbd5e1', paddingTop:'1.2rem' }}>
                      <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Contacto de Emergencia Autorizado</span>
                      <Field label="Nombre Completo Familiar" value={contractForm.emergencia.nombre} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, emergencia: { ...prev.emergencia, nombre: val } }));
                      }} />
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginTop:'1rem' }}>
                        <Field label="Documento Identificación" value={contractForm.emergencia.documento} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, emergencia: { ...prev.emergencia, documento: val } }));
                        }} />
                        <Field label="Celular Familiar" value={contractForm.emergencia.celular} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, emergencia: { ...prev.emergencia, celular: val } }));
                        }} />
                        <Field label="Parentesco" value={contractForm.emergencia.parentesco} onChange={e => {
                          const val = e.target.value;
                          setContractForm(prev => ({ ...prev, emergencia: { ...prev.emergencia, parentesco: val } }));
                        }} placeholder="Ej: Madre, Hijo, Cónyuge" />
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: Inmueble y Evidencias */}
                {contractFormStep === 2 && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <SelectField label="Consignación" value={contractForm.inmueble.consignacion} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, consignacion: val } }));
                      }} options={[{ value: 'Consignación', label: 'Consignación' }, { value: 'Re consignación', label: 'Re consignación' }]} />
                      <Field label="Código del Inmueble" value={contractForm.inmueble.codigoInmueble} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, codigoInmueble: val } }));
                      }} placeholder="Ej: INM-1025" />
                      <SelectField label="Destinación *" value={contractForm.inmueble.destinacion} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, destinacion: val } }));
                      }} options={[{ value: 'Vivienda', label: 'Vivienda' }, { value: 'Comercio', label: 'Comercio' }]} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Dirección Física del Inmueble *" value={contractForm.inmueble.direccion} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, direccion: val }, property_address: val }));
                      }} />
                      <Field label="Barrio" value={contractForm.inmueble.barrio} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, barrio: val } }));
                      }} />
                      <Field label="Ciudad" value={contractForm.inmueble.ciudad} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, ciudad: val } }));
                      }} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'0.8rem' }}>
                      <Field label="Estrato" value={contractForm.inmueble.estrato} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, estrato: val } }));
                      }} />
                      <Field label="Área Construida (m²)" value={contractForm.inmueble.areaConstruida} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, areaConstruida: val } }));
                      }} />
                      <Field label="Matrícula Inmobiliaria" value={contractForm.inmueble.matricula} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, matricula: val } }));
                      }} />
                      <Field label="Cédula Catastral" value={contractForm.inmueble.catastro} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, catastro: val } }));
                      }} />
                    </div>

                    {/* Vivienda Specific Details */}
                    {contractForm.inmueble.destinacion === 'Vivienda' && (
                      <div style={{ background:'rgba(15,76,129,0.02)', padding:'1.2rem', borderRadius:16, border:'1px solid #cbd5e1' }}>
                        <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Características de Vivienda</span>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                          <Field label="Tipo Vivienda" value={contractForm.inmueble.tipoInmuebleVivienda} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, tipoInmuebleVivienda: val } }));
                          }} placeholder="Apartamento, Casa, etc." />
                          <Field label="Tipo Cocina" value={contractForm.inmueble.tipoCocina} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, tipoCocina: val } }));
                          }} placeholder="Integral, Semi-integral" />
                          <Field label="Tipo Pisos" value={contractForm.inmueble.tipoPisosVivienda} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, tipoPisosVivienda: val } }));
                          }} placeholder="Madera, Baldosa" />
                        </div>
                        
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.8rem', marginTop:'1rem' }}>
                          <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', cursor:'pointer' }}>
                            <input type="checkbox" checked={contractForm.inmueble.salaComedorInd} onChange={e => {
                              const chk = e.target.checked;
                              setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, salaComedorInd: chk } }));
                            }} /> Sala Comedor Ind.
                          </label>
                          <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', cursor:'pointer' }}>
                            <input type="checkbox" checked={contractForm.inmueble.aireAcondicionado} onChange={e => {
                              const chk = e.target.checked;
                              setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, aireAcondicionado: chk } }));
                            }} /> Aire Acond.
                          </label>
                          <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', cursor:'pointer' }}>
                            <input type="checkbox" checked={contractForm.inmueble.balcon} onChange={e => {
                              const chk = e.target.checked;
                              setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, balcon: chk } }));
                            }} /> Balcón
                          </label>
                          <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', cursor:'pointer' }}>
                            <input type="checkbox" checked={contractForm.inmueble.calentador} onChange={e => {
                              const chk = e.target.checked;
                              setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, calentador: chk } }));
                            }} /> Calentador
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Comercio Specific Details */}
                    {contractForm.inmueble.destinacion === 'Comercio' && (
                      <div style={{ background:'rgba(15,76,129,0.02)', padding:'1.2rem', borderRadius:16, border:'1px solid #cbd5e1' }}>
                        <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Características de Comercio</span>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                          <Field label="Tipo de Inmueble" value={contractForm.inmueble.tipoInmuebleComercio} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, tipoInmuebleComercio: val } }));
                          }} placeholder="Local, Bodega, Oficina" />
                          <Field label="Tipo de Estructura" value={contractForm.inmueble.tipoEstructura} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, tipoEstructura: val } }));
                          }} />
                          <Field label="Altura Entrepiso (m)" value={contractForm.inmueble.alturaEntrepiso} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, inmueble: { ...prev.inmueble, alturaEntrepiso: val } }));
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Parqueadero / Locker */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.85rem', cursor:'pointer', marginTop:'1.5rem' }}>
                        <input type="checkbox" checked={contractForm.parqueadero.tieneParqueadero} onChange={e => {
                          const chk = e.target.checked;
                          setContractForm(prev => ({ ...prev, parqueadero: { ...prev.parqueadero, tieneParqueadero: chk } }));
                        }} /> ¿Tiene Parqueadero?
                      </label>
                      {contractForm.parqueadero.tieneParqueadero && (
                        <>
                          <Field label="Número Parqueadero" value={contractForm.parqueadero.numeroParqueadero} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, parqueadero: { ...prev.parqueadero, numeroParqueadero: val } }));
                          }} />
                          <SelectField label="Tipo Parqueadero" value={contractForm.parqueadero.tipoParqueadero} onChange={e => {
                            const val = e.target.value;
                            setContractForm(prev => ({ ...prev, parqueadero: { ...prev.parqueadero, tipoParqueadero: val } }));
                          }} options={[{ value: 'Cubierto', label: 'Cubierto' }, { value: 'Descubierto', label: 'Descubierto' }]} />
                        </>
                      )}
                    </div>

                    {/* Evidencia Fotográfica (Apartamento) */}
                    <div style={{ background:'rgba(245,124,0,0.02)', border:'1.5px dashed #F57C00', padding:'1.5rem', borderRadius:16, marginTop:'1rem' }}>
                      <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#F57C00', display:'block', marginBottom:'0.5rem', textTransform:'uppercase' }}>Fotos de Evidencia de Recepción (Con Marca de Agua de Seguridad)</span>
                      <p style={{ fontSize:'0.72rem', color:'#5c6d80', margin:'0 0 1rem 0' }}>Sube fotos para registrar formalmente el estado de entrega física del apartamento.</p>
                      
                      <input type="file" multiple accept="image/*" onChange={handleEvidenceUpload} style={{ fontSize:'0.8rem', marginBottom:'1rem' }} />
                      
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:'0.8rem' }}>
                        {(contractForm.evidence_images || []).map((img, i) => (
                          <div key={i} style={{ position:'relative', height:80, border:'1px solid #cbd5e1', borderRadius:8, overflow:'hidden' }}>
                            <img src={img} alt="Evidencia" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            <button type="button" onClick={() => removeEvidenceImg(i)} style={{ position:'absolute', top:4, right:4, background:'red', color:'white', border:'none', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.65rem' }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3: Canon y Administración */}
                {contractFormStep === 3 && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Valor del Canon ($ COP) *" value={contractForm.canon.valorCanon} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, valorCanon: val } }));
                      }} placeholder="Ej: 1.500.000" />
                      <SelectField label="Canon Integral" value={contractForm.canon.canonIntegral} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, canonIntegral: val } }));
                      }} options={[{ value: 'No', label: 'No' }, { value: 'Si', label: 'Sí' }]} />
                      <Field label="Cuota Sostenimiento" value={contractForm.canon.sostenimientoEncargado} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, sostenimientoEncargado: val } }));
                      }} placeholder="Ej: Mandante paga" />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Admin Con Descuento" value={contractForm.canon.adminConDesc} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, adminConDesc: val } }));
                      }} placeholder="Ej: 220.000" />
                      <Field label="Admin Sin Descuento" value={contractForm.canon.adminSinDesc} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, adminSinDesc: val } }));
                      }} placeholder="Ej: 250.000" />
                      <Field label="Nombre Copropiedad" value={contractForm.canon.copropiedadNombre} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, copropiedadNombre: val } }));
                      }} placeholder="Conjunto Residencial X" />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                      <Field label="Valor Póliza Servicios" value={contractForm.canon.valorPolizaServicios} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, valorPolizaServicios: val } }));
                      }} />
                      <Field label="Valor Asegurado" value={contractForm.canon.valorAsegurado} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, valorAsegurado: val } }));
                      }} />
                      <Field label="Georeferenciación" value={contractForm.canon.geoReferenciacion} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, canon: { ...prev.canon, geoReferenciacion: val } }));
                      }} placeholder="Coordenadas o link Google Maps" />
                    </div>

                    <Field label="Observaciones Adicionales" value={contractForm.canon.observaciones} onChange={e => {
                      const val = e.target.value;
                      setContractForm(prev => ({ ...prev, canon: { ...prev.canon, observaciones: val } }));
                    }} multiline />
                  </>
                )}

                {/* STEP 4: Documentos y Cierre */}
                {contractFormStep === 4 && (
                  <>
                    <div>
                      <span style={{ fontSize:'0.8rem', fontWeight:800, color:'#0F4C81', display:'block', marginBottom:'0.8rem', textTransform:'uppercase' }}>Checklist de Documentación Soporte Recibida</span>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', background:'#f8fafc', padding:'1.2rem', borderRadius:16, border:'1px solid #cbd5e1' }}>
                        {[
                          { key: 'cedulas', label: 'Copia Cédulas Identidad' },
                          { key: 'tradicionLibertad', label: 'Certificado Libertad y Tradición' },
                          { key: 'rut', label: 'Copia del RUT' },
                          { key: 'recibosPublicos', label: 'Últimos recibos públicos' },
                          { key: 'reciboAdmin', label: 'Recibo administración copropiedad' },
                          { key: 'impuestoPredial', label: 'Copia impuesto predial' }
                        ].map(doc => (
                          <label key={doc.key} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.82rem', cursor:'pointer' }}>
                            <input type="checkbox" checked={contractForm.documentos[doc.key]} onChange={e => {
                              const chk = e.target.checked;
                              setContractForm(prev => ({ ...prev, documentos: { ...prev.documentos, [doc.key]: chk } }));
                            }} style={{ width:16, height:16, accentColor:'#0F4C81' }} />
                            {doc.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
                      <Field label="Ciudad de Firma" value={contractForm.firma.ciudadFirma} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, firma: { ...prev.firma, ciudadFirma: val } }));
                      }} />
                      <Field label="Fecha de Firma" value={contractForm.firma.fechaFirma} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, firma: { ...prev.firma, fechaFirma: val } }));
                      }} type="date" />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
                      <Field label="Captado Por (Nombre comercial)" value={contractForm.firma.captadoPor} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, firma: { ...prev.firma, captadoPor: val } }));
                      }} placeholder="Ej: Asesor Rentun" />
                      <SelectField label="Medio de Contacto" value={contractForm.firma.medioContacto} onChange={e => {
                        const val = e.target.value;
                        setContractForm(prev => ({ ...prev, firma: { ...prev.firma, medioContacto: val } }));
                      }} options={[
                        { value: 'WhatsApp', label: 'WhatsApp' },
                        { value: 'Llamada telefónica', label: 'Llamada telefónica' },
                        { value: 'Feria inmobiliaria', label: 'Feria inmobiliaria' },
                        { value: 'Recomendado', label: 'Recomendado' }
                      ]} />
                    </div>
                  </>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div style={{ background:'#f8fafc', padding:'1.2rem 2.5rem', borderTop:'1px solid #E6E7E8', display:'flex', justifyContent:'space-between' }}>
                <button type="button" onClick={() => setShowContractModal(false)} style={{ padding:'0.8rem 1.8rem', border:'1.5px solid #E6E7E8', background:'white', color:'#5c6d80', cursor:'pointer', borderRadius:50, fontWeight:700, fontSize:'0.88rem' }}>
                  Volver Atrás (Cancelar)
                </button>
                <div style={{ display:'flex', gap:'0.8rem' }}>
                  {contractFormStep > 1 && (
                    <button type="button" onClick={() => setContractFormStep(prev => prev - 1)} style={{ padding:'0.8rem 1.8rem', border:'1.5px solid #0F4C81', background:'white', color:'#0F4C81', cursor:'pointer', borderRadius:50, fontWeight:700, fontSize:'0.88rem' }}>
                      Paso Anterior
                    </button>
                  )}
                  {contractFormStep < 4 ? (
                    <button type="button" onClick={() => setContractFormStep(prev => prev + 1)} style={{ padding:'0.8rem 2rem', border:'none', background:'linear-gradient(135deg,#0a3560,#0F4C81)', color:'white', cursor:'pointer', borderRadius:50, fontWeight:800, fontSize:'0.88rem', boxShadow:'0 4px 12px rgba(15,76,129,0.2)' }}>
                      Siguiente Paso
                    </button>
                  ) : (
                    <button type="button" onClick={handleSaveContract} style={{ padding:'0.8rem 2.2rem', border:'none', background:'linear-gradient(135deg,#F57C00,#FF9A2F)', color:'white', cursor:'pointer', borderRadius:50, fontWeight:800, fontSize:'0.9rem', boxShadow:'0 6px 16px rgba(245,124,0,0.35)' }}>
                      💾 Guardar Contrato de Mandato
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom save button */}
        {userRole === 'admin' && (
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
        )}

      </div>
    </div>
  );
}
