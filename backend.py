#!/usr/bin/env python3
"""ASEISI Backend — REST API with auth, roles, full CMS, and image uploads."""

import json, hashlib, secrets, sqlite3, os, time, base64, mimetypes, re, cgi, io
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aseisi.db")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
PORT = 8092

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─── Database ───────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        active INTEGER NOT NULL DEFAULT 1,
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at REAL NOT NULL,
        expires_at REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS counters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        emoji TEXT DEFAULT '📅',
        event_date TEXT,
        location TEXT,
        capacity INTEGER DEFAULT 0,
        duration TEXT,
        status TEXT DEFAULT 'upcoming',
        gradient TEXT DEFAULT 'linear-gradient(135deg, #B71C1C, #D32F2F)',
        sort_order INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1,
        image_url TEXT,
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        role_title TEXT NOT NULL,
        description TEXT,
        avatar_emoji TEXT DEFAULT '👤',
        image_url TEXT,
        linkedin TEXT,
        github TEXT,
        instagram TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS committees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'fas fa-users',
        member_count INTEGER DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS committee_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        committee_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        FOREIGN KEY (committee_id) REFERENCES committees(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(committee_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        tag TEXT DEFAULT '📢 Noticia',
        published_date TEXT,
        visible INTEGER NOT NULL DEFAULT 1,
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caption TEXT NOT NULL,
        emoji TEXT DEFAULT '📷',
        gradient TEXT DEFAULT 'linear-gradient(135deg, #B71C1C, #D32F2F)',
        image_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS about_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'fas fa-info-circle',
        sort_order INTEGER NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );
    CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        committee_id INTEGER NOT NULL,
        permission TEXT NOT NULL,
        FOREIGN KEY (committee_id) REFERENCES committees(id) ON DELETE CASCADE,
        UNIQUE(committee_id, permission)
    );
    """)

    # Add columns if missing (migration)
    for tbl, col, default in [
        ("events", "image_url", None),
        ("team_members", "image_url", None),
        ("gallery", "image_url", None),
    ]:
        try:
            db.execute(f"ALTER TABLE {tbl} ADD COLUMN {col} TEXT DEFAULT ?", (default,))
            db.commit()
        except:
            pass

    # Seed data
    if not db.execute("SELECT 1 FROM users WHERE role='admin'").fetchone():
        db.execute("INSERT INTO users (username,password_hash,full_name,email,role,created_at) VALUES (?,?,?,?,?,?)",
            ("admin", hashlib.sha256("admin123".encode()).hexdigest(), "Administrador ASEISI", "admin@ues.edu.sv", "admin", time.time()))

    if not db.execute("SELECT 1 FROM counters").fetchone():
        for i, (l, v) in enumerate([("Miembros Activos",350),("Eventos al Año",45),("Años de Historia",12),("Alianzas",25)]):
            db.execute("INSERT INTO counters (label,value,sort_order) VALUES (?,?,?)", (l, v, i))

    if not db.execute("SELECT 1 FROM events").fetchone():
        for i, ev in enumerate([
            ("Hackathon ASEISI 2026","48 horas para construir soluciones tecnológicas a problemas reales de El Salvador.","💻","2026-05-10","Auditorio FIA",150,"48 horas","open","linear-gradient(135deg,#B71C1C,#D32F2F)"),
            ("Taller de Inteligencia Artificial","Aprende los fundamentos de ML y redes neuronales con Python y TensorFlow.","🤖","2026-05-22","Lab de Cómputo 3",40,"4 horas","upcoming","linear-gradient(135deg,#D32F2F,#EF5350)"),
            ("Congreso de Ciberseguridad","Expertos compartirán las últimas tendencias en seguridad informática y ethical hacking.","🌐","2026-06-05","Auditorio Magno UES",300,"2 días","open","linear-gradient(135deg,#EF5350,#FF6B6B)"),
            ("Charla: Del Código al Startup","Emprendedores tech salvadoreños comparten sus historias de éxito y fracaso.","🚀","2026-04-28","Sala de Usos Múltiples",80,"2 horas","soon","linear-gradient(135deg,#B71C1C,#FF6B6B)"),
            ("Torneo de Programación Competitiva","Compite en equipos de 3 resolviendo problemas algorítmicos. Clasificatorio para ICPC.","🏆","2026-06-20","Lab de Cómputo 1 y 2",90,"5 horas","upcoming","linear-gradient(135deg,#D32F2F,#B71C1C)"),
            ("Workshop: Desarrollo Mobile","Crea tu primera app móvil con React Native. Desde cero hasta publicarla.","📱","2026-07-15","Lab de Cómputo 3",35,"6 horas","upcoming","linear-gradient(135deg,#FF6B6B,#D32F2F)"),
        ]):
            db.execute("INSERT INTO events (title,description,emoji,event_date,location,capacity,duration,status,gradient,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (*ev, i, time.time()))

    if not db.execute("SELECT 1 FROM team_members").fetchone():
        for i, t in enumerate([
            ("María Fernanda López","Presidenta","5to año · Apasionada por IA y liderazgo estudiantil","👩‍💻"),
            ("Carlos Andrés Mejía","Vicepresidente","4to año · Desarrollador full-stack y mentor","👨‍💻"),
            ("Ana Gabriela Rivas","Secretaria General","4to año · Organización de eventos y relaciones públicas","👩‍🎓"),
            ("Roberto Alejandro Cruz","Tesorero","5to año · Finanzas y gestión de proyectos","👨‍🔬"),
            ("Javier Ernesto Molina","Síndico","5to año · Fiscalización y cumplimiento estatutario","⚖️"),
            ("Sofía Alejandra Martínez","Vocal 1","3er año · Enlace estudiantil y difusión de actividades","📢"),
            ("Diego Fernando Orellana","Vocal 2","3er año · Representación estudiantil y logística de eventos","🗳️"),
        ]):
            db.execute("INSERT INTO team_members (full_name,role_title,description,avatar_emoji,sort_order) VALUES (?,?,?,?,?)", (*t, i))

    if not db.execute("SELECT 1 FROM committees").fetchone():
        for i, c in enumerate([
            ("Comité de Tecnología","Desarrollo de proyectos, administración del sitio web y talleres de programación.","fas fa-laptop-code",8),
            ("Comité de Eventos","Planificación y ejecución de hackathons, congresos, charlas y torneos.","fas fa-calendar-check",10),
            ("Comité de Comunicaciones","Redes sociales, diseño gráfico, fotografía y relaciones públicas.","fas fa-bullhorn",6),
            ("Comité Académico","Tutorías, grupos de estudio, orientación académica y vinculación con docentes.","fas fa-graduation-cap",7),
            ("Comité de Vinculación Profesional","Ferias de empleo, convenios con empresas, pasantías y certificaciones.","fas fa-briefcase",5),
            ("Comité de Bienestar Estudiantil","Actividades deportivas, culturales, de integración y bienestar mental.","fas fa-heart",6),
        ]):
            db.execute("INSERT INTO committees (name,description,icon,member_count,sort_order) VALUES (?,?,?,?,?)", (*c, i))
        for cid in range(1, 7):
            db.execute("INSERT OR IGNORE INTO permissions (committee_id,permission) VALUES (?,?)", (cid, f"manage_committee_{cid}"))

    if not db.execute("SELECT 1 FROM news").fetchone():
        for n in [
            ("Equipo UES clasifica a ICPC Latinoamérica","Tres estudiantes representarán a El Salvador en la competencia internacional.","🏆 Logro","2026-04-15"),
            ("Convenio con Microsoft para certificaciones","Acceso a certificaciones Azure y Microsoft 365 con 80% de descuento.","🤝 Alianza","2026-04-08"),
            ("Becas de verano en empresas tech","5 empresas ofrecen pasantías pagadas para miembros de ASEISI.","📢 Convocatoria","2026-04-01"),
        ]:
            db.execute("INSERT INTO news (title,content,tag,published_date,created_at) VALUES (?,?,?,?,?)", (*n, time.time()))

    if not db.execute("SELECT 1 FROM gallery").fetchone():
        for i, g in enumerate([
            ("Bienvenida Ciclo I 2026","🏫","linear-gradient(135deg,#B71C1C,#D32F2F)"),
            ("Hackathon 2025","💻","linear-gradient(135deg,#D32F2F,#EF5350)"),
            ("Graduación promoción 2025","🎓","linear-gradient(135deg,#EF5350,#FF6B6B)"),
            ("Feria de empleo tech","🤝","linear-gradient(135deg,#FF6B6B,#B71C1C)"),
            ("Torneo de programación","🏆","linear-gradient(135deg,#B71C1C,#EF5350)"),
            ("Aniversario ASEISI","🎉","linear-gradient(135deg,#D32F2F,#FF6B6B)"),
        ]):
            db.execute("INSERT INTO gallery (caption,emoji,gradient,sort_order) VALUES (?,?,?,?)", (*g, i))

    db.commit()
    db.close()

# ─── Helpers ────────────────────────────────────────────────────────────────

def hash_pw(pw): return hashlib.sha256(pw.encode()).hexdigest()

def create_session(db, uid):
    token = secrets.token_hex(32)
    now = time.time()
    db.execute("INSERT INTO sessions (token,user_id,created_at,expires_at) VALUES (?,?,?,?)", (token, uid, now, now + 86400*7))
    db.commit()
    return token

def get_user_from_token(db, token):
    row = db.execute("SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires_at>? AND u.active=1", (token, time.time())).fetchone()
    return dict(row) if row else None

def get_user_permissions(db, uid):
    rows = db.execute("SELECT p.permission FROM permissions p JOIN committee_members cm ON cm.committee_id=p.committee_id WHERE cm.user_id=?", (uid,)).fetchall()
    return {r["permission"] for r in rows}

def get_user_committees(db, uid):
    rows = db.execute("SELECT c.id,c.name,cm.role FROM committee_members cm JOIN committees c ON c.id=cm.committee_id WHERE cm.user_id=?", (uid,)).fetchall()
    return [dict(r) for r in rows]

def save_upload(data_url):
    """Save a data:image/…;base64,… URL to uploads/ and return the relative path."""
    if not data_url or not data_url.startswith("data:"):
        return data_url  # Already a path or URL
    match = re.match(r'data:(image/\w+);base64,(.*)', data_url, re.DOTALL)
    if not match:
        return None
    mime, b64data = match.group(1), match.group(2)
    ext = {"image/jpeg":"jpg","image/png":"png","image/gif":"gif","image/webp":"webp","image/svg+xml":"svg"}.get(mime, "png")
    fname = f"{secrets.token_hex(12)}.{ext}"
    fpath = os.path.join(UPLOAD_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(base64.b64decode(b64data))
    return f"uploads/{fname}"

# ─── Handler ────────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        for h, v in [("Content-Type","application/json; charset=utf-8"),
                      ("Access-Control-Allow-Origin","*"),
                      ("Access-Control-Allow-Headers","Content-Type, Authorization"),
                      ("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS"),
                      ("Content-Length",str(len(body)))]:
            self.send_header(h, v)
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, fpath):
        if not os.path.isfile(fpath):
            self.send_json({"error":"File not found"}, 404)
            return
        mime = mimetypes.guess_type(fpath)[0] or "application/octet-stream"
        with open(fpath, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", len(data))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=86400")
        self.end_headers()
        self.wfile.write(data)

    def read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0: return {}
        return json.loads(self.rfile.read(length))

    def auth(self, require_role=None):
        auth_header = self.headers.get("Authorization","")
        token = auth_header.replace("Bearer ","") if auth_header.startswith("Bearer ") else ""
        if not token:
            self.send_json({"error":"No autorizado"}, 401)
            return None
        db = get_db()
        user = get_user_from_token(db, token)
        db.close()
        if not user:
            self.send_json({"error":"Sesión inválida o expirada"}, 401)
            return None
        if require_role and user["role"] != require_role:
            self.send_json({"error":"Permisos insuficientes"}, 403)
            return None
        return user

    def check_perm(self, user, resource):
        if user["role"] == "admin": return True
        db = get_db()
        perms = get_user_permissions(db, user["id"])
        db.close()
        mapping = {"events":"committee_2","news":"committee_3","gallery":"committee_3"}
        key = mapping.get(resource)
        return key and any(key in p for p in perms)

    def do_OPTIONS(self):
        self.send_response(204)
        for h, v in [("Access-Control-Allow-Origin","*"),
                      ("Access-Control-Allow-Headers","Content-Type, Authorization"),
                      ("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS")]:
            self.send_header(h, v)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/")

        # Serve uploaded files
        if path.startswith("/uploads/"):
            fpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), path.lstrip("/"))
            return self.send_file(fpath)

        # Public endpoints
        public_map = {
            "/api/public/counters": ("counters", "sort_order"),
            "/api/public/events": ("events", "sort_order"),
            "/api/public/team": ("team_members", "sort_order"),
            "/api/public/committees": ("committees", "sort_order"),
            "/api/public/news": ("news", "created_at DESC"),
            "/api/public/gallery": ("gallery", "sort_order"),
        }
        if path in public_map:
            tbl, order = public_map[path]
            visible = " WHERE visible=1" if tbl != "counters" else ""
            db = get_db()
            rows = db.execute(f"SELECT * FROM {tbl}{visible} ORDER BY {order}").fetchall()
            db.close()
            return self.send_json([dict(r) for r in rows])

        if path == "/api/me":
            user = self.auth()
            if not user: return
            db = get_db()
            perms = get_user_permissions(db, user["id"])
            comms = get_user_committees(db, user["id"])
            db.close()
            return self.send_json({"id":user["id"],"username":user["username"],"full_name":user["full_name"],"email":user["email"],"role":user["role"],"permissions":list(perms),"committees":comms})

        if path == "/api/admin/users":
            user = self.auth(require_role="admin")
            if not user: return
            db = get_db()
            rows = db.execute("SELECT id,username,full_name,email,role,active,created_at FROM users ORDER BY id").fetchall()
            result = []
            for r in rows:
                u = dict(r); u["committees"] = get_user_committees(db, u["id"]); result.append(u)
            db.close()
            return self.send_json(result)

        # Admin list (all, including hidden)
        admin_tables = {"counters":"counters","events":"events","team_members":"team_members","committees":"committees","news":"news","gallery":"gallery"}
        for res, tbl in admin_tables.items():
            if path == f"/api/admin/{res}":
                user = self.auth()
                if not user: return
                if not self.check_perm(user, res):
                    return self.send_json({"error":"Permisos insuficientes"}, 403)
                db = get_db()
                rows = db.execute(f"SELECT * FROM {tbl} ORDER BY sort_order, id").fetchall()
                db.close()
                return self.send_json([dict(r) for r in rows])

        # Committee members
        m = re.match(r"/api/admin/committee/(\d+)/members", path)
        if m:
            user = self.auth()
            if not user: return
            db = get_db()
            rows = db.execute("SELECT cm.id,cm.role,u.id as user_id,u.username,u.full_name FROM committee_members cm JOIN users u ON cm.user_id=u.id WHERE cm.committee_id=?", (m.group(1),)).fetchall()
            db.close()
            return self.send_json([dict(r) for r in rows])

        self.send_json({"error":"Not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path.rstrip("/")
        body = self.read_body()

        if path == "/api/login":
            u, p = body.get("username",""), body.get("password","")
            if not u or not p: return self.send_json({"error":"Credenciales requeridas"}, 400)
            db = get_db()
            user = db.execute("SELECT * FROM users WHERE username=? AND password_hash=? AND active=1", (u, hash_pw(p))).fetchone()
            if not user: db.close(); return self.send_json({"error":"Credenciales inválidas"}, 401)
            token = create_session(db, user["id"])
            perms = get_user_permissions(db, user["id"])
            comms = get_user_committees(db, user["id"])
            db.close()
            return self.send_json({"token":token,"user":{"id":user["id"],"username":user["username"],"full_name":user["full_name"],"role":user["role"],"permissions":list(perms),"committees":comms}})

        if path == "/api/register":
            un, pw, fn = body.get("username","").strip(), body.get("password","").strip(), body.get("full_name","").strip()
            email = body.get("email","").strip()
            errors = []
            if not un or len(un) < 3: errors.append("Usuario debe tener al menos 3 caracteres")
            if not pw or len(pw) < 6: errors.append("Contraseña debe tener al menos 6 caracteres")
            if not fn: errors.append("Nombre completo es requerido")
            if email and not re.match(r'^[^@]+@[^@]+\.[^@]+$', email): errors.append("Correo electrónico inválido")
            if errors: return self.send_json({"error": "; ".join(errors)}, 400)
            db = get_db()
            if db.execute("SELECT 1 FROM users WHERE username=?", (un,)).fetchone():
                db.close(); return self.send_json({"error":"El usuario ya existe"}, 409)
            db.execute("INSERT INTO users (username,password_hash,full_name,email,role,created_at) VALUES (?,?,?,?,?,?)", (un, hash_pw(pw), fn, email, "member", time.time()))
            db.commit(); db.close()
            return self.send_json({"ok":True,"message":"Usuario registrado exitosamente"})

        if path == "/api/logout":
            auth_header = self.headers.get("Authorization","")
            token = auth_header.replace("Bearer ","")
            if token:
                db = get_db(); db.execute("DELETE FROM sessions WHERE token=?", (token,)); db.commit(); db.close()
            return self.send_json({"ok":True})

        if path == "/api/upload":
            user = self.auth()
            if not user: return
            img_data = body.get("image","")
            if not img_data: return self.send_json({"error":"No image data"}, 400)
            url = save_upload(img_data)
            if not url: return self.send_json({"error":"Invalid image"}, 400)
            return self.send_json({"url":url})

        # CRUD create
        resources = [
            ("counters","counters",["label","value","sort_order"]),
            ("events","events",["title","description","emoji","event_date","location","capacity","duration","status","gradient","sort_order","visible","image_url"]),
            ("team","team_members",["full_name","role_title","description","avatar_emoji","image_url","linkedin","github","instagram","sort_order","visible"]),
            ("committees","committees",["name","description","icon","member_count","sort_order","visible"]),
            ("news","news",["title","content","tag","published_date","visible"]),
            ("gallery","gallery",["caption","emoji","gradient","image_url","sort_order","visible"]),
        ]
        for res, tbl, fields in resources:
            if path == f"/api/admin/{res}":
                user = self.auth()
                if not user: return
                if not self.check_perm(user, res): return self.send_json({"error":"Permisos insuficientes"}, 403)
                # Handle image uploads inline
                for img_field in ["image_url"]:
                    if img_field in body and body[img_field] and body[img_field].startswith("data:"):
                        body[img_field] = save_upload(body[img_field])
                cols = [f for f in fields if f in body]
                if tbl in ("events","news"):
                    cols_ts = cols + ["created_at"]; vals = [body[f] for f in cols] + [time.time()]
                else:
                    cols_ts = cols; vals = [body[f] for f in cols]
                db = get_db()
                cur = db.execute(f"INSERT INTO {tbl} ({','.join(cols_ts)}) VALUES ({','.join(['?']*len(cols_ts))})", vals)
                db.commit()
                row = db.execute(f"SELECT * FROM {tbl} WHERE id=?", (cur.lastrowid,)).fetchone()
                db.close()
                return self.send_json(dict(row), 201)

        if path == "/api/admin/users":
            user = self.auth(require_role="admin")
            if not user: return
            un = body.get("username","").strip()
            if not un: return self.send_json({"error":"Username requerido"}, 400)
            db = get_db()
            if db.execute("SELECT 1 FROM users WHERE username=?", (un,)).fetchone():
                db.close(); return self.send_json({"error":"El usuario ya existe"}, 409)
            db.execute("INSERT INTO users (username,password_hash,full_name,email,role,created_at) VALUES (?,?,?,?,?,?)",
                (un, hash_pw(body.get("password","aseisi2026")), body.get("full_name",""), body.get("email",""), body.get("role","member"), time.time()))
            db.commit(); db.close()
            return self.send_json({"ok":True}, 201)

        m = re.match(r"/api/admin/committee/(\d+)/members", path)
        if m:
            user = self.auth(require_role="admin")
            if not user: return
            db = get_db()
            try:
                db.execute("INSERT INTO committee_members (committee_id,user_id,role) VALUES (?,?,?)", (m.group(1), body["user_id"], body.get("role","member")))
                db.commit()
            except sqlite3.IntegrityError:
                db.close(); return self.send_json({"error":"Ya pertenece a este comité"}, 409)
            db.close()
            return self.send_json({"ok":True}, 201)

        self.send_json({"error":"Not found"}, 404)

    def do_PUT(self):
        path = urlparse(self.path).path.rstrip("/")
        body = self.read_body()

        resources = [
            ("counters","counters",["label","value","sort_order"]),
            ("events","events",["title","description","emoji","event_date","location","capacity","duration","status","gradient","sort_order","visible","image_url"]),
            ("team","team_members",["full_name","role_title","description","avatar_emoji","image_url","linkedin","github","instagram","sort_order","visible"]),
            ("committees","committees",["name","description","icon","member_count","sort_order","visible"]),
            ("news","news",["title","content","tag","published_date","visible"]),
            ("gallery","gallery",["caption","emoji","gradient","image_url","sort_order","visible"]),
        ]
        for res, tbl, fields in resources:
            prefix = f"/api/admin/{res}/"
            if path.startswith(prefix):
                item_id = path[len(prefix):]
                user = self.auth()
                if not user: return
                if not self.check_perm(user, res): return self.send_json({"error":"Permisos insuficientes"}, 403)
                for img_field in ["image_url"]:
                    if img_field in body and body[img_field] and isinstance(body[img_field], str) and body[img_field].startswith("data:"):
                        body[img_field] = save_upload(body[img_field])
                cols = [f for f in fields if f in body]
                if not cols: return self.send_json({"error":"Nada que actualizar"}, 400)
                sets = ",".join(f"{c}=?" for c in cols)
                vals = [body[c] for c in cols] + [item_id]
                db = get_db()
                db.execute(f"UPDATE {tbl} SET {sets} WHERE id=?", vals)
                db.commit()
                row = db.execute(f"SELECT * FROM {tbl} WHERE id=?", (item_id,)).fetchone()
                db.close()
                return self.send_json(dict(row) if row else {"ok":True})

        if path.startswith("/api/admin/users/"):
            user = self.auth(require_role="admin")
            if not user: return
            uid = path.split("/")[-1]
            db = get_db()
            updates, vals = [], []
            for f in ["full_name","email","role","active"]:
                if f in body: updates.append(f"{f}=?"); vals.append(body[f])
            if body.get("password"): updates.append("password_hash=?"); vals.append(hash_pw(body["password"]))
            if updates: vals.append(uid); db.execute(f"UPDATE users SET {','.join(updates)} WHERE id=?", vals); db.commit()
            db.close()
            return self.send_json({"ok":True})

        self.send_json({"error":"Not found"}, 404)

    def do_DELETE(self):
        path = urlparse(self.path).path.rstrip("/")
        for res, tbl in [("counters","counters"),("events","events"),("team","team_members"),("committees","committees"),("news","news"),("gallery","gallery")]:
            prefix = f"/api/admin/{res}/"
            if path.startswith(prefix):
                user = self.auth(require_role="admin")
                if not user: return
                db = get_db(); db.execute(f"DELETE FROM {tbl} WHERE id=?", (path[len(prefix):],)); db.commit(); db.close()
                return self.send_json({"ok":True})

        if path.startswith("/api/admin/users/"):
            user = self.auth(require_role="admin")
            if not user: return
            uid = path.split("/")[-1]
            if str(user["id"]) == str(uid): return self.send_json({"error":"No puedes eliminarte"}, 400)
            db = get_db()
            for tbl in ["committee_members","sessions","users"]:
                col = "user_id" if tbl != "users" else "id"
                db.execute(f"DELETE FROM {tbl} WHERE {col}=?", (uid,))
            db.commit(); db.close()
            return self.send_json({"ok":True})

        if path.startswith("/api/admin/committee-member/"):
            user = self.auth(require_role="admin")
            if not user: return
            db = get_db(); db.execute("DELETE FROM committee_members WHERE id=?", (path.split("/")[-1],)); db.commit(); db.close()
            return self.send_json({"ok":True})

        self.send_json({"error":"Not found"}, 404)

if __name__ == "__main__":
    init_db()
    print(f"🎓 ASEISI Backend en http://localhost:{PORT}")
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
