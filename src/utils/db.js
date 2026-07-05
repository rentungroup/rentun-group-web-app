import { SITE } from '../config/site';

const DB_KEY = 'rentun_config_v3';

// Valores por defecto (se usan si no hay nada guardado)
export const DEFAULTS = {
  fontPair:     'outfit_inter',
  whatsapp:     SITE.whatsapp,
  email:        SITE.email,
  
  heroTitle:    'Alójate en Bogotá',
  heroAccent:   'con estilo y confort',
  heroSub:      'Apartamentos de corta estancia cuidadosamente equipados en Bogotá. Atención personalizada, check-in flexible y la tranquilidad de un anfitrión ★5.0 en Airbnb.',
  
  ctaTitle:     '¿Listo para reservar?',
  ctaSub:       'Contáctanos por WhatsApp o reserva directamente en Airbnb.',
  
  heroImages: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=60&w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=60&w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=60&w=800'
  ],

  // ── Anfitrión e RNT ──
  hostName:     SITE.hostName,
  hostBio:      SITE.hostBio,
  hostImage:    SITE.hostImage,
  rntNumber:    SITE.rntNumber,

  // ── Asistente IA ──
  chatAssistant: {
    name: 'Asistente Rentun Group',
    subtitle: 'Conectado a IA • 24/7',
    welcome: '¡Hola! Soy el asistente virtual de Rentun Group. ¿En qué te puedo ayudar hoy?',
    avatar: ''
  },

  // ── Contactos de Emergencia (Dinámicos) ──
  emergencies: [
    { id: '1', title: '🏥 Centro Médico / Clínica', value: 'Clínica Reina Sofía — Av. Carrera 9 # 127-10. Tel: (601) 625-2111' },
    { id: '2', title: '📞 Policía / Cuadrante', value: 'CAI Chicó — Tel: 300 123-4567 / Línea Nacional 123' }
  ],
  
  // ── Reglas de la casa (Dinámicas) ──
  houseRules: [
    { id: 'smoke', title: 'Fumar en la propiedad', allowed: false },
    { id: 'pets', title: 'Mascotas', allowed: false },
    { id: 'parties', title: 'Fiestas / Eventos', allowed: false },
    { id: 'visitors', title: 'Visitas adicionales', allowed: true },
    { id: 'noise', title: 'Horas de Silencio (10PM–7AM)', allowed: true }
  ],

  // ── Apartamentos (Múltiples Propiedades) ──
  properties: [
    {
      id: 'default-apt',
      name: SITE.property.name,
      description: SITE.property.description,
      location: SITE.property.location,
      address: 'Calle 100 # 15-20, Bogotá, Colombia — Dirección exacta disponible al confirmar la reserva',
      wifiSSID: 'RENTUN_WIFI_PREMIUM',
      wifiPassword: '(Consulta al hacer check-in)',
      price: '$280.000 COP / noche',
      bedrooms: 1,
      beds: 1,
      baths: 1,
      guests: 2,
      isAirbnb: true,
      airbnbListing: SITE.airbnb.listing,
      airbnbBooking: SITE.airbnb.booking,
      airbnbReviews: SITE.airbnb.reviews,
      airbnbContact: SITE.airbnb.contact,
      airbnbCalendar: SITE.airbnb.calendar,
      airbnbRules: SITE.airbnb.houseRules,
      airbnbSafety: SITE.airbnb.safety,
      airbnbEmbedId: SITE.airbnb.embedId,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=60&w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=60&w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=60&w=800'
      ],
      amenities: SITE.property.amenities,
      customWifiQR: '',
      customGuideQR: '',
      customWhatsappQR: ''
    }
  ],

  // ── Lugares Cercanos Recomendados ──
  places: [
    {
      id: 1,
      title: 'Supermercado Olímpica',
      subtitle: 'Víveres y artículos de aseo a pocos pasos.',
      description: 'Encuentra todo lo que necesitas para tu estadía. Víveres, artículos de aseo y más, a pocos pasos de la casa. Cuenta con droguería y cajero automático.',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=60&w=600',
      distance: '200m',
      walkingTime: '3 min',
      mapLink: 'https://maps.google.com/?q=Supermercado+Olimpica+Bogota',
      category: 'shopping'
    },
    {
      id: 2,
      title: 'Restaurante Local Premium',
      subtitle: 'Comida típica colombiana y cortes excelentes.',
      description: 'Deliciosa comida local y cortes de carne excelentes. Perfecto para un almuerzo en familia o probar la típica comida de la región.',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=60&w=600',
      distance: '450m',
      walkingTime: '6 min',
      mapLink: 'https://maps.google.com/?q=Restaurante+Bogota',
      category: 'food'
    }
  ],

  // ── Manuales de la casa ──
  manuals: [
    { 
      id: 1, 
      title: 'Calentador de agua', 
      description: 'El calentador de agua se activa automáticamente. Si necesitas ajustar la temperatura, contacta al anfitrión por WhatsApp.', 
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=60&w=600' 
    },
    { 
      id: 2, 
      title: 'Control de aire acondicionado', 
      description: 'El aire acondicionado se controla con el control remoto. Temperatura recomendada: 22°C. Recuerda apagarlo al salir.', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=60&w=600' 
    },
    { 
      id: 3, 
      title: 'Acceso al edificio', 
      description: 'Para ingresar al edificio menciona tu nombre en portería. Te entregaremos el código de acceso al apartamento por WhatsApp al confirmar la reserva.', 
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=60&w=600' 
    }
  ],

  // ── Preguntas frecuentes ──
  faqs: [
    { 
      id: 1, 
      question: '¿Cómo hago el check-in?', 
      answer: 'Al confirmar la reserva te enviaremos todas las instrucciones de acceso por WhatsApp y por Airbnb. El proceso es simple y contarás con nuestro apoyo.' 
    },
    { 
      id: 2, 
      question: '¿Hay parqueadero disponible?', 
      answer: 'Consulta disponibilidad de parqueadero al momento de reservar, ya que depende de la disponibilidad del edificio.' 
    },
    { 
      id: 3, 
      question: '¿Cuál es el horario de check-out?', 
      answer: 'El check-out estándar es a las 12:00 del mediodía. Puedes solicitar salida tardía a través de WhatsApp con anticipación, sujeto a disponibilidad.' 
    },
    { 
      id: 4, 
      question: '¿El WiFi está incluido?', 
      answer: 'Sí, el WiFi de alta velocidad está incluido sin costo adicional. Las credenciales de acceso te serán entregadas al momento del check-in.' 
    }
  ],

  // ── Checklist de salida ──
  checkoutTasks: [
    { id: 1, task: 'Apagar aires acondicionados y todas las luces.' },
    { id: 2, task: 'Cerrar bien ventanas y puertas.' },
    { id: 3, task: 'Dejar las llaves en el lugar indicado por el anfitrión.' },
    { id: 4, task: 'Depositar la basura en el lugar designado.' },
    { id: 5, task: 'Informar al anfitrión por WhatsApp que ya estás listo para salir.' }
  ],

  // ── Texto libre de reglas de la casa ──
  houseRulesText: '',

  // ── Páginas Legales Dinámicas ──
  legalPages: [
    { id: 'lp-cancel', title: 'Política de Cancelación', icon: '📅', content: 'Nuestra política de cancelación permite cancelaciones gratuitas hasta 48 horas antes del check-in. Cancelaciones posteriores pueden incurrir en cargos según las condiciones de la plataforma de reserva.', is_active: true, sort_order: 1 },
    { id: 'lp-terms', title: 'Términos y Condiciones', icon: '📋', content: 'Al hacer una reserva en Rentun Group, el huésped acepta cumplir con todas las normas de convivencia, horarios de silencio y condiciones del alojamiento. Rentun Group se reserva el derecho de cancelar reservas que incumplan estas condiciones.', is_active: true, sort_order: 2 },
    { id: 'lp-lost', title: 'Objetos Perdidos', icon: '🔍', content: 'Si olvidaste algún objeto en el alojamiento, contáctanos por WhatsApp dentro de los 7 días siguientes a tu salida. Haremos el mejor esfuerzo por recuperarlo y coordinamos su envío si es necesario. Rentun Group no se responsabiliza por objetos no reportados después de este período.', is_active: true, sort_order: 3 },
    { id: 'lp-guest-resp', title: 'Responsabilidad del Huésped', icon: '🙋', content: 'El huésped es responsable del cuidado del inmueble y sus enseres durante su estadía. Cualquier daño causado por mal uso será cobrado al responsable de la reserva. El huésped debe respetar las normas del edificio y no causar molestias a vecinos.', is_active: true, sort_order: 4 },
    { id: 'lp-rentun-resp', title: 'Responsabilidad de Rentun Group', icon: '🏢', content: 'Rentun Group se compromete a entregar el alojamiento en perfectas condiciones de limpieza y funcionamiento. Ante cualquier fallo de equipos o instalaciones, atenderemos el reporte en menos de 24 horas. No nos responsabilizamos por eventos de fuerza mayor, cortes de servicios públicos o situaciones fuera de nuestro control.', is_active: true, sort_order: 5 },
    { id: 'lp-convivencia', title: 'Política de Convivencia', icon: '🤝', content: 'Promovemos un ambiente de respeto y tranquilidad. Horario de silencio: 10PM – 7AM. No se permiten fiestas ni eventos sin autorización previa. El número máximo de huéspedes debe respetarse en todo momento. Las visitas deben retirarse antes de las 11PM.', is_active: true, sort_order: 6 },
    { id: 'lp-privacy', title: 'Política de Privacidad', icon: '🔐', content: 'En cumplimiento de la Ley 1581 de 2012, los datos personales recolectados (nombres, correos, teléfonos) son utilizados exclusivamente para la gestión de la reserva y comunicación relacionada con el alojamiento. No compartimos tu información con terceros. Puedes solicitar la eliminación de tus datos contactándonos directamente.', is_active: true, sort_order: 7 },
    { id: 'lp-escnna', title: 'Protección a Menores (ESCNNA)', icon: '🚨', content: 'En Rentun Group rechazamos rotundamente cualquier tipo de abuso o explotación sexual de niños, niñas y adolescentes. Prohibimos el ingreso a nuestras instalaciones de personas que pretendan realizar conductas asociadas a la explotación sexual de menores. Advertimos a todos nuestros huéspedes que en desarrollo de lo dispuesto en el artículo 17 de la Ley 679 de 2001, la Ley 1098 de 2006 y la Ley 1336 de 2009, la explotación y el abuso sexual de niños, niñas y adolescentes en el territorio nacional son sancionados penal y administrativamente conforme a las leyes colombianas vigentes.', is_active: true, sort_order: 8 },
    { id: 'lp-habeas', title: 'Habeas Data', icon: '📂', content: 'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, Rentun Group informa que los datos personales recolectados serán almacenados con absoluta confidencialidad. Como titular de la información, tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales comunicándote a través de nuestro correo oficial.', is_active: true, sort_order: 9 },
    { id: 'lp-patrimonio', title: 'Conservación del Patrimonio', icon: '🌱', content: 'Rentun Group está comprometido con la preservación del patrimonio natural y cultural de Colombia. Rechazamos el tráfico ilegal de especies silvestres de flora y fauna (Ley 17 de 1981, Ley 299 de 1996) y la comercialización ilícita de bienes culturales e históricos nacionales (Ley 397 de 1997).', is_active: true, sort_order: 10 }
  ]
};

