import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import EmojiPicker from '@/Components/EmojiPicker';
import ImageUpload from '@/Components/ImageUpload';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function TeamIndex({ team }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        full_name: '',
        role_title: '',
        description: '',
        avatar_emoji: '👤',
        image_url: '',
        linkedin: '',
        github: '',
        instagram: '',
        sort_order: 0,
        visible: 1
    });

    const openModal = (t = null) => {
        clearErrors();
        if (t) {
            setEditingId(t.id);
            setData({
                full_name: t.full_name || '',
                role_title: t.role_title || '',
                description: t.description || '',
                avatar_emoji: t.avatar_emoji || '👤',
                image_url: t.image_url || '',
                linkedin: t.linkedin || '',
                github: t.github || '',
                instagram: t.instagram || '',
                sort_order: t.sort_order || 0,
                visible: t.visible !== 0 ? 1 : 0
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
            put(route('admin.team.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.team.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteTeamMember = (id) => {
        if (confirm('¿Eliminar este miembro?')) {
            router.delete(route('admin.team.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Junta Directiva" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Junta Directiva</h2>
                        <p>Miembros de la directiva</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nuevo Miembro
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Miembro</th>
                                <th>Cargo</th>
                                <th>Visible</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        {t.image_url ? (
                                            <img src={`/${t.image_url}`} className="thumb-sm" alt="Foto" />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>{t.avatar_emoji || '👤'}</span>
                                        )}
                                    </td>
                                    <td><strong>{t.full_name}</strong></td>
                                    <td>{t.role_title}</td>
                                    <td>{t.visible ? '✅' : '❌'}</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(t)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {auth.user.role === 'admin' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteTeamMember(t.id)}>
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

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Miembro' : 'Nuevo Miembro'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre *</label>
                            <input 
                                value={data.full_name} 
                                onChange={e => setData('full_name', e.target.value)} 
                                required minLength="2"
                            />
                            {errors.full_name && <div className="error-msg" style={{display:'block'}}>{errors.full_name}</div>}
                        </div>
                        <div className="form-group">
                            <label>Cargo *</label>
                            <input 
                                value={data.role_title} 
                                onChange={e => setData('role_title', e.target.value)} 
                                required 
                            />
                            {errors.role_title && <div className="error-msg" style={{display:'block'}}>{errors.role_title}</div>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Descripción</label>
                        <input 
                            value={data.description} 
                            onChange={e => setData('description', e.target.value)} 
                            placeholder="5to año · Apasionada por IA..." 
                        />
                        {errors.description && <div className="error-msg" style={{display:'block'}}>{errors.description}</div>}
                    </div>

                    <EmojiPicker 
                        label="Emoji (si no hay foto)" 
                        value={data.avatar_emoji} 
                        onChange={val => setData('avatar_emoji', val)} 
                    />
                    
                    <ImageUpload 
                        label="Foto del miembro" 
                        value={data.image_url} 
                        onChange={val => setData('image_url', val)} 
                    />
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>LinkedIn</label>
                            <input 
                                type="url" 
                                value={data.linkedin} 
                                onChange={e => setData('linkedin', e.target.value)} 
                                placeholder="https://linkedin.com/in/..." 
                            />
                            {errors.linkedin && <div className="error-msg" style={{display:'block'}}>{errors.linkedin}</div>}
                        </div>
                        <div className="form-group">
                            <label>GitHub</label>
                            <input 
                                type="url" 
                                value={data.github} 
                                onChange={e => setData('github', e.target.value)} 
                                placeholder="https://github.com/..." 
                            />
                            {errors.github && <div className="error-msg" style={{display:'block'}}>{errors.github}</div>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Instagram</label>
                            <input 
                                type="url" 
                                value={data.instagram} 
                                onChange={e => setData('instagram', e.target.value)} 
                                placeholder="https://instagram.com/..." 
                            />
                            {errors.instagram && <div className="error-msg" style={{display:'block'}}>{errors.instagram}</div>}
                        </div>
                        <div className="form-group">
                            <label>Orden</label>
                            <input 
                                type="number" 
                                value={data.sort_order} 
                                onChange={e => setData('sort_order', e.target.value)} 
                            />
                            {errors.sort_order && <div className="error-msg" style={{display:'block'}}>{errors.sort_order}</div>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Visible</label>
                        <select value={data.visible} onChange={e => setData('visible', e.target.value)}>
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                        {errors.visible && <div className="error-msg" style={{display:'block'}}>{errors.visible}</div>}
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
