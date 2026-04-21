import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import EmojiPicker from '@/Components/EmojiPicker';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function NewsIndex({ news }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
        tag_emoji: '📢',
        tag_text: 'Noticia',
        published_date: '',
        visible: 1
    });

    const openModal = (n = null) => {
        clearErrors();
        if (n) {
            setEditingId(n.id);
            const tagEmojiMatch = (n.tag || '📢').match(/^./u);
            const tagEmoji = tagEmojiMatch ? tagEmojiMatch[0] : '📢';
            const tagText = (n.tag || 'Noticia').replace(/^.\s*/, '');
            
            setData({
                title: n.title || '',
                content: n.content || '',
                tag_emoji: tagEmoji,
                tag_text: tagText,
                published_date: n.published_date || '',
                visible: n.visible !== 0 ? 1 : 0
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
        
        // El backend espera el campo "tag" completo
        const combinedData = {
            ...data,
            tag: `${data.tag_emoji} ${data.tag_text}`.trim()
        };

        if (editingId) {
            router.put(route('admin.news.update', editingId), combinedData, {
                onSuccess: () => closeModal(),
            });
        } else {
            router.post(route('admin.news.store'), combinedData, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteNews = (id) => {
        if (confirm('¿Eliminar esta noticia?')) {
            router.delete(route('admin.news.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Noticias" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Noticias</h2>
                        <p>Publicaciones y anuncios</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nueva Noticia
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Tag</th>
                                <th>Fecha</th>
                                <th>Visible</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map((n) => (
                                <tr key={n.id}>
                                    <td><strong>{n.title}</strong></td>
                                    <td>{n.tag}</td>
                                    <td>{new Date(n.published_date + 'T00:00:00').toLocaleDateString('es-SV')}</td>
                                    <td>{n.visible ? '✅' : '❌'}</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(n)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteNews(n.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Noticia' : 'Nueva Noticia'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label>Título *</label>
                        <input 
                            value={data.title} 
                            onChange={e => setData('title', e.target.value)} 
                            required 
                            minLength="3"
                        />
                        {errors.title && <div className="error-msg" style={{display:'block'}}>{errors.title}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label>Contenido</label>
                        <textarea 
                            rows="4" 
                            value={data.content} 
                            onChange={e => setData('content', e.target.value)}
                            placeholder="Redacta la noticia..."
                        />
                        {errors.content && <div className="error-msg" style={{display:'block'}}>{errors.content}</div>}
                    </div>
                    
                    <div className="form-row">
                        <EmojiPicker 
                            label="Emoji del Tag" 
                            value={data.tag_emoji} 
                            onChange={val => setData('tag_emoji', val)} 
                        />
                        <div className="form-group">
                            <label>Tag texto</label>
                            <input 
                                value={data.tag_text} 
                                onChange={e => setData('tag_text', e.target.value)} 
                                placeholder="Logro, Alianza..." 
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha *</label>
                            <input 
                                type="date" 
                                value={data.published_date} 
                                onChange={e => setData('published_date', e.target.value)} 
                                required 
                            />
                            {errors.published_date && <div className="error-msg" style={{display:'block'}}>{errors.published_date}</div>}
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
