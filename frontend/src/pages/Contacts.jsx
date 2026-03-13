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
    X,
    ExternalLink,
    Copy,
    Check,
    Briefcase,
    ShieldCheck,
    ArrowUpRight,
    SearchX,
    MoreHorizontal
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

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
        gstin: '',
        type: type
    });
    const { addNotification } = useNotification();

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
            addNotification(`${type} record synchronized successfully`, 'success');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Transaction failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`IRREVERSIBLE ACTION: Purge this ${type.toLowerCase()} record from history?`)) {
            try {
                await api.delete(`/contacts/${id}`);
                fetchContacts();
                addNotification('Entity removed from core directory', 'success');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Request rejected', 'error');
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
                gstin: contact.gstin || '',
                type: type
            });
        } else {
            setEditingContact(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                gstin: '',
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>{type} Directory</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Users size={12} />
                            {contacts.length} Entities Registered
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Global Network</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Managing high-value <span className="text-slate-900 font-bold">{type}</span> relationships.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Input 
                            placeholder={`Locate ${type.toLowerCase()}...`}
                            icon={Search}
                            containerClassName="min-w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="primary" 
                        icon={UserPlus}
                        onClick={() => handleOpenModal()}
                    >
                        Onboard {type}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[280px] bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
                    ))
                ) : filteredContacts.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchX className="text-slate-200" size={32} />
                         </div>
                         <h3 className="text-xl font-black text-slate-900">No Entities Identified</h3>
                         <p className="text-slate-500 mt-2">Try adjusting your search parameters.</p>
                    </div>
                ) : filteredContacts.map(contact => (
                    <Card key={contact._id} className="group relative overflow-hidden" padding="p-0">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-900/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    {contact.name.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    {type === 'Customer' && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-10 w-10 p-0 text-slate-400 hover:text-emerald-500"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://stockify-erp.com/portal/${contact._id}`);
                                                addNotification('Customer portal link synthesized', 'success');
                                            }}
                                        >
                                            <ExternalLink size={18} />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-10 w-10 p-0 text-slate-400 hover:text-slate-900"
                                        onClick={() => handleOpenModal(contact)}
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-10 w-10 p-0 text-slate-400 hover:text-rose-500"
                                        onClick={() => handleDelete(contact._id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{contact.name}</h3>
                                {contact.gstin && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliant: {contact.gstin}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-slate-500 font-bold text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 shrink-0">
                                        <Phone size={14} className="text-slate-400" />
                                    </div>
                                    {contact.phone}
                                </div>
                                {contact.email && (
                                    <div className="flex items-center text-slate-500 font-bold text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 shrink-0">
                                            <Mail size={14} className="text-slate-400" />
                                        </div>
                                        <span className="truncate">{contact.email}</span>
                                    </div>
                                )}
                                {contact.address && (
                                    <div className="flex items-center text-slate-500 font-bold text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 shrink-0">
                                            <MapPin size={14} className="text-slate-400" />
                                        </div>
                                        <span className="truncate">{contact.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center group-hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Ledger</span>
                                <span className={`text-lg font-black tracking-tight ${contact.balance > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                    ₹{contact.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <Button variant="ghost" size="xs" icon={ArrowUpRight} className="text-[10px] font-black uppercase tracking-widest">Ledger</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)}></div>
                    <Card className="relative w-full max-w-xl bg-white shadow-2xl border-transparent animate-in zoom-in slide-in-from-bottom-20 duration-500" padding="p-0">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <Badge variant="primary" className="mb-2">{type} Ledger</Badge>
                                <CardTitle>{editingContact ? `Modify ${type} Profile` : `Register New ${type} Entity`}</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6 mb-10">
                                <Input 
                                    label="Entity Legal Name"
                                    placeholder="Enter full legal name..."
                                    icon={Users}
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Primary Contact Line"
                                        placeholder="+91 00000 00000"
                                        icon={Phone}
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <Input 
                                        label="GSTIN Certification"
                                        placeholder="Enter GST number..."
                                        icon={ShieldCheck}
                                        value={formData.gstin}
                                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    />
                                </div>
                                <Input 
                                    label="Official Correspondence Email"
                                    type="email"
                                    placeholder="email@company.com"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <MapPin size={12} /> Physical Headquarters
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Enter complete office/home address..."
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none shadow-sm"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                                <Button variant="ghost" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                                <Button variant="secondary" className="px-12" type="submit">
                                    {editingContact ? 'Authorize Mutation' : 'Confirm Registration'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </Layout>
    );
};

export default Contacts;
