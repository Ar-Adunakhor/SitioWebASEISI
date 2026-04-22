# 🎓 Plataforma Web ASEISI

Plataforma oficial de la **Asociación de Estudiantes de Ingeniería en Sistemas Informáticos (ASEISI)** de la Universidad de El Salvador. 

Este proyecto es una aplicación web moderna desarrollada con **Laravel 11** y **React (Inertia.js)** que permite a la asociación gestionar de manera dinámica su landing page pública a través de un panel de administración integrado.

---

## 🚀 Tecnologías Utilizadas

*   **Backend:** Laravel 11 (PHP 8.4)
*   **Base de Datos:** PostgreSQL
*   **Frontend:** React 18, Inertia.js
*   **Empaquetador:** Vite
*   **Estilos:** Vanilla CSS (Sistema de diseño propio con soporte nativo para Dark Mode)

---

## ⚙️ Guía de Instalación y Ejecución

A continuación, se detallan los pasos para levantar el proyecto en una computadora nueva, tanto para Linux como para Windows.

### 📋 Requisitos Previos (Para ambos sistemas)
Asegúrate de tener instalados los siguientes programas en tu computadora:
1.  **PHP** (v8.2 o superior, idealmente v8.4) con las extensiones `pdo_pgsql`, `mbstring`, `xml`, `curl` y `zip`.
2.  **Composer** (Gestor de dependencias de PHP).
3.  **Node.js** (v18 o superior) y **npm**.
4.  **PostgreSQL** (v14 o superior).
5.  **Git**.

---

### 🐧 Pasos para Linux (Ubuntu/Debian/Mint)

**1. Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd aseisi
```

**2. Instalar dependencias**
```bash
composer install
npm install
```

**3. Configurar el archivo de entorno**
```bash
cp .env.example .env
php artisan key:generate
```
Abre el archivo `.env` y asegúrate de que la conexión a la base de datos esté configurada así:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=aseisi
DB_USERNAME=postgres
DB_PASSWORD=postgres
```
*(Asegúrate de que la contraseña coincida con tu usuario de PostgreSQL).*

**4. Crear la base de datos en PostgreSQL**
```bash
sudo -u postgres psql -c "CREATE DATABASE aseisi;"
```
*(Si tu usuario `postgres` necesita contraseña, puedes asignarla con: `sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"*)*

**5. Preparar la Base de Datos y el Almacenamiento**
```bash
php artisan migrate --seed
php artisan storage:link
```

**6. Ejecutar los servidores de desarrollo**
Necesitarás dos pestañas de terminal abiertas:
```bash
# Terminal 1: Servidor de Laravel
php artisan serve

# Terminal 2: Servidor de Vite (React)
npm run dev
```

---

### 🪟 Pasos para Windows

**1. Clonar el repositorio**
Abre tu terminal (PowerShell, Git Bash o CMD) y ejecuta:
```bash
git clone <URL_DEL_REPOSITORIO>
cd aseisi
```

**2. Instalar dependencias**
```bash
composer install
npm install
```

**3. Configurar el archivo de entorno**
```bash
copy .env.example .env
php artisan key:generate
```
Abre el archivo `.env` en tu editor de código y configura la base de datos de PostgreSQL:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=aseisi
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_de_postgres
```

**4. Crear la base de datos en PostgreSQL**
Abre **pgAdmin** o la herramienta de línea de comandos `psql` de PostgreSQL y crea una nueva base de datos llamada `aseisi`. 
*Si usas la consola SQL Command Line (SQL Shell):*
```sql
CREATE DATABASE aseisi;
```

**5. Preparar la Base de Datos y el Almacenamiento**
De vuelta en la terminal de tu proyecto, ejecuta:
```bash
php artisan migrate --seed
php artisan storage:link
```

**6. Ejecutar los servidores de desarrollo**
Abre dos ventanas de terminal separadas en la carpeta del proyecto:
```bash
# Terminal 1: Servidor de Laravel
php artisan serve

# Terminal 2: Servidor de Vite (React)
npm run dev
```

---

## 🔒 Acceso al Sistema

Una vez que el proyecto esté corriendo, puedes acceder a la aplicación web a través de tu navegador en:
👉 **http://localhost:8000**

### Credenciales de Administrador (Generadas por el Seeder)
Para acceder al **Panel de Administración**, haz clic en "Iniciar Sesión" en la navegación principal o ve directamente a `http://localhost:8000/login`.

*   **Correo:** `admin@ues.edu.sv`
*   **Contraseña:** `admin123`

---

## 📁 Estructura del Proyecto

El sistema está dividido en módulos administrables desde el Dashboard:
*   **Dashboard (`/admin/dashboard`)**: Resumen de estadísticas y eventos próximos.
*   **Eventos (`/admin/events`)**: Gestión de hackathons, asambleas y talleres con soporte para imágenes y estado de inscripción.
*   **Contadores (`/admin/counters`)**: Estadísticas dinámicas mostradas en la pantalla principal (ej. "Años de Experiencia", "Miembros Activos").
*   **Noticias (`/admin/news`)**: Artículos y comunicados de prensa.
*   **Junta Directiva (`/admin/team`)**: Perfiles de la directiva, con integración de redes sociales y avatares.
*   **Galería (`/admin/gallery`)**: Imágenes con layouts adaptativos.
*   **Comités (`/admin/committees`)**: (*Solo Admins*) Gestión de los equipos de trabajo y asignación de usuarios a comités específicos.
*   **Usuarios (`/admin/users`)**: (*Solo Admins*) Creación y revocación de permisos a miembros de la asociación.

---

## 🛠 Arquitectura

1.  **Enrutamiento Inertia:** La navegación de las vistas de administración ocurre del lado del cliente, permitiendo transiciones ultrarrápidas y retención de estado (ej. Sidebar y Dark Mode no parpadean al cambiar de página).
2.  **Autorización (FormRequests):** Todas las validaciones y chequeos de roles (Admin vs Miembro) ocurren directamente en clases dedicadas (`app/Http/Requests`) para garantizar la seguridad de cada endpoint.
3.  **Upload de Imágenes:** Los avatares y banners utilizan un componente reutilizable nativo de React que convierte las imágenes a Base64/Binario y las almacena en la ruta `storage/app/public` de Laravel. El comando `storage:link` permite servirlas estáticamente en la landing page.

Desarrollado con ❤️ para ASEISI.
