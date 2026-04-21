import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function CommitteesIndex({ committees, all_users }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Modal state for members
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: ''
    });

    const openModal = (c = null) => {
        clearErrors();
        if (c) {
            setEditingId(c.id);
            setData({
                name: c.name || '',
                description: c.description || ''
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
            put(route('admin.committees.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.committees.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteCommittee = (id) => {
        if (confirm('¿Eliminar este comité?')) {
            router.delete(route('admin.committees.destroy', id));
        }
    };

    // Member Management
    const openMembersModal = (c) => {
        setSelectedCommittee(c);
        setSelectedUserId('');
        setShowMembersModal(true);
    };

    const closeMembersModal = () => {
        setShowMembersModal(false);
        setSelectedCommittee(null);
        setSelectedUserId('');
    };

    const addMember = (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedCommittee) return;
        
        router.post(route('admin.committees.members.add', selectedCommittee.id), {
            user_id: selectedUserId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUserId('');
                // Inertia automatically updates `committees` prop, so we just need to update selectedCommittee
                const updated = committees.find(c => c.id === selectedCommittee.id);
                if (updated) setSelectedCommittee(updated);
            }
        });
    };

    const removeMember = (userId) => {
        if (!selectedCommittee) return;
        if (confirm('¿Eliminar miembro del comité?')) {
            router.delete(route('admin.committees.members.remove', [selectedCommittee.id, userId]), {
                preserveScroll: true,
                onSuccess: () => {
                    const updated = committees.find(c => c.id === selectedCommittee.id);
                    if (updated) setSelectedCommittee(updated);
                }
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Comités" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Comités ASEISI</h2>
                        <p>Gestión de comités y sus miembros</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nuevo Comité
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Miembros</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {committees.map((c) => (
                                <tr key={c.id}>
                                    <td><strong>{c.name}</strong><br/><span style={{fontSize:'.8rem', color:'var(--muted)'}}>{c.description}</span></td>
                                    <td>{c.users?.length || 0} miembros</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openMembersModal(c)} title="Ver Miembros">
                                            <i className="fas fa-users"></i> Miembros
                                        </button>
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(c)} title="Editar">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {auth.user.role === 'admin' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteCommittee(c.id)} title="Eliminar">
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

            {/* Modal de CRUD de Comité */}
            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Comité' : 'Nuevo Comité'}>
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
                        <label>Descripción</label>
                        <textarea 
                            rows="3"
                            value={data.description} 
                            onChange={e => setData('description', e.target.value)} 
                        />
                        {errors.description && <div className="error-msg" style={{display:'block'}}>{errors.description}</div>}
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

            {/* Modal de Miembros */}
            <AdminModal show={showMembersModal} onClose={closeMembersModal} title={`Miembros: ${selectedCommittee?.name}`}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={addMember} style={{ display: 'flex', gap: '.5rem' }}>
                        <select 
                            className="form-group" 
                            style={{ flex: 1, marginBottom: 0 }} 
                            value={selectedUserId} 
                            onChange={e => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Seleccionar Usuario --</option>
                            {all_users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                        <button type="submit" className="btn btn-primary" disabled={!selectedUserId}>
                            Añadir
                        </button>
                    </form>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: 'var(--bg2)' }}>
                            <tr>
                                <th>Nombre</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCommittee?.users?.length > 0 ? (
                                selectedCommittee.users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <strong>{u.name}</strong><br/>
                                            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{u.email}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeMember(u.id)} type="button">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                                        No hay miembros asignados a este comité.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminModal>
        </AdminLayout>
    );
}