import { supabase } from '../supabase';

// ── Lee la configuración ────────────────────────────────
export const fetchConfig = async () => {
  try {
    const [
      settingsRes, propertiesRes, placesRes,
      manualsRes, rulesRes, emergenciesRes, faqsRes, legalPagesRes
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('properties').select('*'),
      supabase.from('places').select('*'),
      supabase.from('manuals').select('*'),
      supabase.from('house_rules').select('*'),
      supabase.from('emergencies').select('*'),
      supabase.from('faqs').select('*'),
      supabase.from('legal_pages').select('*').order('sort_order', { ascending: true })
    ]);

    const settings = settingsRes.data || {};
    
    const mappedProperties = propertiesRes.data?.map(p => ({
      id: p.id, name: p.name, description: p.description,
      location: p.location, address: p.address,
      wifiSSID: p.wifi_ssid, wifiPassword: p.wifi_password,
      price: p.price, bedrooms: p.bedrooms, beds: p.beds, baths: p.baths, guests: p.guests || 2,
      isAirbnb: p.is_airbnb, airbnbListing: p.airbnb_listing,
      airbnbBooking: p.airbnb_booking, airbnbReviews: p.airbnb_reviews,
      airbnbContact: p.airbnb_contact, airbnbCalendar: p.airbnb_calendar,
      airbnbRules: p.airbnb_rules, airbnbSafety: p.airbnb_safety,
      airbnbEmbedId: p.airbnb_embed_id, images: p.images || [],
      customWifiQR: p.custom_wifi_qr, customGuideQR: p.custom_guide_qr,
      customWhatsappQR: p.custom_whatsapp_qr
    })) || [];
    
    // Add default apartment if empty (for backward compatibility)
    if (mappedProperties.length === 0) {
      mappedProperties.push(DEFAULTS.properties[0]);
    }

    return {
      ...DEFAULTS,
      fontPair: settings.font_pair || DEFAULTS.fontPair,
      whatsapp: settings.whatsapp || DEFAULTS.whatsapp,
      email: settings.email || DEFAULTS.email,
      heroTitle: settings.hero_title || DEFAULTS.heroTitle,
      heroAccent: settings.hero_accent || DEFAULTS.heroAccent,
      heroSub: settings.hero_sub || DEFAULTS.heroSub,
      ctaTitle: settings.cta_title || DEFAULTS.ctaTitle,
      ctaSub: settings.cta_sub || DEFAULTS.ctaSub,
      hostName: settings.host_name || DEFAULTS.hostName,
      hostBio: settings.host_bio || DEFAULTS.hostBio,
      hostImage: settings.host_image || DEFAULTS.hostImage,
      rntNumber: settings.rnt_number || DEFAULTS.rntNumber,
      heroImages: settings.hero_images || DEFAULTS.heroImages,
      
      chatAssistant: {
        name: settings.chat_assistant_name || DEFAULTS.chatAssistant.name,
        subtitle: settings.chat_assistant_subtitle || DEFAULTS.chatAssistant.subtitle,
        welcome: settings.chat_assistant_welcome || DEFAULTS.chatAssistant.welcome,
        avatar: settings.chat_assistant_avatar || DEFAULTS.chatAssistant.avatar
      },
      
      properties: mappedProperties,
      
      places: placesRes.data?.length ? placesRes.data.map(p => ({
        id: p.id, title: p.title, subtitle: p.subtitle,
        description: p.description, image: p.image,
        distance: p.distance, walkingTime: p.walking_time,
        mapLink: p.map_link, category: p.category
      })) : DEFAULTS.places,

      manuals: manualsRes.data?.length ? manualsRes.data.map(m => ({
        id: m.id, title: m.title, description: m.description || '', 
        image: m.image || '', pdfUrl: m.pdf_url || ''
      })) : DEFAULTS.manuals,
      
      houseRules: rulesRes.data?.length ? rulesRes.data.map(r => ({
        id: r.id, title: r.title, allowed: r.allowed, isPublic: r.is_public
      })) : DEFAULTS.houseRules,
      
      emergencies: emergenciesRes.data?.length ? emergenciesRes.data.map(e => ({
        id: e.id, title: e.title, value: e.phone || e.value || '', icon: e.icon || ''
      })) : DEFAULTS.emergencies,
      
      faqs: faqsRes.data?.length ? faqsRes.data : DEFAULTS.faqs,

      checkoutTasks: (() => {
        // First try from site_settings column
        if (settings.checkout_tasks && Array.isArray(settings.checkout_tasks) && settings.checkout_tasks.length > 0) {
          return settings.checkout_tasks;
        }
        return DEFAULTS.checkoutTasks;
      })(),

      houseRulesText: settings.house_rules_text || DEFAULTS.houseRulesText,

      legalPages: legalPagesRes.data?.length ? legalPagesRes.data.map(p => ({
        id: p.id, title: p.title, icon: p.icon || '📄',
        content: p.content || '', is_active: p.is_active !== false,
        sort_order: p.sort_order || 0
      })) : DEFAULTS.legalPages
    };
  } catch (err) {
    console.error('Error fetching config from Supabase:', err);
    return DEFAULTS;
  }
};

