import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Index({ counters, events, team, committees, news, gallery }) {
    const [theme, setTheme] = useState('dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const s = localStorage.getItem('aseisi-theme');
        if (s) setTheme(s);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('aseisi-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    const imgUrl = (p) => {
        if (!p) return '';
        if (p.startsWith('http') || p.startsWith('data:')) return p;
        return '/storage/' + p;
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d + 'T00:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const STATUS_LABELS = { upcoming: 'Próximamente', open: 'Inscripciones Abiertas', soon: 'Próxima Semana' };

    return (
        <>
            <Head title="ASEISI — Asociación de Estudiantes de Ingeniería en Sistemas Informáticos" />
            
            <nav id="navbar">
                <a href="#hero" className="nav-brand"><span>🎓 ASEISI</span></a>
                <div className="nav-right">
                    <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        <li><a href="#about" onClick={() => setMenuOpen(false)}>Nosotros</a></li>
                        <li><a href="#events" onClick={() => setMenuOpen(false)}>Eventos</a></li>
                        <li><a href="#team" onClick={() => setMenuOpen(false)}>Directiva</a></li>
                        <li><a href="#news" onClick={() => setMenuOpen(false)}>Noticias</a></li>
                        <li><a href="#gallery" onClick={() => setMenuOpen(false)}>Galería</a></li>
                        <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contacto</a></li>
                        <li><a href="#" className="btn btn-primary" onClick={(e) => { e.preventDefault(); setModalOpen(true); }} style={{ padding: '.5rem 1.2rem', fontSize: '.85rem' }}>Inscribirse</a></li>
                        <li><Link href={route('login')} className="btn btn-outline" style={{ padding: '.5rem 1.2rem', fontSize: '.85rem', border: '1px solid rgba(211,47,47,0.3)' }}><i className="fas fa-sign-in-alt"></i> Iniciar Sesión</Link></li>
                    </ul>
                    <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </nav>

            <section className="hero" id="hero">
                <div className="hero-content">
                    <div className="hero-badge">🇸🇻 Universidad de El Salvador — FIA</div>
                    <h1>Asociación de Estudiantes de Ingeniería en Sistemas Informáticos</h1>
                    <p>Formando la próxima generación de ingenieros en tecnología. Comunidad, innovación y excelencia académica.</p>
                    <div className="hero-buttons">
                        <a href="#events" className="btn btn-primary"><i className="fas fa-calendar-alt"></i> Ver Eventos</a>
                        <a href="#" className="btn btn-outline" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}><i className="fas fa-user-plus"></i> Únete a ASEISI</a>
                    </div>
                    <div className="hero-stats">
                        {counters.map(c => (
                            <div className="stat" key={c.id}>
                                <div className="stat-number">{c.value}+</div>
                                <div className="stat-label">{c.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about">
                <div className="section-header fade-in"><h2>¿Quiénes Somos?</h2><p>ASEISI es la voz estudiantil de la carrera de Ingeniería en Sistemas Informáticos en la Universidad de El Salvador</p></div>
                <div className="about-grid">
                    <div className="about-card card fade-in"><div className="icon"><i className="fas fa-bullseye"></i></div><h3>Misión</h3><p>Representar y fortalecer la comunidad estudiantil de Ingeniería en Sistemas, promoviendo el desarrollo académico, profesional y personal.</p></div>
                    <div className="about-card card fade-in"><div className="icon"><i className="fas fa-eye"></i></div><h3>Visión</h3><p>Ser la asociación estudiantil referente en tecnología e innovación de El Salvador, formando líderes que transformen la industria.</p></div>
                    <div className="about-card card fade-in"><div className="icon"><i className="fas fa-code"></i></div><h3>Tecnología</h3><p>Organizamos hackathons, talleres de programación, charlas tech y proyectos open source.</p></div>
                    <div className="about-card card fade-in"><div className="icon"><i className="fas fa-handshake"></i></div><h3>Comunidad</h3><p>Creamos espacios de networking con empresas, egresados y profesionales para impulsar oportunidades.</p></div>
                </div>
            </section>

            <section id="events">
                <div className="section-header fade-in"><h2>Eventos y Actividades</h2><p>Desde hackathons hasta charlas con líderes de la industria</p></div>
                <div className="events-grid">
                    {events.map(e => (
                        <div className="event-card card fade-in" key={e.id}>
                            <div className="event-banner" style={{ background: !e.image_url ? e.gradient : '' }}>
                                {e.image_url ? <img src={imgUrl(e.image_url)} alt={e.title} /> : <span className="banner-emoji">{e.emoji || '📅'}</span>}
                                <span className={`event-status status-${e.status || 'upcoming'}`}>{STATUS_LABELS[e.status] || e.status}</span>
                                <span className="event-date-badge">{formatDate(e.event_date)}</span>
                            </div>
                            <div className="event-info">
                                <h3>{e.title}</h3>
                                <p>{e.description}</p>
                                <div className="event-meta">
                                    <span><i className="fas fa-map-marker-alt"></i> {e.location}</span>
                                    <span><i className="fas fa-users"></i> {e.capacity} cupos</span>
                                    <span><i className="fas fa-clock"></i> {e.duration}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            <section id="team">
                <div className="section-header fade-in"><h2>Junta Directiva</h2><p>El equipo que lidera ASEISI</p></div>
                <div className="team-grid">
                    {team.map(t => (
                        <div className="team-card card fade-in" key={t.id}>
                            {t.image_url ? 
                                <div className="team-avatar"><img src={imgUrl(t.image_url)} alt={t.full_name} /></div> : 
                                <div className="team-avatar">{t.avatar_emoji || '👤'}</div>
                            }
                            <h3>{t.full_name}</h3>
                            <div className="role">{t.role_title}</div>
                            {t.description && <p>{t.description}</p>}
                            {(t.linkedin || t.github || t.instagram) && (
                                <div className="team-socials">
                                    {t.linkedin && <a href={t.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>}
                                    {t.github && <a href={t.github} target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>}
                                    {t.instagram && <a href={t.instagram} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="section-subtitle fade-in">
                    <h3><i className="fas fa-people-group"></i> Comités de Trabajo</h3>
                    <p>Equipos especializados que impulsan las áreas clave</p>
                </div>
                <div className="comite-grid">
                    {committees.map(c => (
                        <div className="comite-card card fade-in" key={c.id}>
                            <div className="comite-icon"><i className={c.icon || 'fas fa-users'}></i></div>
                            <h3>{c.name}</h3>
                            <p>{c.description}</p>
                            <span className="comite-members">👥 {c.member_count || 0} miembros</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id="news">
                <div className="section-header fade-in"><h2>Noticias</h2><p>Lo último de ASEISI</p></div>
                <div className="news-grid">
                    {news.map(n => (
                        <div className="news-card card fade-in" style={{ padding: '1.5rem' }} key={n.id}>
                            <span className="news-tag">{n.tag}</span>
                            <h3>{n.title}</h3>
                            <p>{n.content}</p>
                            <span className="news-date"><i className="fas fa-calendar"></i> {formatDate(n.published_date)}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id="gallery">
                <div className="section-header fade-in"><h2>Galería</h2><p>Momentos que nos definen</p></div>
                <div className="gallery-grid">
                    {gallery.map(g => (
                        <div className="gallery-item fade-in" style={{ background: !g.image_url ? g.gradient : '' }} key={g.id}>
                            {g.image_url ? 
                                <img src={imgUrl(g.image_url)} alt={g.caption} /> : 
                                <span className="g-emoji">{g.emoji || '📷'}</span>
                            }
                            <div className="gallery-overlay"><span>{g.caption}</span></div>
                        </div>
                    ))}
                </div>
            </section>

            <footer>
                <div className="footer-bottom"><p>© 2026 ASEISI — Universidad de El Salvador. Hecho con ❤️ por estudiantes, para estudiantes.</p></div>
            </footer>

            {/* Registration Modal */}
            <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setModalOpen(false); }}>
                <div className="modal">
                    <button className="modal-close" onClick={() => setModalOpen(false)}><i className="fas fa-times"></i></button>
                    <h2>📝 Inscripción ASEISI</h2>
                    <p>Completa el formulario para unirte</p>
                    <form onSubmit={(e) => { e.preventDefault(); alert("Inscripción enviada"); setModalOpen(false); }}>
                        <div className="form-group"><label>Nombre completo *</label><input type="text" placeholder="Tu nombre" required minLength="2" /></div>
                        <div className="form-group"><label>Correo institucional *</label><input type="email" placeholder="tu@ues.edu.sv" required /></div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}><i className="fas fa-check"></i> Enviar Inscripción</button>
                    </form>
                </div>
            </div>
        </>
    );
}
