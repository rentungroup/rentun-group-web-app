// ═══════════════════════════════════════════════════════
//  RENTUN GROUP — CONFIGURACIÓN CENTRAL DEL SITIO
//  Edita este archivo o usa el panel /admin para cambios
// ═══════════════════════════════════════════════════════

export const SITE = {
  // ── Marca ──────────────────────────────────────────
  name: 'Rentun Group',
  tagline: 'Rentas · Gestión · Inversión',
  description: 'Apartamentos de corta estancia con servicio premium en Bogotá.',
  rntNumber: 'En trámite',

  // ── Anfitrión ──────────────────────────────────────
  hostName: 'Rentun Group',
  hostBio: '¡Hola! Somos Rentun Group, tu anfitrión en Bogotá. Estamos comprometidos en brindarte una estadía increíble. Si tienes alguna duda sobre el apartamento, recomendaciones locales o necesitas asistencia, no dudes en escribirnos por WhatsApp.',
  hostImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=165&h=165&fit=crop&q=80',

  // ── Contacto ───────────────────────────────────────
  whatsapp: '573219511173',           // Número temporal — actualizar cuando llegue el real
  email: 'admin@rentungroup.com',    // TODO: conectar a Supabase para edición dinámica

  // ── Links Airbnb (Propiedad Bogotá) ────────────────
  airbnb: {
    listing:   'https://es-l.airbnb.com/rooms/1637747920094051201?unique_share_id=d0631700-1174-45d2-91c9-0cf08fa95e96&viralityEntryPoint=1&s=76',
    booking:   'https://es-l.airbnb.com/rooms/1637747920094051201?unique_share_id=d0631700-1174-45d2-91c9-0cf08fa95e96&viralityEntryPoint=1&s=76',
    reviews:   'https://www.airbnb.com.co/rooms/1637747920094051201/reviews?unique_share_id=d0631700-1174-45d2-91c9-0cf08fa95e96&viralityEntryPoint=1&s=76',
    contact:   'https://www.airbnb.com.co/contact_host/1637747920094051201/send_message',
    calendar:  'https://www.airbnb.com.co/contact_host/1637747920094051201/send_message#availability-calendar',
    houseRules:'https://www.airbnb.com.co/rooms/1637747920094051201/house-rules?unique_share_id=d0631700-1174-45d2-91c9-0cf08fa95e96&viralityEntryPoint=1&s=76',
    safety:    'https://www.airbnb.com.co/rooms/1637747920094051201/safety?unique_share_id=d0631700-1174-45d2-91c9-0cf08fa95e96&viralityEntryPoint=1&s=76',
    embedId:   '1637747920094051201',
  },

  // ── Links Booking.com ──────────────────────────────
  bookingLink: 'https://www.booking.com/Share-twQDfc',

  // ── Propiedad principal ────────────────────────────
  property: {
    name:      'Apartamento Premium · Bogotá',
    type:      'Vivienda rentada',
    location:  'Bogotá, Colombia',
    rating:    '5.0',
    reviews:   '5.0',
    bedrooms:  1,
    beds:      1,
    baths:     1,
    description: 'Acogedor apartamento completamente equipado en Bogotá. Ideal para viajes de negocio o de placer. Disfruta de un ambiente moderno con todo lo que necesitas para una estadía perfecta.',
    amenities: ['🛏️ Cama cómoda', '📶 WiFi incluido', '🍳 Cocina equipada', '❄️ Climatización', '📺 TV Smart', '🔑 Check-in flexible'],
    image:     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=60&w=800',
  },

  // ── Stats Landing ──────────────────────────────────
  stats: [
    { value: '5', suffix: '★', label: 'Rating Airbnb' },
    { value: '+100', suffix: '', label: 'Huéspedes felices' },
    { value: '24', suffix: 'h', label: 'Atención continua' },
  ],
};

// Helper: genera link de WhatsApp con mensaje pre-llenado
export const waLink = (msg = 'Hola Rentun Group! Me interesa reservar un apartamento') =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
