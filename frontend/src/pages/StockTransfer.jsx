import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ArrowRightLeft, X, Eye, Trash2, CheckCircle2, Clock, Truck, XCircle, Package, Send } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusCfg = {
    Pending: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    'In Transit': { color: 'bg-blue-100 text-blue-600', icon: Truck },
    Completed: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const StockTransfer = () => {
    const [transfers, setTransfers] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(null);
    const [fromLoc, setFromLoc] = useState('');
    const [toLoc, setToLoc] = useState('');
    const [cart, setCart] = useState([]);
    const [reason, setReason] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tRes, iRes, lRes] = await Promise.all([api.get('/stock-transfers'), api.get('/items'), api.get('/masters/locations')]);
            setTransfers(tRes.data); setItems(iRes.data); setLocations(lRes.data);
        } catch (e) { addNotification('Error loading data', 'error'); }
        finally { setLoading(false); }
    };

    const filteredTransfers = useMemo(() => transfers.filter(t =>
        t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
    ), [transfers, searchTerm]);

    const filteredItems = useMemo(() => {
        if (!itemSearch) return items.filter(i => i.stock > 0);
        return items.filter(i => i.stock > 0 && (i.name.toLowerCase().includes(itemSearch.toLowerCase()) || (i.barcode && i.barcode.includes(itemSearch))));
    }, [items, itemSearch]);

    const addToCart = (product) => {
        if (cart.find(c => c.item === product._id)) return;
        setCart([...cart, { item: product._id, itemName: product.name, quantity: 1, unit: product.unit || 'pcs', maxStock: product.stock }]);
    };

    const updateQty = (id, qty) => {
        const c = cart.find(c => c.item === id);
        if (qty < 1 || qty > (c?.maxStock || 999)) return;
        setCart(cart.map(c => c.item === id ? { ...c, quantity: qty } : c));
    };

    const handleSubmit = async () => {
        if (!fromLoc || !toLoc) return addNotification('Select both locations', 'error');
        if (fromLoc === toLoc) return addNotification('Locations must be different', 'error');
        if (cart.length === 0) return addNotification('Add items to transfer', 'error');
        try {
            await api.post('/stock-transfers', { fromLocation: fromLoc, toLocation: toLoc, items: cart, reason });
            addNotification('Transfer created!'); setShowModal(false); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.patch(`/stock-transfers/${id}/status`, { status });
            addNotification(`Status updated to ${status}`); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transfer?')) return;
        try { await api.delete(`/stock-transfers/${id}`); addNotification('Deleted'); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><ArrowRightLeft className="text-primary-500" />Stock Transfer</h1>
                    <p className="text-secondary-500">Transfer stock between storage locations</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input type="text" placeholder="Search transfers..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => { setCart([]); setFromLoc(''); setToLoc(''); setReason(''); setItemSearch(''); setShowModal(true); }} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Plus size={18} /><span>New Transfer</span></button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Transfer #</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">From → To</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="6" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filteredTransfers.length === 0 ? <tr><td colSpan="6" className="p-16 text-center"><ArrowRightLeft size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No transfers found</p></td></tr>
                                    : filteredTransfers.map(t => {
                                        const S = statusCfg[t.status] || statusCfg.Pending;
                                        return (
                                            <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4"><p className="font-bold text-secondary-900">{t.transferNumber}</p></td>
                                                <td className="px-6 py-4"><span className="text-sm font-semibold">{t.fromLocation} <span className="text-primary-500 mx-1">→</span> {t.toLocation}</span></td>
                                                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{t.items.length}</span></td>
                                                <td className="px-6 py-4 text-sm text-secondary-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${S.color}`}><S.icon size={12} />{t.status}</span></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setShowView(t)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"><Eye size={16} /></button>
                                                        {t.status === 'Pending' && <>
                                                            <button onClick={() => handleStatus(t._id, 'In Transit')} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Mark In Transit"><Send size={16} /></button>
                                                            <button onClick={() => handleDelete(t._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                        </>}
                                                        {t.status === 'In Transit' && <button onClick={() => handleStatus(t._id, 'Completed')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Complete"><CheckCircle2 size={16} /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div><h3 className="text-xl font-black text-secondary-900">New Stock Transfer</h3><p className="text-xs text-secondary-400">Move stock between locations</p></div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">From Location *</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={fromLoc} onChange={(e) => setFromLoc(e.target.value)}>
                                        <option value="">Select...</option>
                                        {locations.map(l => <option key={l._id} value={l.name}>{l.name} ({l.code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">To Location *</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={toLoc} onChange={(e) => setToLoc(e.target.value)}>
                                        <option value="">Select...</option>
                                        {locations.map(l => <option key={l._id} value={l.name}>{l.name} ({l.code})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Add Items</label>
                                <input type="text" placeholder="Search products..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-2" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {filteredItems.slice(0, 20).map(p => (
                                        <button key={p._id} onClick={() => addToCart(p)} className="text-xs bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-lg px-3 py-1.5 font-semibold transition-all">
                                            {p.name} <span className="text-secondary-400">(Stock: {p.stock})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-slate-100">
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Available</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Transfer Qty</th>
                                            <th className="w-10"></th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {cart.map(c => (
                                                <tr key={c.item}>
                                                    <td className="px-4 py-3 font-semibold text-sm">{c.itemName}</td>
                                                    <td className="px-4 py-3 text-center text-sm text-secondary-400">{c.maxStock} {c.unit}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input type="number" min="1" max={c.maxStock} className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold outline-none" value={c.quantity} onChange={(e) => updateQty(c.item, parseInt(e.target.value) || 1)} />
                                                    </td>
                                                    <td className="pr-3"><button onClick={() => setCart(cart.filter(x => x.item !== c.item))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <textarea rows={2} placeholder="Reason for transfer (optional)..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={reason} onChange={(e) => setReason(e.target.value)} />
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20 flex items-center gap-2"><ArrowRightLeft size={16} />Create Transfer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowView(null)}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-black text-secondary-900">{showView.transferNumber}</h3><span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusCfg[showView.status]?.color}`}>{showView.status}</span></div>
                                <p className="text-xs text-secondary-400">{showView.fromLocation} → {showView.toLocation} • {new Date(showView.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setShowView(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                <table className="w-full">
                                    <thead><tr className="border-b border-slate-100">
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">#</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {showView.items.map((i, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 text-xs text-secondary-400">{idx + 1}</td>
                                                <td className="px-4 py-3 font-semibold text-sm">{i.itemName}</td>
                                                <td className="px-4 py-3 text-center font-bold text-sm">{i.quantity} {i.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {showView.reason && <div className="mt-4"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Reason</p><p className="text-sm text-secondary-600 bg-slate-50 rounded-xl p-3">{showView.reason}</p></div>}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default StockTransfer;
