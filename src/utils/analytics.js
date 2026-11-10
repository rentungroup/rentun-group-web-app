let _supabasePromise = null;
const getSupabase = () => {
  if (!_supabasePromise) {
    _supabasePromise = import('../supabase').then(m => m.supabase);
  }
  return _supabasePromise;
};

// Helper para detectar tipo de dispositivo
export const getDeviceType = () => {
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Helper para normalizar el referrer / procedencia
export const parseCleanReferrer = (rawRef) => {
  if (!rawRef || rawRef.trim() === '') return 'Directo (Navegador / Enlace copiado)';
  try {
    const url = new URL(rawRef);
    const host = url.hostname.toLowerCase();

    if (host.includes('google')) return 'Google Search';
    if (host.includes('instagram') || host.includes('l.instagram')) return 'Instagram';
    if (host.includes('facebook') || host.includes('l.facebook') || host.includes('fb.me')) return 'Facebook';
    if (host.includes('whatsapp') || host.includes('wa.me')) return 'WhatsApp';
    if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'X / Twitter';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('youtube')) return 'YouTube';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('airbnb')) return 'Airbnb';
    if (host.includes('booking')) return 'Booking.com';

    // Si viene del mismo dominio
    if (host === window.location.hostname.toLowerCase()) {
      return 'Navegación Interna';
    }

    return host;
  } catch (e) {
    return rawRef;
  }
};

// ── 1. Registrar Evento de Compartir ─────────────────────────────────
export const trackShareEvent = async ({ propertyId, propertyName, platform }) => {
  try {
    const payload = {
      property_id: propertyId || 'general',
      property_name: propertyName || 'Rentun Group',
      platform: platform || 'copy_link', // 'whatsapp', 'facebook', 'twitter', 'telegram', 'copy_link'
      user_agent: navigator.userAgent || '',
      referrer: document.referrer || ''
    };

    // Guardar en Supabase
    const supabase = await getSupabase();
    const { error } = await supabase.from('share_events').insert(payload);
    if (error) {
      console.warn('Analytics: Could not save share event to Supabase, saving locally:', error.message);
      // Fallback a localStorage para no perder métricas
      saveLocalEvent('local_share_events', payload);
    }
  } catch (err) {
    console.error('Error tracking share event:', err);
  }
};

// ── 2. Registrar Visita a Página / Propiedad ─────────────────────────
export const trackPageView = async ({ path, propertyId }) => {
  try {
    const currentPath = path || window.location.pathname;
    
    // Evitar contar visitas del panel de administración
    if (currentPath.startsWith('/admin')) return;

    // Extraer UTMs de la URL
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || (params.get('ref') ? `ref_${params.get('ref')}` : null);
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');

    const cleanRef = parseCleanReferrer(document.referrer);

    const payload = {
      path: currentPath,
      property_id: propertyId || (currentPath.includes('/propiedad') ? currentPath.split('/').pop() : null),
      referrer: cleanRef,
      utm_source: utm_source,
      utm_medium: utm_medium,
      utm_campaign: utm_campaign,
      device_type: getDeviceType(),
      user_agent: navigator.userAgent || ''
    };

    const supabase = await getSupabase();
    const { error } = await supabase.from('page_visits').insert(payload);
    if (error) {
      // Fallback local
      saveLocalEvent('local_page_visits', payload);
    }
  } catch (err) {
    console.error('Error tracking page view:', err);
  }
};

// ── Helper local de respaldo ─────────────────────────────────────────
const saveLocalEvent = (key, event) => {
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift({ ...event, id: 'local-' + Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    // Ignorar errores de almacenamiento local
  }
};

// ── 3. Consultar Resumen para el Admin ────────────────────────────────
export const fetchAnalyticsData = async () => {
  try {
    const supabase = await getSupabase();
    const [sharesRes, visitsRes] = await Promise.all([
      supabase.from('share_events').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('page_visits').select('*').order('created_at', { ascending: false }).limit(500)
    ]);

    let shares = sharesRes.data || [];
    let visits = visitsRes.data || [];

    // Combinar con local si Supabase estaba vacío o no configurado aún
    if (shares.length === 0) {
      try {
        const localShares = JSON.parse(localStorage.getItem('local_share_events') || '[]');
        if (localShares.length > 0) shares = localShares;
      } catch (e) {}
    }

    if (visits.length === 0) {
      try {
        const localVisits = JSON.parse(localStorage.getItem('local_page_visits') || '[]');
        if (localVisits.length > 0) visits = localVisits;
      } catch (e) {}
    }

    // Cálculos de Shares por apartamento
    const sharesByProperty = {};
    const sharesByPlatform = {
      whatsapp: 0,
      facebook: 0,
      twitter: 0,
      telegram: 0,
      copy_link: 0
    };

    shares.forEach(s => {
      const propKey = s.property_name || s.property_id || 'Sin nombre';
      sharesByProperty[propKey] = (sharesByProperty[propKey] || 0) + 1;

      const pKey = (s.platform || 'copy_link').toLowerCase();
      if (sharesByPlatform[pKey] !== undefined) {
        sharesByPlatform[pKey]++;
      } else {
        sharesByPlatform[pKey] = (sharesByPlatform[pKey] || 0) + 1;
      }
    });

    // Cálculos de Visitas por Referrer / Procedencia
    const visitsByReferrer = {};
    const visitsByDevice = { mobile: 0, desktop: 0, tablet: 0 };
    const visitsByProperty = {};

    visits.forEach(v => {
      const refKey = v.referrer || 'Directo (Navegador)';
      visitsByReferrer[refKey] = (visitsByReferrer[refKey] || 0) + 1;

      const devKey = (v.device_type || 'desktop').toLowerCase();
      visitsByDevice[devKey] = (visitsByDevice[devKey] || 0) + 1;

      if (v.property_id) {
        visitsByProperty[v.property_id] = (visitsByProperty[v.property_id] || 0) + 1;
      }
    });

    return {
      totalShares: shares.length,
      totalVisits: visits.length,
      sharesByProperty,
      sharesByPlatform,
      visitsByReferrer,
      visitsByDevice,
      visitsByProperty,
      recentShares: shares.slice(0, 50),
      recentVisits: visits.slice(0, 50)
    };
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    return {
      totalShares: 0,
      totalVisits: 0,
      sharesByProperty: {},
      sharesByPlatform: {},
      visitsByReferrer: {},
      visitsByDevice: {},
      visitsByProperty: {},
      recentShares: [],
      recentVisits: []
    };
  }
};
