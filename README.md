# Rentun Group — Landing Page + Panel Admin

> **Proyecto web oficial de Rentun Group**  
> Desarrollado por **J&M Tech Solutions** · Manuel Madrid  
> Stack: React 19 + Vite + React Router + CSS Vanilla

---

## 📁 Historial de ubicación del proyecto

| Fecha | Ubicación | Estado |
|-------|-----------|--------|
| Jun 2026 (inicial) | `c:\Users\madfe\OneDrive\Documentos\perfil manuel\propuestas\rentun-group\` | Prototipo HTML (`landing.html`) |
| Jun 2026 (migración) | `C:\Users\madfe\OneDrive\Documentos\GitHub\rentun-group\` | ✅ Proyecto React activo |

### Archivos del prototipo original (HTML) — conservar como referencia
La carpeta original en `propuestas/rentun-group/` contiene:
- `landing.html` — prototipo completo de la landing en HTML puro
- `index.html` — boceto inicial
- `boceto.html` — exploración de diseño
- `asset/` — logos de la marca (5 versiones: black, blanco, blue, horizontal, white)
- `favicon_io/` — todos los favicons generados (favicon.ico, .png, apple-touch-icon, android-chrome, site.webmanifest)

> ⚠️ **No eliminar** la carpeta de propuestas. Los logos en `asset/` y los favicons en `favicon_io/` siguen siendo la fuente original de los assets.

---

## 🚀 Inicio rápido

### 1. Configurar el proyecto (primera vez)
Doble clic en `setup.bat` — copia favicons, logos e instala dependencias:
```bat
setup.bat
```

### 2. Iniciar en desarrollo
```bash
npm run dev
# → http://localhost:5173
```

### 3. Build de producción
```bash
npm run build
```

---

## 🗂️ Estructura del proyecto

```
rentun-group/
├── public/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── site.webmanifest
│   └── logos/                     ← logos de la marca (5 versiones)
├── src/
│   ├── config/
│   │   └── site.js                ← ⭐ CONFIG CENTRAL (links, datos, stats)
│   ├── utils/
│   │   ├── db.js                  ← localStorage + TODO Supabase
│   │   └── supabase.js            ← cliente Supabase (preparado, inactivo)
│   ├── pages/
│   │   ├── Landing.jsx            ← Página principal /
│   │   ├── Admin.jsx              ← Panel admin /admin
│   │   └── GuestGuide.jsx         ← Guía de huésped /guia
│   ├── components/
│   │   └── Navbar.jsx             ← Barra de navegación
│   ├── App.jsx                    ← Router principal
│   ├── main.jsx                   ← Entry point React
│   └── index.css                  ← Design tokens + estilos globales
├── .env.example                   ← Template de variables de entorno
├── .env                           ← ⚠️ NO subir a Git (en .gitignore)
├── .gitignore
├── vercel.json                    ← Configuración deploy Vercel (SPA routing)
├── vite.config.js
├── package.json
├── setup.bat                      ← Script de configuración inicial
└── README.md                      ← Este archivo
```

---

## 🌐 Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Landing.jsx` | Landing page de presentación |
| `/guia` | `GuestGuide.jsx` | Guía interactiva para huéspedes |
| `/admin` | `Admin.jsx` | Panel de administración de contenido |

---

## ✏️ Cómo editar el contenido

### Opción 1 — Panel Admin (recomendado)
Navega a `http://localhost:5173/admin` y edita:
- Textos del Hero
- Número de WhatsApp
- Correo electrónico
- Links de Airbnb
- Descripción del apartamento
- CTA final

Los cambios se guardan en `localStorage` del navegador.

### Opción 2 — Código fuente
Edita directamente `src/config/site.js` para cambios permanentes.

---

## 🔗 Links de la propiedad (Bogotá · ★5.0)

| Función | Link |
|---------|------|
| Listing principal | `https://es-l.airbnb.com/rooms/1637747920094051201` |
| Reserva directa | `https://www.airbnb.com.co/book/stays/1637747920094051201?...` |
| Reseñas | `https://www.airbnb.com.co/rooms/1637747920094051201/reviews` |
| Contactar anfitrión | `https://www.airbnb.com.co/contact_host/1637747920094051201/send_message` |
| Calendario | `...send_message#availability-calendar` |
| Reglas de la casa | `https://www.airbnb.com.co/rooms/1637747920094051201/house-rules` |
| Seguridad | `https://www.airbnb.com.co/rooms/1637747920094051201/safety` |

