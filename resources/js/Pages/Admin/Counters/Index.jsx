import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function CountersIndex({ counters }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        label: '',
        value: 0,
        sort_order: 0
    });

    const openModal = (c = null) => {
        clearErrors();
        if (c) {
            setEditingId(c.id);
            setData({
                label: c.label || '',
                value: c.value || 0,
                sort_order: c.sort_order || 0
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
            put(route('admin.counters.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.counters.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteCounter = (id) => {
        if (confirm('¿Eliminar este contador?')) {
            router.delete(route('admin.counters.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Contadores" />
            
            <div className="tab-content active">
                <div className="page-header">
                    <div>
                        <h2>Contadores</h2>
                        <p>Estadísticas de la página principal</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i> Nuevo Contador
                    </button>
                </div>
                
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Etiqueta</th>
                                <th>Valor</th>
                                <th>Orden</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counters.map((c) => (
                                <tr key={c.id}>
                                    <td><strong>{c.label}</strong></td>
                                    <td>{c.value}</td>
                                    <td>{c.sort_order}</td>
                                    <td className="actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(c)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {auth.user.role === 'admin' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteCounter(c.id)}>
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

            <AdminModal show={showModal} onClose={closeModal} title={editingId ? 'Editar Contador' : 'Nuevo Contador'}>
                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label>Etiqueta *</label>
                        <input 
                            value={data.label} 
                            onChange={e => setData('label', e.target.value)} 
                            required 
                            minLength="2"
                            placeholder="Ej: Miembros Activos"
                        />
                        {errors.label && <div className="error-msg" style={{display:'block'}}>{errors.label}</div>}
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Valor *</label>
                            <input 
                                type="number" 
                                value={data.value} 
                                onChange={e => setData('value', e.target.value)} 
                                required 
                                min="0" 
                            />
                            {errors.value && <div className="error-msg" style={{display:'block'}}>{errors.value}</div>}
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
