import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    X
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const Contacts = ({ type }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: type
    });

    useEffect(() => {
        fetchContacts();
        setFormData(prev => ({ ...prev, type: type }));
    }, [type]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/contacts?type=${type}`);
            setContacts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContact) {
                await api.put(`/contacts/${editingContact._id}`, formData);
            } else {
                await api.post('/contacts', formData);
            }
            setShowModal(false);
            fetchContacts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving contact');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
            try {
                await api.delete(`/contacts/${id}`);
                fetchContacts();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting contact');
            }
        }
    };

    const handleOpenModal = (contact = null) => {
        if (contact) {
            setEditingContact(contact);
            setFormData({
                name: contact.name,
                email: contact.email || '',
                phone: contact.phone,
                address: contact.address || '',
                type: type
            });
        } else {
            setEditingContact(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                type: type
            });
        }
        setShowModal(true);
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900">{type}s</h1>
                    <p className="text-secondary-500">Manage your {type.toLowerCase()} directory and ledgers</p>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${type.toLowerCase()}s by name or phone...`}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"
                    >
                        <UserPlus size={18} />
                        <span>Add {type}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl"></div>)
                ) : filteredContacts.map(contact => (
                    <div key={contact._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                                {contact.name.charAt(0)}
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(contact)} className="p-2 hover:bg-slate-100 text-secondary-400 hover:text-primary-600 rounded-xl">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(contact._id)} className="p-2 hover:bg-slate-100 text-secondary-400 hover:text-red-600 rounded-xl">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-secondary-900 mb-1">{contact.name}</h3>

                        <div className="space-y-2 mt-4">
                            <div className="flex items-center text-secondary-500 text-sm">
                                <Phone size={14} className="mr-2" />
                                {contact.phone}
                            </div>
                            {contact.email && (
                                <div className="flex items-center text-secondary-500 text-sm">
                                    <Mail size={14} className="mr-2" />
                                    {contact.email}
                                </div>
                            )}
                            {contact.address && (
                                <div className="flex items-center text-secondary-500 text-sm">
                                    <MapPin size={14} className="mr-2" />
                                    {contact.address}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Balance</span>
                            <span className={`font-black ${contact.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                ₹{contact.balance.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-secondary-900 mb-6">{editingContact ? `Edit ${type}` : `Add New ${type}`}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Address</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                ></textarea>
                            </div>

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
                                    {editingContact ? 'Update' : 'Save'} {type}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Contacts;