// ── Guarda la configuración (Actualización monolítica para Admin) ──────────
export const saveConfig = async (newData) => {
  try {
    // 1. Upsert site_settings (crea la fila si no existe, la actualiza si ya existe)
    const { error: settingsError } = await supabase.from('site_settings').upsert({
      id: 1,
      font_pair: newData.fontPair,
      whatsapp: newData.whatsapp,
      email: newData.email,
      hero_title: newData.heroTitle,
      hero_accent: newData.heroAccent,
      hero_sub: newData.heroSub,
      cta_title: newData.ctaTitle,
      cta_sub: newData.ctaSub,
      host_name: newData.hostName,
      host_bio: newData.hostBio,
      host_image: newData.hostImage,
      rnt_number: newData.rntNumber,
      hero_images: Array.isArray(newData.heroImages) ? newData.heroImages : [],
      chat_assistant_name: newData.chatAssistant?.name || '',
      chat_assistant_subtitle: newData.chatAssistant?.subtitle || '',
      chat_assistant_welcome: newData.chatAssistant?.welcome || '',
      chat_assistant_avatar: newData.chatAssistant?.avatar || '',
      checkout_tasks: Array.isArray(newData.checkoutTasks) ? newData.checkoutTasks : [],
      house_rules_text: newData.houseRulesText || ''
    });
    if (settingsError) {
      console.error('SUPABASE ERROR IN SITE_SETTINGS:', settingsError);
      throw settingsError;
    }

    // 2. Upsert properties — id must be a valid UUID
    if (newData.properties) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const propData = newData.properties.map(p => ({
        // Solo usar el id si es un UUID válido, si no generar uno nuevo
        id: (p.id && uuidRegex.test(p.id)) ? p.id : crypto.randomUUID(),
        name: p.name || '', description: p.description || '', location: p.location || '', address: p.address || '',
        wifi_ssid: p.wifiSSID || '', wifi_password: p.wifiPassword || '', price: p.price || '',
        bedrooms: p.bedrooms || 1, beds: p.beds || 1, baths: p.baths || 1, guests: p.guests || 2,
        is_airbnb: p.isAirbnb ?? false,
        airbnb_listing: p.airbnbListing || '', airbnb_booking: p.airbnbBooking || '',
        airbnb_reviews: p.airbnbReviews || '', airbnb_contact: p.airbnbContact || '',
        airbnb_calendar: p.airbnbCalendar || '', airbnb_rules: p.airbnbRules || '',
        airbnb_safety: p.airbnbSafety || '', airbnb_embed_id: p.airbnbEmbedId || '',
        images: Array.isArray(p.images) ? p.images : [],
        custom_wifi_qr: p.customWifiQR || '', custom_guide_qr: p.customGuideQR || '',
        custom_whatsapp_qr: p.customWhatsappQR || ''
      }));
      const { error: propError } = await supabase.from('properties').upsert(propData);
      if (propError) {
        console.error('SUPABASE ERROR IN PROPERTIES:', propError);
        throw propError;
      }
    }

    // Para las demás listas, borramos e insertamos todo para sincronizar el estado monolítico
    if (newData.places) {
      const { error: delPlaces } = await supabase.from('places').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delPlaces) { console.error('DEL places:', delPlaces); throw delPlaces; }
      const { error: insPlaces } = await supabase.from('places').insert(newData.places.map(p => ({
        title: p.title, subtitle: p.subtitle, description: p.description, image: p.image,
        distance: p.distance, walking_time: p.walkingTime, map_link: p.mapLink, category: p.category
      })));
      if (insPlaces) { console.error('INS places:', insPlaces); throw insPlaces; }
    }

    if (newData.houseRules) {
      const { error: delRules } = await supabase.from('house_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delRules) { console.error('DEL house_rules:', delRules); throw delRules; }
      const { error: insRules } = await supabase.from('house_rules').insert(newData.houseRules.map(r => ({
        title: r.title, allowed: r.allowed, is_public: r.isPublic
      })));
      if (insRules) { console.error('INS house_rules:', insRules); throw insRules; }
    }

    if (newData.emergencies) {
      const { error: delEmerg } = await supabase.from('emergencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delEmerg) { console.error('DEL emergencies:', delEmerg); throw delEmerg; }
      const { error: insEmerg } = await supabase.from('emergencies').insert(newData.emergencies.map(e => ({
        // value es NOT NULL en la BD, phone y icon son opcionales
        title: e.title || '',
        value: e.value || e.phone || '',
        phone: e.phone || e.value || '',
        icon: e.icon || ''
      })));
      if (insEmerg) { console.error('INS emergencies:', insEmerg); throw insEmerg; }
    }

    if (newData.faqs) {
      const { error: delFaqs } = await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delFaqs) { console.error('DEL faqs:', delFaqs); throw delFaqs; }
      const { error: insFaqs } = await supabase.from('faqs').insert(newData.faqs.map(f => ({
        question: f.question, answer: f.answer
      })));
      if (insFaqs) { console.error('INS faqs:', insFaqs); throw insFaqs; }
    }

    if (newData.manuals) {
      const { error: delManuals } = await supabase.from('manuals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delManuals) { console.error('DEL manuals:', delManuals); throw delManuals; }
      const { error: insManuals } = await supabase.from('manuals').insert(newData.manuals.map(m => ({
        // description es NOT NULL en la BD
        title: m.title || '',
        description: m.description || m.title || '',
        image: m.image || '',
        pdf_url: m.pdf_url || m.pdfUrl || ''
      })));
      if (insManuals) { console.error('INS manuals:', insManuals); throw insManuals; }
    }

    // ── Legal Pages (delete + re-insert) ──
    if (newData.legalPages) {
      const { error: delLegal } = await supabase.from('legal_pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delLegal) { console.error('DEL legal_pages:', delLegal); throw delLegal; }
      if (newData.legalPages.length > 0) {
        const { error: insLegal } = await supabase.from('legal_pages').insert(newData.legalPages.map((p, idx) => ({
          title: p.title || '',
          icon: p.icon || '📄',
          content: p.content || '',
          is_active: p.is_active !== false,
          sort_order: p.sort_order ?? idx
        })));
        if (insLegal) { console.error('INS legal_pages:', insLegal); throw insLegal; }
      }
    }

    return true;
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    return false;
  }
};

export const resetConfig = async () => {
  // Can be implemented if needed
  return DEFAULTS;
};

// ── Upload Image to Supabase Storage ──────────────────────────
export const uploadImage = async (fileOrBase64, bucket = 'images') => {
  try {
    let fileBody;
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
      const res = await fetch(fileOrBase64);
      fileBody = await res.blob();
    } else {
      fileBody = fileOrBase64;
    }
    
    const ext = fileBody.type ? fileBody.type.split('/')[1] : 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileBody, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('Error uploading:', error);
      throw error;
    }
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error in uploadImage:', err);
    throw err;
  }
};