> Todos los links están centralizados en `src/config/site.js` → objeto `SITE.airbnb`

---

## 📞 Datos de contacto

| Campo | Valor | Estado |
|-------|-------|--------|
| WhatsApp | `573219511173` | ⏳ Temporal — actualizar cuando llegue el número real de Airbnb |
| Email | `rentungroup@gmail.com` | ⏳ Placeholder — actualizar con correo definitivo |

---

## 🏗️ Infraestructura y deploy

### Estado actual
- **Local:** `npm run dev` → `localhost:5173`
- **Producción:** Pendiente configurar

### Para hacer deploy en Vercel:
1. Subir el proyecto a GitHub
2. Conectar el repo en [vercel.com](https://vercel.com)
3. Configurar las variables de entorno (ver `.env.example`)
4. Deploy automático en cada `git push`

El archivo `vercel.json` ya está configurado para el routing de SPA (React Router).

### Variables de entorno necesarias en Vercel:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WA_NUMBER=573219511173
VITE_CONTACT_EMAIL=rentungroup@gmail.com
```

---

## 🗄️ Integración con Supabase (pendiente)

El proyecto está preparado para conectar a Supabase. Cuando lleguen las credenciales:

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar URL y anon key al archivo `.env`
3. En `src/utils/supabase.js` → descomentar las líneas del cliente
4. En `src/utils/db.js` → reemplazar las funciones `localStorage` por las funciones Supabase (marcadas con `// TODO: Supabase`)

**Tabla sugerida en Supabase:**
```sql
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🎨 Paleta de colores oficial

| Token | Hex | Uso |
|-------|-----|-----|
| `--navy` | `#0F4C81` | Color primario, navbar, botones |
| `--orange` | `#F57C00` | Acento, badges, CTAs |
| `--gray` | `#B0B4B8` | Textos secundarios |
| `--light` | `#E6E7E8` | Bordes, fondos suaves |

Fuente: **Outfit** (Google Fonts) — pesos 300 → 900

---

## 📦 Dependencias principales

```json
{
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-router-dom": "^7.17.0",
  "framer-motion": "^12.40.0",
  "lucide-react": "^1.18.0",
  "@supabase/supabase-js": "^2.49.4",
  "clsx": "^2.1.1"
}
```

---

## 📝 Historial de cambios

### v1.0.0 — Jun 2026
- ✅ Prototipo HTML (`landing.html`) en carpeta `propuestas`
- ✅ Diseño con paleta oficial Rentun Group
- ✅ Integración del embed de Airbnb (JSSDK)
- ✅ 1 propiedad real (Bogotá · ★5.0 · 1hab · 1cama · 1baño)
- ✅ SEO básico + Schema.org JSON-LD

### v2.0.0 — Jun 2026 (migración a React)
- ✅ Proyecto migrado a **React 19 + Vite**
- ✅ Movido a `GitHub/rentun-group/` (carpeta de proyectos de clientes)
- ✅ Arquitectura de 3 rutas: `/` · `/guia` · `/admin`
- ✅ Configuración central (`src/config/site.js`) con todos los links de Airbnb
- ✅ Panel de administración (`/admin`) editable: Hero, WhatsApp, Email, links, descripción
- ✅ Guía de huéspedes (`/guia`) con tabs: Inicio, Manuales, Salida, Reglas
- ✅ Favicons integrados (fuente: `favicon_io/`)
- ✅ Preparado para Supabase + GitHub + Vercel
- ✅ `vercel.json` configurado para SPA routing
- ✅ `.env.example` con template de variables de entorno

### Pendiente
- ⏳ Ejecutar `setup.bat` para copiar favicons y hacer `npm install`
- ⏳ Actualizar número de WhatsApp real (cuando llegue de Airbnb)
- ⏳ Conectar Supabase (cuando lleguen las credenciales del proyecto)
- ⏳ Subir a GitHub y conectar a Vercel para deploy
- ⏳ Auth de admin panel (con Supabase Auth)

---

## 👤 Créditos

Desarrollado por [**J&M Tech Solutions**](https://www.jymtechsolutions.online/es)  
Desarrollador principal: **Manuel Madrid**  
Cliente: **Rentun Group** · Bogotá, Colombia
