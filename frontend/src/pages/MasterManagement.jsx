import React, { useState, useEffect } from 'react';
import {
    Database,
    Plus,
    Edit2,
    Trash2,
    Search,
    MapPin,
    Package,
    X,
    Server,
    Archive
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const MasterManagement = ({ type }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { addNotification } = useNotification();

    // Dynamic config based on type
    const config = type === 'location' ? {
        title: 'Storage Locations',
        endpoint: '/masters/storage-locations',
        icon: MapPin,
        fields: [
            { name: 'name', label: 'Location Name', type: 'text', required: true },
            { name: 'code', label: 'Location Code', type: 'text', required: true },
            { name: 'capacity', label: 'Capacity (Units)', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ]
    } : {
        title: 'Product Categories',
        endpoint: '/masters/categories',
        icon: Package,
        fields: [
            { name: 'name', label: 'Category Name', type: 'text', required: true },
            { name: 'code', label: 'Category Code', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ]
    };

    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchItems();
        // Reset form data structure based on fields
        const initialData = {};
        config.fields.forEach(f => initialData[f.name] = '');
        setFormData(initialData);
    }, [type]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(config.endpoint);
            setItems(data);
        } catch (error) {
            console.error(error);
            addNotification('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`${config.endpoint}/${editingItem._id}`, formData);
                addNotification(`${config.title} updated successfully!`);
            } else {
                await api.post(config.endpoint, formData);
                addNotification(`${config.title} created successfully!`);
            }
            setShowModal(false);
            fetchItems();
            setEditingItem(null);
            // Reset form
            const initialData = {};
            config.fields.forEach(f => initialData[f.name] = '');
            setFormData(initialData);
        } catch (error) {
            addNotification(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`${config.endpoint}/${id}`);
                fetchItems();
                addNotification('Item deleted successfully', 'success');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Delete failed', 'error');
            }
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            const data = {};
            config.fields.forEach(f => data[f.name] = item[f.name] || '');
            setFormData(data);
        } else {
            setEditingItem(null);
            const data = {};
            config.fields.forEach(f => data[f.name] = '');
            setFormData(data);
        }
        setShowModal(true);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <config.icon className="text-primary-500" />
                        {config.title}
                    </h1>
                    <p className="text-secondary-500">Manage your {config.title.toLowerCase()} master data</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20"
                >
                    <Plus size={20} />
                    <span>Add New</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-3xl"></div>)
                ) : filteredItems.map(item => (
                    <div key={item._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleOpenModal(item)} className="p-2 bg-slate-100 hover:bg-white text-secondary-400 hover:text-primary-600 rounded-xl shadow-sm">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 bg-slate-100 hover:bg-white text-secondary-400 hover:text-red-600 rounded-xl shadow-sm">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-3">
                                <config.icon size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900">{item.name}</h3>
                            {item.code && <span className="text-xs font-bold text-secondary-400 bg-slate-100 px-2 py-1 rounded-lg mt-1 inline-block">{item.code}</span>}
                        </div>

                        {item.description && (
                            <p className="text-secondary-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                        )}

                        {item.capacity > 0 && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg">
                                <Archive size={14} />
                                Capacity: {item.capacity}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-secondary-900">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {config.fields.map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                                            rows="3"
                                            value={formData[field.name]}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        ></textarea>
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                            value={formData[field.name]}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-500 shadow-lg shadow-primary-600/20"
                                >
                                    {editingItem ? 'Update' : 'Save'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MasterManagement;
