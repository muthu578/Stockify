import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Factory, Trash2, Edit, CheckCircle2, Clock, PlayCircle, XCircle, Eye } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusCfg = {
    Planned: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    'In Progress': { color: 'bg-blue-100 text-blue-600', icon: PlayCircle },
    Completed: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const ProductionDetails = () => {
    const [productions, setProductions] = useState([]);
    const [machines, setMachines] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(null);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ machine: '', item: '', itemName: '', plannedQty: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
    const [editForm, setEditForm] = useState({ producedQty: 0, rejectedQty: 0, endDate: '', status: '', notes: '' });
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, mRes, iRes] = await Promise.all([api.get('/productions'), api.get('/machines'), api.get('/items')]);
            setProductions(pRes.data); setMachines(mRes.data.filter(m => m.status === 'Active')); setItems(iRes.data);
        } catch (e) { addNotification('Error loading data', 'error'); }
        finally { setLoading(false); }
    };

    const filtered = useMemo(() => productions.filter(p => {
        const match = p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) || p.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const stat = statusFilter === 'All' || p.status === statusFilter;
        return match && stat;
    }), [productions, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: productions.length,
        inProg: productions.filter(p => p.status === 'In Progress').length,
        completed: productions.filter(p => p.status === 'Completed').length,
        totalProduced: productions.reduce((a, p) => a + p.producedQty, 0),
    }), [productions]);

    const openCreate = () => { setForm({ machine: '', item: '', itemName: '', plannedQty: '', startDate: new Date().toISOString().split('T')[0], notes: '' }); setEditId(null); setShowModal(true); };

    const openEdit = (p) => {
        setEditForm({ producedQty: p.producedQty, rejectedQty: p.rejectedQty, endDate: p.endDate ? p.endDate.split('T')[0] : '', status: '', notes: p.notes || '' });
        setEditId(p._id); setShowView(p); setShowModal(true);
    };

    const handleCreate = async () => {
        if (!form.machine || !form.item || !form.plannedQty) return addNotification('Fill required fields', 'error');
        try {
            await api.post('/productions', { ...form, plannedQty: parseInt(form.plannedQty) });
            addNotification('Production entry created!'); setShowModal(false); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleUpdate = async () => {
        try {
            const body = { ...editForm, producedQty: parseInt(editForm.producedQty) || 0, rejectedQty: parseInt(editForm.rejectedQty) || 0 };
            if (!body.status) delete body.status;
            if (!body.endDate) delete body.endDate;
            await api.put(`/productions/${editId}`, body);
            addNotification('Updated!'); setShowModal(false); setEditId(null); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try { await api.delete(`/productions/${id}`); addNotification('Deleted'); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const selectItem = (itemId) => {
        const it = items.find(i => i._id === itemId);
        setForm({ ...form, item: itemId, itemName: it?.name || '' });
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><Factory className="text-primary-500" />Production Details</h1>
                    <p className="text-secondary-500">Track production batches and output</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search batch or item..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option><option value="Planned">Planned</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                    </select>
                    <button onClick={openCreate} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Plus size={18} /><span>New Batch</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Batches</p><p className="text-2xl font-black text-secondary-900">{stats.total}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">In Progress</p><p className="text-2xl font-black text-blue-600">{stats.inProg}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Completed</p><p className="text-2xl font-black text-emerald-600">{stats.completed}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Total Produced</p><p className="text-2xl font-black text-primary-600">{stats.totalProduced.toLocaleString()}</p></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Machine</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Planned</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Produced</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Rejected</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Start</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="9" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="9" className="p-16 text-center"><Factory size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No production entries found</p></td></tr>
                                    : filtered.map(p => {
                                        const S = statusCfg[p.status] || statusCfg.Planned;
                                        return (<tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-secondary-900">{p.batchNumber}</td>
                                            <td className="px-6 py-4 font-semibold text-sm">{p.itemName}</td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{p.machine?.name || '—'}</td>
                                            <td className="px-6 py-4 font-bold text-secondary-900">{p.plannedQty}</td>
                                            <td className="px-6 py-4 font-black text-emerald-600">{p.producedQty}</td>
                                            <td className="px-6 py-4 font-bold text-red-500">{p.rejectedQty}</td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{new Date(p.startDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${S.color}`}><S.icon size={12} />{p.status}</span></td>
                                            <td className="px-6 py-4"><div className="flex items-center justify-end gap-1">
                                                {(p.status === 'Planned' || p.status === 'In Progress') && <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"><Edit size={16} /></button>}
                                                {p.status === 'Planned' && <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>}
                                            </div></td>
                                        </tr>);
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditId(null); }}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><h3 className="text-xl font-black text-secondary-900">{editId ? `Update ${showView?.batchNumber}` : 'New Production Batch'}</h3><button onClick={() => { setShowModal(false); setEditId(null); }} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button></div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {!editId ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Machine *</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })}><option value="">Select...</option>{machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.machineCode})</option>)}</select></div>
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Item *</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.item} onChange={(e) => selectItem(e.target.value)}><option value="">Select...</option>{items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Planned Qty *</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.plannedQty} onChange={(e) => setForm({ ...form, plannedQty: e.target.value })} /></div>
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Start Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                                    </div>
                                    <textarea rows={2} placeholder="Notes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Produced Qty</label><input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={editForm.producedQty} onChange={(e) => setEditForm({ ...editForm, producedQty: e.target.value })} /></div>
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Rejected Qty</label><input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={editForm.rejectedQty} onChange={(e) => setEditForm({ ...editForm, rejectedQty: e.target.value })} /></div>
                                        <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">End Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} /></div>
                                    </div>
                                    <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Change Status</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                            <option value="">No change</option>
                                            {showView?.status === 'Planned' && <option value="In Progress">In Progress</option>}
                                            {(showView?.status === 'Planned' || showView?.status === 'In Progress') && <><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></>}
                                        </select></div>
                                    <textarea rows={2} placeholder="Notes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                                </>
                            )}
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => { setShowModal(false); setEditId(null); }} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
                            <button onClick={editId ? handleUpdate : handleCreate} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20">{editId ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProductionDetails;
