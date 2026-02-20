import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Settings2, Trash2, Edit, CheckCircle2, AlertTriangle, Pause, XCircle, Wrench, Activity, Thermometer, Droplets, Gauge } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusCfg = {
    Active: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Maintenance: { color: 'bg-amber-100 text-amber-600', icon: Wrench },
    Idle: { color: 'bg-slate-100 text-slate-600', icon: Pause },
    Decommissioned: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const MachineMaster = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', type: '', manufacturer: '', capacity: '', location: '', installDate: '', notes: '' });
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try { setLoading(true); const { data } = await api.get('/machines'); setMachines(data); }
        catch (e) { addNotification('Error loading machines', 'error'); }
        finally { setLoading(false); }
    };

    const filtered = useMemo(() => machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) || m.type.toLowerCase().includes(searchTerm.toLowerCase())
    ), [machines, searchTerm]);

    const iotSimulation = useMemo(() => {
        return machines.reduce((acc, m) => {
            acc[m._id] = {
                temp: Math.floor(Math.random() * 20) + 40,
                load: Math.floor(Math.random() * 40) + 50,
                humidity: Math.floor(Math.random() * 15) + 30
            };
            return acc;
        }, {});
    }, [machines]);

    const openCreate = () => { setForm({ name: '', type: '', manufacturer: '', capacity: '', location: '', installDate: '', notes: '' }); setEditId(null); setShowModal(true); };
    const openEdit = (m) => { setForm({ name: m.name, type: m.type, manufacturer: m.manufacturer || '', capacity: m.capacity || '', location: m.location || '', installDate: m.installDate ? m.installDate.split('T')[0] : '', notes: m.notes || '', status: m.status }); setEditId(m._id); setShowModal(true); };

    const handleSubmit = async () => {
        if (!form.name || !form.type) return addNotification('Name and type required', 'error');
        try {
            if (editId) { await api.put(`/machines/${editId}`, form); addNotification('Machine updated!'); }
            else { await api.post('/machines', form); addNotification('Machine created!'); }
            setShowModal(false); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this machine?')) return;
        try { await api.delete(`/machines/${id}`); addNotification('Deleted'); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><Settings2 className="text-primary-500" />Machine Master</h1>
                    <p className="text-secondary-500">Manage production equipment</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search machines..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <button onClick={openCreate} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Plus size={18} /><span>Add Machine</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total</p><p className="text-2xl font-black text-secondary-900">{machines.length}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Active</p><p className="text-2xl font-black text-emerald-600">{machines.filter(m => m.status === 'Active').length}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Maintenance</p><p className="text-2xl font-black text-amber-600">{machines.filter(m => m.status === 'Maintenance').length}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Idle</p><p className="text-2xl font-black text-slate-600">{machines.filter(m => m.status === 'Idle').length}</p></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Manufacturer</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-center">IoT Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="7" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className="p-16 text-center"><Settings2 size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No machines found</p></td></tr>
                                    : filtered.map(m => {
                                        const S = statusCfg[m.status] || statusCfg.Active;
                                        return (<tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-secondary-400">{m.machineCode}</td>
                                            <td className="px-6 py-4 font-bold text-secondary-900">{m.name}</td>
                                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{m.type}</span></td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{m.manufacturer || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{m.location || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-400">
                                                        <Thermometer size={10} className="text-rose-500" />
                                                        {iotSimulation[m._id]?.temp}°C
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-400">
                                                        <Gauge size={10} className="text-secondary-500" />
                                                        {iotSimulation[m._id]?.load}%
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-400">
                                                        <Droplets size={10} className="text-blue-500" />
                                                        {iotSimulation[m._id]?.humidity}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${S.color}`}><S.icon size={12} />{m.status}</span></td>
                                            <td className="px-6 py-4"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(m)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"><Edit size={16} /></button><button onClick={() => handleDelete(m._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button></div></td>
                                        </tr>);
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><h3 className="text-xl font-black text-secondary-900">{editId ? 'Edit Machine' : 'Add Machine'}</h3><button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button></div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Name *</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Type *</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" placeholder="CNC, Lathe, Press..." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Manufacturer</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Capacity</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" placeholder="e.g. 100 units/hr" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Location</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Install Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.installDate} onChange={(e) => setForm({ ...form, installDate: e.target.value })} /></div>
                            </div>
                            {editId && (
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Status</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="Active">Active</option><option value="Maintenance">Maintenance</option><option value="Idle">Idle</option><option value="Decommissioned">Decommissioned</option></select>
                                </div>
                            )}
                            <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Notes</label><textarea rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20">{editId ? 'Update' : 'Create'} Machine</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MachineMaster;
