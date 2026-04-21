import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import '../../../css/admin.css';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        // Initialize theme for login screen
        const storedTheme = localStorage.getItem('aseisi-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', storedTheme);
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-screen" id="loginScreen">
            <Head title="Iniciar Sesión - ASEISI Admin" />

            <div className="login-box">
                <h1>🎓 ASEISI Admin</h1>
                <p className="subtitle">Panel de Administración</p>

                {status && (
                    <div className="form-group" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '1rem' }}>
                        {status}
                    </div>
                )}

                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label>Correo Institucional</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            autoFocus
                            placeholder="tu@ues.edu.sv"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <div className="error-msg" style={{ display: 'block', marginTop: '.25rem' }}>{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={data.password}
                            placeholder="Tu contraseña"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <div className="error-msg" style={{ display: 'block', marginTop: '.25rem' }}>{errors.password}</div>}
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '1rem' }}>
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="remember" style={{ margin: 0, fontWeight: 'normal', color: 'var(--muted)' }}>
                            Mantener sesión iniciada
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }} disabled={processing}>
                        <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--muted)' }}>
                    ¿Problemas para acceder? <a href="mailto:aseisi@ues.edu.sv" style={{ color: 'var(--red)' }}>Contactar soporte</a>
                </p>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.8rem' }}>
                    <Link href={route('home')} style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
                        &larr; Volver al sitio web
                    </Link>
                </p>
            </div>
        </div>
    );
}
