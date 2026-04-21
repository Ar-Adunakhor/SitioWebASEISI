import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import EmojiPicker from '@/Components/EmojiPicker';
import ImageUpload from '@/Components/ImageUpload';
import GradientPicker from '@/Components/GradientPicker';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function EventsIndex({ events }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        emoji: '📅',
        description: '',
        event_date: '',
        location: '',
        capacity: 0,
        duration: '',
        status: 'upcoming',
        visible: 1,
        gradient: '',
        image_url: '',
        sort_order: 0
    });

    const openModal = (event = null) => {
        clearErrors();
        if (event) {
            setEditingId(event.id);
            setData({
                title: event.title || '',
                emoji: event.emoji || '📅',
                description: event.description || '',
                event_date: event.event_date || '',
                location: event.location || '',
                capacity: event.capacity || 0,
                duration: event.duration || '',
                status: event.status || 'upcoming',
                visible: event.visible !== 0 ? 1 : 0,
                gradient: event.gradient || '',
                image_url: event.image_url || '',
                sort_order: event.sort_order || 0
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
            put(route('admin.events.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.events.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteEvent = (id) => {
        if (confirm('¿Eliminar este evento?')) {
            router.delete(route('admin.events.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Eventos" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Eventos</h2>
                        <p>Gestiona los eventos</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nuevo Evento
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Evento</th>
                                <th>Fecha</th>
                                <th>Lugar</th>
                                <th>Estado</th>
                                <th>Visible</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.emoji || '📅'} <strong>{e.title}</strong></td>
                                    <td>{new Date(e.event_date + 'T00:00:00').toLocaleDateString('es-SV')}</td>
                                    <td>{e.location}</td>
                                    <td><span className={`badge badge-${e.status || 'upcoming'}`}>{e.status}</span></td>
                                    <td>{e.visible ? '✅' : '❌'}</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(e)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Evento' : 'Nuevo Evento'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Título *</label>
                            <input 
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)} 
                                required 
                            />
                            {errors.title && <div className="error-msg" style={{display:'block'}}>{errors.title}</div>}
                        </div>
                        <EmojiPicker 
                            label="Emoji" 
                            value={data.emoji} 
                            onChange={val => setData('emoji', val)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea 
                            rows="3" 
                            value={data.description} 
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Describe el evento..."
                        />
                        {errors.description && <div className="error-msg" style={{display:'block'}}>{errors.description}</div>}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha *</label>
                            <input 
                                type="date" 
                                value={data.event_date} 
                                onChange={e => setData('event_date', e.target.value)} 
                                required 
                            />
                            {errors.event_date && <div className="error-msg" style={{display:'block'}}>{errors.event_date}</div>}
                        </div>
                        <div className="form-group">
                            <label>Ubicación</label>
                            <input 
                                value={data.location} 
                                onChange={e => setData('location', e.target.value)} 
                                placeholder="Auditorio FIA..." 
                            />
                            {errors.location && <div className="error-msg" style={{display:'block'}}>{errors.location}</div>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Capacidad</label>
                            <input 
                                type="number" 
                                value={data.capacity} 
                                onChange={e => setData('capacity', e.target.value)} 
                                min="0" 
                            />
                            {errors.capacity && <div className="error-msg" style={{display:'block'}}>{errors.capacity}</div>}
                        </div>
                        <div className="form-group">
                            <label>Duración</label>
                            <input 
                                value={data.duration} 
                                onChange={e => setData('duration', e.target.value)} 
                                placeholder="2 horas" 
                            />
                            {errors.duration && <div className="error-msg" style={{display:'block'}}>{errors.duration}</div>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}>
                                <option value="upcoming">Próximamente</option>
                                <option value="open">Inscripciones Abiertas</option>
                                <option value="soon">Próxima Semana</option>
                            </select>
                            {errors.status && <div className="error-msg" style={{display:'block'}}>{errors.status}</div>}
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
                    
                    <GradientPicker 
                        label="Color del banner" 
                        value={data.gradient} 
                        onChange={val => setData('gradient', val)} 
                    />
                    
                    <ImageUpload 
                        label="Imagen del evento (opcional)" 
                        value={data.image_url} 
                        onChange={val => setData('image_url', val)} 
                    />
                    
                    <div className="form-group">
                        <label>Orden</label>
                        <input 
                            type="number" 
                            value={data.sort_order} 
                            onChange={e => setData('sort_order', e.target.value)} 
                        />
                        {errors.sort_order && <div className="error-msg" style={{display:'block'}}>{errors.sort_order}</div>}
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
