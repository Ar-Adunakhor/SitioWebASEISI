import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import '../../css/admin.css';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('aseisi-theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aseisi-theme', newTheme);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="dashboard" id="dashboard">
            <aside className="sidebar">
                <div className="sidebar-brand">🎓 ASEISI Panel</div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">General</div>
                    <Link href={route('dashboard')} className={route().current('dashboard') ? 'active' : ''}>
                        <i className="fas fa-th-large"></i> Dashboard
                    </Link>
                    <Link href={route('admin.counters.index')} className={route().current('admin.counters.*') ? 'active' : ''}>
                        <i className="fas fa-chart-bar"></i> Contadores
                    </Link>
                    <Link href={route('admin.events.index')} className={route().current('admin.events.*') ? 'active' : ''}>
                        <i className="fas fa-calendar-alt"></i> Eventos
                    </Link>
                    <Link href={route('admin.team.index')} className={route().current('admin.team.*') ? 'active' : ''}>
                        <i className="fas fa-user-tie"></i> Directiva
                    </Link>
                    <Link href={route('admin.news.index')} className={route().current('admin.news.*') ? 'active' : ''}>
                        <i className="fas fa-newspaper"></i> Noticias
                    </Link>
                    <Link href={route('admin.gallery.index')} className={route().current('admin.gallery.*') ? 'active' : ''}>
                        <i className="fas fa-images"></i> Galería
                    </Link>

                    {isAdmin && (
                        <>
                            <div className="sidebar-section" id="adminSection">Administración</div>
                            <Link href={route('admin.users.index')} className={route().current('admin.users.*') ? 'active' : ''}>
                                <i className="fas fa-users-cog"></i> Usuarios
                            </Link>
                            <Link href={route('admin.committees.index')} className={route().current('admin.committees.*') ? 'active' : ''}>
                                <i className="fas fa-people-group"></i> Comités
                            </Link>
                        </>
                    )}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">👤</div>
                        <div className="info">
                            <div className="name" id="sidebarName">{user?.full_name || user?.name}</div>
                            <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-member'}`} id="sidebarRole">
                                {isAdmin ? '🔑 Admin' : '👤 Miembro'}
                            </span>
                        </div>
                        <button className="theme-btn" onClick={toggleTheme} title="Cambiar tema">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    </div>
                    <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem' }}>
                        <Link href={route('home')} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                            <i className="fas fa-globe"></i> Sitio
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                            <i className="fas fa-sign-out-alt"></i> Salir
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
