import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UsersIndex({ users }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'member'
    });

    const openModal = (u = null) => {
        clearErrors();
        if (u) {
            setEditingId(u.id);
            setData({
                name: u.name || '',
                email: u.email || '',
                password: '',
                role: u.role || 'member'
            });
        } else {
            setEditingId(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.users.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteUser = (id) => {
        if (id === auth.user.id) {
            alert('No puedes eliminarte a ti mismo.');
            return;
        }
        if (confirm('¿Eliminar este usuario?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Usuarios" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Usuarios del Sistema</h2>
                        <p>Gestión de cuentas y roles</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-user-plus"></i> Nuevo Usuario
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge role-${u.role}`}>
                                            {u.role === 'admin' ? '🔑 Admin' : '👤 Miembro'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(u)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {u.id !== auth.user.id && (
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required 
                        />
                        {errors.name && <div className="error-msg" style={{display:'block'}}>{errors.name}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label>Correo Electrónico *</label>
                        <input 
                            type="email"
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            required 
                        />
                        {errors.email && <div className="error-msg" style={{display:'block'}}>{errors.email}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label>Contraseña {editingId && '(dejar en blanco para no cambiar)'}</label>
                        <input 
                            type="password"
                            value={data.password} 
                            onChange={e => setData('password', e.target.value)} 
                            required={!editingId}
                        />
                        {errors.password && <div className="error-msg" style={{display:'block'}}>{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label>Rol</label>
                        <select value={data.role} onChange={e => setData('role', e.target.value)}>
                            <option value="member">Miembro</option>
                            <option value="admin">Administrador</option>
                        </select>
                        {errors.role && <div className="error-msg" style={{display:'block'}}>{errors.role}</div>}
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={closeModal} disabled={processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={processing}>
                            <i className="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </AdminModal>
        </AdminLayout>
    );
}
