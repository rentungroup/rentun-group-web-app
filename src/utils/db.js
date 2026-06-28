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
  ]
};

import { supabase } from '../supabase';

// ── Lee la configuración ────────────────────────────────
export const fetchConfig = async () => {
  try {
    const [
      settingsRes, propertiesRes, placesRes,
      manualsRes, rulesRes, emergenciesRes, faqsRes
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('properties').select('*'),
      supabase.from('places').select('*'),
      supabase.from('manuals').select('*'),
      supabase.from('house_rules').select('*'),
      supabase.from('emergencies').select('*'),
      supabase.from('faqs').select('*')
    ]);

    const settings = settingsRes.data || {};
    
    const mappedProperties = propertiesRes.data?.map(p => ({
      id: p.id, name: p.name, description: p.description,
      location: p.location, address: p.address,
      wifiSSID: p.wifi_ssid, wifiPassword: p.wifi_password,
      price: p.price, bedrooms: p.bedrooms, beds: p.beds, baths: p.baths,
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
      
      properties: mappedProperties,
      
      places: placesRes.data?.length ? placesRes.data.map(p => ({
        id: p.id, title: p.title, subtitle: p.subtitle,
        description: p.description, image: p.image,
        distance: p.distance, walkingTime: p.walking_time,
        mapLink: p.map_link, category: p.category
      })) : DEFAULTS.places,

      manuals: manualsRes.data?.length ? manualsRes.data.map(m => ({
        id: m.id, title: m.title, pdfUrl: m.pdf_url || ''
      })) : DEFAULTS.manuals,
      
      houseRules: rulesRes.data?.length ? rulesRes.data.map(r => ({
        id: r.id, title: r.title, allowed: r.allowed, isPublic: r.is_public
      })) : DEFAULTS.houseRules,
      
      emergencies: emergenciesRes.data?.length ? emergenciesRes.data.map(e => ({
        id: e.id, title: e.title, value: e.phone || e.value || '', icon: e.icon || ''
      })) : DEFAULTS.emergencies,
      
      faqs: faqsRes.data?.length ? faqsRes.data : DEFAULTS.faqs
    };
  } catch (err) {
    console.error('Error fetching config from Supabase:', err);
    return DEFAULTS;
  }
};

// ── Guarda la configuración (Actualización monolítica para Admin) ──────────
export const saveConfig = async (newData) => {
  try {
    // 1. Update site_settings
    await supabase.from('site_settings').update({
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
      hero_images: newData.heroImages
    }).eq('id', 1);

    // 2. Upsert properties
    if (newData.properties) {
      const propData = newData.properties.map(p => ({
        id: (!p.id) ? crypto.randomUUID() : p.id,
        name: p.name, description: p.description, location: p.location, address: p.address,
        wifi_ssid: p.wifiSSID, wifi_password: p.wifiPassword, price: p.price,
        bedrooms: p.bedrooms, beds: p.beds, baths: p.baths,
        is_airbnb: p.isAirbnb, airbnb_listing: p.airbnbListing, airbnb_booking: p.airbnbBooking,
        airbnb_reviews: p.airbnbReviews, airbnb_contact: p.airbnbContact, airbnb_calendar: p.airbnbCalendar,
        airbnb_rules: p.airbnbRules, airbnb_safety: p.airbnbSafety, airbnb_embed_id: p.airbnbEmbedId,
        images: p.images, custom_wifi_qr: p.customWifiQR, custom_guide_qr: p.customGuideQR, custom_whatsapp_qr: p.customWhatsappQR
      }));
      const { error: propError } = await supabase.from('properties').upsert(propData);
      if (propError) {
        console.error('SUPABASE ERROR IN PROPERTIES:', propError);
        throw propError;
      }
    }

    // Para las demás listas, borramos e insertamos todo para sincronizar el estado monolítico
    if (newData.places) {
      await supabase.from('places').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('places').insert(newData.places.map(p => ({
        title: p.title, subtitle: p.subtitle, description: p.description, image: p.image,
        distance: p.distance, walking_time: p.walkingTime, map_link: p.mapLink, category: p.category
      })));
    }

    if (newData.houseRules) {
      await supabase.from('house_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('house_rules').insert(newData.houseRules.map(r => ({
        title: r.title, allowed: r.allowed, is_public: r.isPublic
      })));
    }

    if (newData.emergencies) {
      await supabase.from('emergencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('emergencies').insert(newData.emergencies.map(e => ({
        title: e.title, phone: e.value || e.phone || '', icon: e.icon || ''
      })));
    }

    if (newData.faqs) {
      await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('faqs').insert(newData.faqs.map(f => ({
        question: f.question, answer: f.answer
      })));
    }

    if (newData.manuals) {
      await supabase.from('manuals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('manuals').insert(newData.manuals.map(m => ({
        title: m.title, pdf_url: m.pdf_url || m.pdfUrl || ''
      })));
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
    navGuia: 'Guía de huésped',
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
    statGuests: 'Huéspedes',
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
    guideTitle: 'Guía del Huésped',
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
    navGuia: 'Guest Guide',
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
    statGuests: 'Guests',
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
    guideTitle: 'Guest Guide',
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