// ── Helper: link de WhatsApp con mensaje ───────────────
export const waLink = (whatsappOrMsg, msgArg) => {
  let num = SITE.whatsapp;
  let msg = whatsappOrMsg;
  if (msgArg !== undefined) {
    num = whatsappOrMsg;
    msg = msgArg;
  }
  // Si no hay número (borrado por error) usar el de SITE
  if (!num) num = SITE.whatsapp;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg || '')}`;
};
// ── Traducción y Localización (ES / EN) ──
const TRANSLATIONS = {
  ES: {
    // Navbar
    navProps: 'Propiedades',
    navNosotros: 'Nosotros',
    navGuia: 'Información de la Estadía',
    navReservar: 'Reservar ahora →',

    // Hero
    heroTag: '✨ Hospedaje Exclusivo',
    heroDefaultTitle: 'Alójate en Bogotá',
    heroDefaultAccent: 'con estilo y confort',
    heroDefaultSub: 'Apartamentos de corta estancia cuidadosamente equipados en Bogotá. Atención personalizada, check-in flexible y la tranquilidad de un anfitrión ★5.0 en Airbnb.',
    btnAirbnb: '🗓️ Reservar en Airbnb',
    btnWhatsapp: '🗓️ Reservar por WhatsApp',
    btnAvailability: '💬 Consultar disponibilidad',

    // Stats
    statReviews: 'Valoraciones',
    statApartments: 'Apartamentos',
    statGuests: 'Huéspedes Satisfechos',
    statReturn: 'Retorno',

    // Properties section
    propTitle: 'Alojamientos',
    propAccent: 'disponibles',
    propSub: 'Explora nuestras exclusivas suites en Bogotá. Disponibles para reservar directamente o a través de Airbnb con todas las garantías de confort y servicio premium.',
    propDirect: 'Directo',
    propGuideLink: '📖 Ver guía',
    propBedrooms: 'hab',
    propBeds: 'cama',
    propBaths: 'baño',
    propNight: 'noche',

    // About section
    aboutTitle: 'Por qué elegirnos',
    aboutSubtitle: 'Anfitriones premium en Bogotá',
    aboutDesc: 'Nos dedicamos a hacer tu estadía perfecta. Desde el check-in autónomo hasta recomendaciones locales personalizadas, nuestro objetivo es tu confort absoluto.',
    aboutFeature1Title: 'Soporte 24/7',
    aboutFeature1Desc: 'Siempre disponibles para ayudarte con cualquier duda o requerimiento durante tu estadía.',
    aboutFeature2Title: 'Ubicación ideal',
    aboutFeature2Desc: 'Nuestros apartamentos están en los mejores sectores, cerca de restaurantes, transporte y comercio.',
    aboutFeature3Title: 'Huéspedes Felices ★5.0',
    aboutFeature3Desc: 'Más de 500 reseñas positivas avalan nuestra hospitalidad y compromiso.',

    // Guest Guide
    guideTitle: 'Información de la Estadía',
    guideWifiTitle: '📶 WiFi de la Casa',
    guideWifiSSID: 'Red',
    guideWifiPass: 'Contraseña',
    guideEmergencyTitle: '🚨 Emergencias',
    guideEmergencyAddress: 'Dirección',
    guideEmergencyClinic: 'Centro médico',
    guideEmergencyBtn: '📞 Llamar emergencias (123)',
    guideHostTitle: 'Tu anfitrión',
    guideFaqTitle: 'Preguntas frecuentes',
    guideManualTitle: 'Manual de la Casa',
    guidePlacesTitle: 'Lugares recomendados',
    guideCheckoutTitle: 'Checklist de Salida',
    guideCheckoutSub: 'Antes de dejar el apartamento, te agradecemos verificar las siguientes tareas:',
    guideCheckoutDoneTitle: '¡Todo listo para tu salida!',
    guideCheckoutDoneDesc: 'Has completado la lista. ¿Quieres notificar al anfitrión?',
    guideCheckoutBtn: '💬 Notificar salida por WhatsApp',
    guideRulesTitle: 'Reglas de la casa',
    guideRulesAllowed: 'Permitido',
    guideRulesNotAllowed: 'No permitido',
    guideBackBtn: '← Volver',
    guideCopyBtn: 'Copiar contraseña',
    guideCopied: '¡Copiado!',
  },
  EN: {
    // Navbar
    navProps: 'Properties',
    navNosotros: 'About Us',
    navGuia: 'Stay Information',
    navReservar: 'Book Now →',

    // Hero
    heroTag: '✨ Exclusive Lodging',
    heroDefaultTitle: 'Stay in Bogota',
    heroDefaultAccent: 'with style and comfort',
    heroDefaultSub: 'Carefully equipped short-stay apartments in Bogota. Personalized attention, flexible check-in, and the peace of mind of a ★5.0 host on Airbnb.',
    btnAirbnb: '🗓️ Book on Airbnb',
    btnWhatsapp: '🗓️ Book on WhatsApp',
    btnAvailability: '💬 Check availability',

    // Stats
    statReviews: 'Reviews',
    statApartments: 'Apartments',
    statGuests: 'Happy Guests',
    statReturn: 'Return',

    // Properties section
    propTitle: 'Available',
    propAccent: 'Accommodations',
    propSub: 'Explore our exclusive suites in Bogota. Available to book directly or through Airbnb with all guarantees of comfort and premium service.',
    propDirect: 'Direct',
    propGuideLink: '📖 View guide',
    propBedrooms: 'bed',
    propBeds: 'bed',
    propBaths: 'bath',
    propNight: 'night',

    // About section
    aboutTitle: 'Why choose us',
    aboutSubtitle: 'Premium hosts in Bogota',
    aboutDesc: 'We are dedicated to making your stay perfect. From self check-in to personalized local recommendations, our goal is your absolute comfort.',
    aboutFeature1Title: '24/7 Support',
    aboutFeature1Desc: 'Always available to help you with any questions or requirements during your stay.',
    aboutFeature2Title: 'Ideal location',
    aboutFeature2Desc: 'Our apartments are in the best areas, close to restaurants, transport, and commerce.',
    aboutFeature3Title: 'Happy Guests ★5.0',
    aboutFeature3Desc: 'More than 500 positive reviews back our hospitality and commitment.',

    // Guest Guide
    guideTitle: 'Stay Information',
    guideWifiTitle: '📶 House WiFi',
    guideWifiSSID: 'Network',
    guideWifiPass: 'Password',
    guideEmergencyTitle: '🚨 Emergencies',
    guideEmergencyAddress: 'Address',
    guideEmergencyClinic: 'Medical center',
    guideEmergencyBtn: '📞 Call emergencies (123)',
    guideHostTitle: 'Your host',
    guideFaqTitle: 'FAQs',
    guideManualTitle: 'House Manual',
    guidePlacesTitle: 'Recommended places',
    guideCheckoutTitle: 'Checkout Checklist',
    guideCheckoutSub: 'Before leaving the apartment, we appreciate you checking the following tasks:',
    guideCheckoutDoneTitle: 'All ready for your departure!',
    guideCheckoutDoneDesc: 'You have completed the list. Do you want to notify the host?',
    guideCheckoutBtn: '💬 Notify checkout via WhatsApp',
    guideRulesTitle: 'House rules',
    guideRulesAllowed: 'Allowed',
    guideRulesNotAllowed: 'Not allowed',
    guideBackBtn: '← Back',
    guideCopyBtn: 'Copy password',
    guideCopied: 'Copied!',
  }
};

export const getTranslation = (lang) => {
  return TRANSLATIONS[lang || 'ES'] || TRANSLATIONS.ES;
};

export const formatPrice = (priceStr, currency) => {
  if (!priceStr) return '';
  if (currency === 'USD') {
    // Limpiar puntos de miles y extraer números
    const cleanStr = priceStr.replace(/\./g, '').replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num) && num > 0) {
      // Supongamos tasa de cambio de 1 USD = 4,000 COP
      const usdValue = Math.round(num / 4000);
      let suffix = '';
      if (priceStr.toLowerCase().includes('noche') || priceStr.toLowerCase().includes('night')) {
        suffix = ' / night';
      }
      return `$${usdValue} USD${suffix}`;
    }
  }
  return priceStr;
};
