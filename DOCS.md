# 📖 ASEISI — Documentación Técnica

> Aplicación web para la Asociación de Estudiantes de Ingeniería en Sistemas Informáticos (ASEISI) de la Universidad de El Salvador.

---

## 📋 Índice

- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Sistema de Autenticación](#-sistema-de-autenticación)
- [Roles y Permisos](#-roles-y-permisos)
- [API REST — Endpoints](#-api-rest--endpoints)
  - [Públicos](#públicos-sin-autenticación)
  - [Autenticación](#autenticación)
  - [Admin CRUD](#admin-crud-requiere-token)
  - [Usuarios](#gestión-de-usuarios-solo-admin)
  - [Comités](#gestión-de-comités-solo-admin)
  - [Uploads](#subida-de-imágenes)
- [Base de Datos](#-base-de-datos)
- [Frontend — Landing Page](#-frontend--landing-page)
- [Frontend — Panel de Administración](#-frontend--panel-de-administración)
- [Características del Admin](#-características-del-admin)
- [Changelog](#-changelog)

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│                                                         │
│   ┌─────────────┐          ┌──────────────────┐        │
│   │  index.html │◄────────►│   admin.html     │        │
│   │  (Landing)  │  API     │   (Panel Admin)  │        │
│   │  Dinámica   │  REST    │   SPA con tabs   │        │
│   └──────┬──────┘          └────────┬─────────┘        │
│          │                          │                   │
│          └──────────┬───────────────┘                   │
│                     │ fetch()                           │
│                     ▼                                   │
│   ┌─────────────────────────────────────┐              │
│   │        API REST (puerto 8092)       │              │
│   │         backend.py (Python)         │              │
│   │                                     │              │
│   │  • Auth JWT-like (token bearer)     │              │
│   │  • CRUD completo                    │              │
│   │  • Upload de imágenes (base64)      │              │
│   │  • CORS habilitado                  │              │
│   └──────────────┬──────────────────────┘              │
│                  │                                      │
│                  ▼                                      │
│   ┌──────────────────────────┐  ┌───────────────┐      │
│   │   SQLite (aseisi.db)     │  │   uploads/     │     │
│   │   • users & sessions     │  │   (imágenes)   │     │
│   │   • counters, events     │  │                 │     │
│   │   • team, committees     │  └─────────────────┘     │
│   │   • news, gallery        │                          │
│   │   • permissions          │                          │
│   └──────────────────────────┘                          │
│                                                         │
│   ┌─────────────────────────────────────┐              │
│   │   Servidor HTTP estático (:8090)    │              │
│   │   python3 -m http.server            │              │
│   └─────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

**Patrón:** Cliente-Servidor con API REST. El frontend es una SPA (Single Page Application) que consume la API. La landing page es server-rendered con datos dinámicos vía fetch.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Backend** | Python 3 (stdlib) | 3.9+ | API REST, auth, CRUD |
| **Base de datos** | SQLite | 3.x | Persistencia, WAL mode |
| **Frontend** | HTML5 / CSS3 / JS (Vanilla) | ES6+ | UI sin dependencias |
| **Tipografía** | Google Fonts (Inter) | — | Tipografía moderna |
| **Iconos** | Font Awesome | 6.5.1 | Iconografía |
| **Servidor estático** | Python http.server | — | Servir archivos HTML |

### Dependencias externas
- **Ninguna librería Python adicional** — todo usa la stdlib
- **Ningún framework JS** — vanilla JavaScript puro
- **CDN:** Google Fonts, Font Awesome (solo CSS)

---

## 📁 Estructura del Proyecto

```
aseisi/
├── index.html          # Landing page pública (dinámica desde API)
├── admin.html          # Panel de administración (SPA)
├── backend.py          # API REST + servidor de archivos
├── aseisi.db           # Base de datos SQLite (auto-generada)
├── uploads/            # Imágenes subidas desde el admin
│   └── *.jpg|png|...   # Archivos con nombres aleatorios (hex)
├── DOCS.md             # Esta documentación
└── .gitignore          # Archivos excluidos del repositorio
```

---

## 🚀 Instalación y Ejecución

### Requisitos
- Python 3.9 o superior
- Navegador web moderno

### Iniciar

```bash
# 1. Backend API (puerto 8092)
cd aseisi/
python3 backend.py &

# 2. Servidor web estático (puerto 8090, desde raíz del proyecto)
cd ..
python3 -m http.server 8090 &
```

### URLs

| Servicio | URL |
|----------|-----|
| Landing page | http://localhost:8090/aseisi/ |
| Panel admin | http://localhost:8090/aseisi/admin.html |
| API REST | http://localhost:8092/api/ |

### Credenciales por defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |

> ⚠️ **Cambiar la contraseña del admin en producción.**

---

## 🔐 Sistema de Autenticación

- **Tipo:** Token Bearer (similar a JWT pero stateful)
- **Almacenamiento:** Tokens en tabla `sessions` de SQLite
- **Duración:** 7 días por sesión
- **Header:** `Authorization: Bearer <token>`
- **Cliente:** Token guardado en `localStorage`

### Flujo

```
1. POST /api/login { username, password }
2. Server valida → genera token aleatorio (64 hex chars)
3. Responde { token, user: { id, username, role, permissions, committees } }
4. Cliente guarda token en localStorage
5. Todas las requests autenticadas llevan: Authorization: Bearer <token>
6. POST /api/logout → elimina token del servidor
```

---

## 👥 Roles y Permisos

### Roles base

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **admin** | Administrador total | Todo: usuarios, roles, comités, contenido |
| **member** | Miembro regular | Solo lectura del dashboard |

### Permisos por comité

Los miembros asignados a comités obtienen permisos adicionales:

| Comité | Permiso | Puede gestionar |
|--------|---------|----------------|
| Comité de Eventos (id: 2) | `manage_committee_2` | Crear/editar eventos |
| Comité de Comunicaciones (id: 3) | `manage_committee_3` | Crear/editar noticias y galería |

### Jerarquía de acceso

```
Admin
├── Gestión de usuarios (crear, editar rol, desactivar, eliminar)
├── Gestión de comités (crear, editar, asignar miembros)
├── Todo el contenido (contadores, eventos, directiva, noticias, galería)
│
Miembro en Comité
├── Contenido asociado a su comité (ver tabla arriba)
│
Miembro sin Comité
└── Solo visualización del dashboard
```

---

## 📡 API REST — Endpoints

**Base URL:** `http://localhost:8092`

**Headers comunes:**
```
Content-Type: application/json
Authorization: Bearer <token>  (endpoints protegidos)
```

---

### Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/public/counters` | Contadores del hero |
| `GET` | `/api/public/events` | Eventos visibles |
| `GET` | `/api/public/team` | Miembros de directiva visibles |
| `GET` | `/api/public/committees` | Comités visibles |
| `GET` | `/api/public/news` | Noticias visibles |
| `GET` | `/api/public/gallery` | Galería visible |
| `GET` | `/uploads/<filename>` | Servir imagen subida |

**Ejemplo de respuesta** (`GET /api/public/counters`):
```json
[
  { "label": "Miembros Activos", "value": 350, "sort_order": 0 },
  { "label": "Eventos al Año", "value": 45, "sort_order": 1 }
]
```

---

### Autenticación

| Método | Endpoint | Body | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/login` | `{ username, password }` | Iniciar sesión |
| `POST` | `/api/register` | `{ username, password, full_name, email }` | Registro público |
| `POST` | `/api/logout` | — | Cerrar sesión (requiere token) |
| `GET` | `/api/me` | — | Info del usuario actual (requiere token) |

**Login — Request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login — Response:**
```json
{
  "token": "a1b2c3...64chars",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrador ASEISI",
    "role": "admin",
    "permissions": [],
    "committees": []
  }
}
```

**Register — Validaciones:**
- `username`: mínimo 3 caracteres, único
- `password`: mínimo 6 caracteres
- `full_name`: requerido
- `email`: formato válido (opcional)

---

### Admin CRUD (requiere token)

Todos los recursos siguen el mismo patrón REST:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/{recurso}` | Listar todos (incluyendo ocultos) |
| `POST` | `/api/admin/{recurso}` | Crear nuevo |
| `PUT` | `/api/admin/{recurso}/{id}` | Actualizar |
| `DELETE` | `/api/admin/{recurso}/{id}` | Eliminar (solo admin) |

**Recursos disponibles:**

#### Contadores (`/api/admin/counters`)
```json
{
  "label": "Miembros Activos",
  "value": 350,
  "sort_order": 0
}
```

#### Eventos (`/api/admin/events`)
```json
{
  "title": "Hackathon ASEISI 2026",
  "description": "48 horas para construir soluciones...",
  "emoji": "💻",
  "event_date": "2026-05-10",
  "location": "Auditorio FIA",
  "capacity": 150,
  "duration": "48 horas",
  "status": "open",
  "gradient": "linear-gradient(135deg,#B71C1C,#D32F2F)",
  "image_url": "uploads/abc123.jpg",
  "sort_order": 0,
  "visible": 1
}
```
- `status`: `upcoming` | `open` | `soon`
- `image_url`: puede ser `data:image/...;base64,...` (se guarda automáticamente)

#### Directiva (`/api/admin/team`)
```json
{
  "full_name": "María López",
  "role_title": "Presidenta",
  "description": "5to año · IA y liderazgo",
  "avatar_emoji": "👩‍💻",
  "image_url": "uploads/def456.jpg",
  "linkedin": "https://linkedin.com/in/...",
  "github": "https://github.com/...",
  "instagram": "https://instagram.com/...",
  "sort_order": 0,
  "visible": 1
}
```

#### Noticias (`/api/admin/news`)
```json
{
  "title": "Equipo UES clasifica a ICPC",
  "content": "Tres estudiantes representarán...",
  "tag": "🏆 Logro",
  "published_date": "2026-04-15",
  "visible": 1
}
```

#### Galería (`/api/admin/gallery`)
```json
{
  "caption": "Hackathon 2025",
  "emoji": "💻",
  "gradient": "linear-gradient(135deg,#D32F2F,#EF5350)",
  "image_url": "uploads/ghi789.jpg",
  "sort_order": 0,
  "visible": 1
}
```

#### Comités (`/api/admin/committees`)
```json
{
  "name": "Comité de Tecnología",
  "description": "Desarrollo de proyectos y talleres.",
  "icon": "fas fa-laptop-code",
  "member_count": 8,
  "sort_order": 0,
  "visible": 1
}
```

---

### Gestión de Usuarios (solo admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | Listar usuarios con sus comités |
| `POST` | `/api/admin/users` | Crear usuario |
| `PUT` | `/api/admin/users/{id}` | Editar (nombre, email, rol, active, password) |
| `DELETE` | `/api/admin/users/{id}` | Eliminar (no puede auto-eliminarse) |

**Crear usuario:**
```json
{
  "username": "juanperez",
  "password": "mipassword",
  "full_name": "Juan Pérez",
  "email": "juan@ues.edu.sv",
  "role": "member"
}
```

---

### Gestión de Comités (solo admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/committee/{id}/members` | Listar miembros del comité |
| `POST` | `/api/admin/committee/{id}/members` | Agregar miembro |
| `DELETE` | `/api/admin/committee-member/{cm_id}` | Remover miembro |

**Agregar miembro:**
```json
{
  "user_id": 5,
  "role": "coordinator"
}
```
- `role`: `member` | `coordinator`

---

### Subida de Imágenes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/upload` | Subir imagen (base64) |

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "url": "uploads/a1b2c3d4e5f6.jpg"
}
```

> Las imágenes también se pueden enviar inline en los campos `image_url` de cualquier recurso. El backend detecta `data:image/...` y las guarda automáticamente.

**Formatos soportados:** JPEG, PNG, GIF, WebP, SVG
**Tamaño máximo recomendado:** 5 MB (validado en frontend)

---

## 🗄 Base de Datos

**Motor:** SQLite 3 con WAL mode y foreign keys habilitadas.
**Archivo:** `aseisi.db` (auto-generado en primer inicio)

### Diagrama ER

```
users ─────────────┐
  │                │
  │ 1:N            │ N:M (via committee_members)
  ▼                ▼
sessions       committee_members ──► committees ──► permissions
                                        │
                                        │ 1:N
                                        ▼
                                    (permisos)

counters (independiente)
events (independiente)
team_members (independiente)
news (independiente)
gallery (independiente)
about_cards (independiente)
site_settings (independiente)
```

### Tablas

| Tabla | Registros iniciales | Descripción |
|-------|-------------------|-------------|
| `users` | 1 (admin) | Usuarios del sistema |
| `sessions` | — | Sesiones activas (tokens) |
| `counters` | 4 | Contadores del hero |
| `events` | 6 | Eventos y actividades |
| `team_members` | 7 | Junta directiva |
| `committees` | 6 | Comités de trabajo |
| `committee_members` | — | Relación usuario-comité |
| `permissions` | 6 | Permisos por comité |
| `news` | 3 | Noticias y anuncios |
| `gallery` | 6 | Galería de imágenes |
| `about_cards` | — | Tarjetas "Sobre nosotros" |
| `site_settings` | — | Configuración general |

### Seguridad de passwords
- **Hash:** SHA-256 (sin salt — para producción usar bcrypt)
- **Tokens:** `secrets.token_hex(32)` — 64 caracteres hex

---

## 🌐 Frontend — Landing Page

**Archivo:** `index.html`

### Características
- **Dinámica:** Todos los datos se cargan desde la API al iniciar (`/api/public/*`)
- **Responsive:** Mobile-first con breakpoint en 768px
- **Temas:** Modo claro/oscuro con toggle (persistido en localStorage)
- **Animaciones:** Fade-in con IntersectionObserver, contadores animados
- **Validación:** Formularios con HTML5 validation nativa
- **Sin dependencias JS** — todo vanilla

### Secciones
1. **Hero** — Badge UES, título, CTA, contadores animados
2. **Nosotros** — 4 tarjetas (misión, visión, tecnología, comunidad)
3. **Eventos** — Grid dinámico desde API, con imágenes o emoji+gradiente
4. **Directiva** — Grid con fotos o emoji, redes sociales
5. **Comités** — Grid dinámico, se sincroniza con el modal de inscripción
6. **Noticias** — Cards dinámicas con tags y fechas formateadas
7. **Galería** — Grid con imágenes o emoji+gradiente, overlay hover
8. **Contacto** — Formulario validado + info de contacto
9. **CTA de registro** — Modal de inscripción
10. **Footer** — Navegación, recursos, redes sociales

---

## ⚙️ Frontend — Panel de Administración

**Archivo:** `admin.html`

### Características
- **SPA:** Navegación por tabs sin recarga
- **Auth:** Login/registro con validación, sesión persistida en localStorage
- **Responsive:** Sidebar colapsable en mobile
- **Temas:** Modo claro/oscuro sincronizado con landing

### Secciones del panel
1. **Dashboard** — Stats cards + próximos eventos
2. **Contadores** — Tabla con CRUD
3. **Eventos** — Tabla con CRUD completo
4. **Directiva** — Tabla con thumbnails
5. **Noticias** — Tabla con CRUD
6. **Galería** — Tabla con previews
7. **Usuarios** — (solo admin) Gestión de usuarios y roles
8. **Comités** — (solo admin) Gestión de comités y miembros

---

## 🎨 Características del Admin

### Validación de formularios
- Campos requeridos marcados con `*`
- Mensajes de error inline (rojo)
- Validación HTML5 nativa (`required`, `minlength`, `pattern`, `type`)
- Validación server-side en registro (username, email, password)
- Formularios no se envían si hay errores (`checkValidity()`)

### Controles especializados

| Control | Usado en | Descripción |
|---------|----------|-------------|
| **Date Picker** | Eventos, Noticias | `<input type="date">` nativo |
| **Emoji Selector** | Eventos, Directiva, Noticias, Galería | Grid visual con 50+ emojis |
| **Color Picker** | Eventos (banner), Galería (fondo) | Dual `<input type="color">` con preview de gradiente |
| **Image Upload** | Directiva (foto), Galería, Eventos (banner) | Drag & drop, preview, max 5MB, base64 |
| **Email Validation** | Registro, Usuarios | `type="email"` + regex server-side |
| **URL Validation** | Directiva (LinkedIn, GitHub, IG) | `type="url"` |

### Sincronización con Landing
- Cambios en el admin se reflejan inmediatamente en la landing al recargar
- La landing carga datos frescos de la API en cada visita
- Imágenes subidas se sirven directamente desde el backend

---

## 📝 Changelog

### v1.0.0 — 2026-04-21
- **Inicial:** Landing page con tema rojo/blanco, modo claro/oscuro
- **Estructura:** Hero, Nosotros, Eventos (6), Directiva (7 cargos), Comités (6), Noticias, Galería, Contacto, Footer
- **Directiva:** Presidente, Vicepresidente, Secretario General, Tesorero, Síndico, Vocal 1, Vocal 2
- **Backend:** API REST en Python con SQLite, autenticación por token, CORS
- **Admin:** Panel SPA con login, CRUD completo, gestión de usuarios y comités
- **Roles:** Admin (todo) y Miembro (lectura + permisos por comité)

### v1.1.0 — 2026-04-21
- **Validación:** HTML5 validation en todos los formularios (frontend y backend)
- **Date Picker:** Campos de fecha nativos para eventos y noticias
- **Emoji Selector:** Grid visual con 50+ emojis para todos los campos emoji
- **Color Picker:** Selector dual de color con preview de gradiente en vivo
- **Image Upload:** Subida de imágenes con preview para directiva, galería y eventos
- **Landing dinámica:** Todos los datos se cargan desde la API (ya no hardcodeados)
- **Sincronización:** Cambios en admin se reflejan en landing al recargar
- **Documentación:** DOCS.md con arquitectura, APIs, esquema de DB y guía completa
