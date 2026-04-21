import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import EmojiPicker from '@/Components/EmojiPicker';
import ImageUpload from '@/Components/ImageUpload';
import GradientPicker from '@/Components/GradientPicker';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function GalleryIndex({ gallery }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        caption: '',
        emoji: '📷',
        gradient: '',
        image_url: '',
        sort_order: 0,
        visible: 1
    });

    const openModal = (g = null) => {
        clearErrors();
        if (g) {
            setEditingId(g.id);
            setData({
                caption: g.caption || '',
                emoji: g.emoji || '📷',
                gradient: g.gradient || '',
                image_url: g.image_url || '',
                sort_order: g.sort_order || 0,
                visible: g.visible !== 0 ? 1 : 0
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
            put(route('admin.gallery.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.gallery.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteGalleryItem = (id) => {
        if (confirm('¿Eliminar esta imagen?')) {
            router.delete(route('admin.gallery.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Galería" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Galería</h2>
                        <p>Imágenes y momentos</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nueva Imagen
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Caption</th>
                                <th>Orden</th>
                                <th>Visible</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gallery.map((g) => (
                                <tr key={g.id}>
                                    <td>
                                        {g.image_url ? (
                                            <img src={`/${g.image_url}`} className="thumb-sm" alt="Preview" />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>{g.emoji || '📷'}</span>
                                        )}
                                    </td>
                                    <td><strong>{g.caption}</strong></td>
                                    <td>{g.sort_order}</td>
                                    <td>{g.visible ? '✅' : '❌'}</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(g)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {auth.user.role === 'admin' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteGalleryItem(g.id)}>
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

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Imagen' : 'Nueva Imagen'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label>Caption *</label>
                        <input 
                            value={data.caption} 
                            onChange={e => setData('caption', e.target.value)} 
                            required 
                            minLength="2"
                        />
                        {errors.caption && <div className="error-msg" style={{display:'block'}}>{errors.caption}</div>}
                    </div>
                    
                    <ImageUpload 
                        label="Imagen (recomendado 16:10)" 
                        value={data.image_url} 
                        onChange={val => setData('image_url', val)} 
                    />
                    
                    <EmojiPicker 
                        label="Emoji (si no hay imagen)" 
                        value={data.emoji} 
                        onChange={val => setData('emoji', val)} 
                    />
                    
                    <GradientPicker 
                        label="Color de fondo" 
                        value={data.gradient} 
                        onChange={val => setData('gradient', val)} 
                    />
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Orden</label>
                            <input 
                                type="number" 
                                value={data.sort_order} 
                                onChange={e => setData('sort_order', e.target.value)} 
                            />
                            {errors.sort_order && <div className="error-msg" style={{display:'block'}}>{errors.sort_order}</div>}
                        </div>
                        <div className="form-group">
                            <label>Visible</label>
                            <select value={data.visible} onChange={e => setData('visible', e.target.value)}>
                                <option value="1">Sí</option>
                                <option value="0">No</option>
                            </select>
                            {errors.visible && <div className="error-msg" style={{display:'block'}}>{errors.visible}</div>}
                        </div>
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
