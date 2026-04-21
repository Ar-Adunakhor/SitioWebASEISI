import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, stats, upcomingEvents }) {
    return (
        <AdminLayout>
            <Head title="Dashboard" />
            
            <div className="tab-content active" id="tab-overview">
                <div className="page-header">
                    <div>
                        <h2>Dashboard</h2>
                        <p>Resumen general de ASEISI</p>
                    </div>
                </div>
                
                <div className="stat-cards" id="overviewStats">
                    <div className="stat-card">
                        <div className="label">Usuarios</div>
                        <div className="value">{stats.users}</div>
                    </div>
                    <div className="stat-card">
                        <div className="label">Eventos</div>
                        <div className="value">{stats.events}</div>
                    </div>
                    <div className="stat-card">
                        <div className="label">Comités</div>
                        <div className="value">{stats.committees}</div>
                    </div>
                    <div className="stat-card">
                        <div className="label">Noticias</div>
                        <div className="value">{stats.news}</div>
                    </div>
                </div>
                
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>📅 Próximos Eventos</h3>
                    <div id="overviewEvents">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((e) => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <span style={{ marginRight: '.5rem' }}>{e.emoji || '📅'}</span>
                                        <strong>{e.title}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                                            {new Date(e.event_date + 'T00:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className={`badge badge-${e.status || 'upcoming'}`}>{e.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--muted)' }}>No hay eventos programados.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
