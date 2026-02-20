import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Truck, X, Eye, Trash2, Send, CheckCircle2, Clock, XCircle, Package, Printer } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusCfg = {
    Draft: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    Dispatched: { color: 'bg-blue-100 text-blue-600', icon: Truck },
    Delivered: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const DeliveryChallan = () => {
    const [challans, setChallans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(null);
    const [customer, setCustomer] = useState('');
    const [cart, setCart] = useState([]);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [transportMode, setTransportMode] = useState('Road');
    const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [transporterName, setTransporterName] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dRes, cRes, iRes] = await Promise.all([api.get('/delivery-challans'), api.get('/contacts?type=Customer'), api.get('/items')]);
            setChallans(dRes.data); setCustomers(cRes.data); setItems(iRes.data);
        } catch (e) { addNotification('Error loading data', 'error'); }
        finally { setLoading(false); }
    };

    const filtered = useMemo(() => challans.filter(c => {
        const m = c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) || c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const s = statusFilter === 'All' || c.status === statusFilter;
        return m && s;
    }), [challans, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: challans.length,
        dispatched: challans.filter(c => c.status === 'Dispatched').length,
        delivered: challans.filter(c => c.status === 'Delivered').length,
        pending: challans.filter(c => c.status === 'Draft').length,
    }), [challans]);

    const addToCart = (p) => {
        if (cart.find(c => c.item === p._id)) return;
        setCart([...cart, { item: p._id, itemName: p.name, quantity: 1, unit: p.unit || 'pcs' }]);
    };

    const handleSubmit = async () => {
        if (!customer) return addNotification('Select customer', 'error');
        if (cart.length === 0) return addNotification('Add items', 'error');
        try {
            await api.post('/delivery-challans', {
                customer,
                items: cart,
                vehicleNumber,
                driverName,
                transportMode,
                transporterName,
                trackingId,
                dispatchDate,
                notes
            });
            addNotification('Delivery Challan created!'); setShowModal(false); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleStatus = async (id, status) => {
        try { await api.patch(`/delivery-challans/${id}/status`, { status }); addNotification(`Status: ${status}`); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try { await api.delete(`/delivery-challans/${id}`); addNotification('Deleted'); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleViewDetails = async (id) => {
        try { const { data } = await api.get(`/delivery-challans/${id}`); setShowView(data); }
        catch (e) { addNotification('Error', 'error'); }
    };

    const filteredItems = useMemo(() => {
        if (!itemSearch) return items.slice(0, 15);
        return items.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
    }, [items, itemSearch]);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><Truck className="text-primary-500" />Delivery Challan</h1>
                    <p className="text-secondary-500">Track goods dispatched to customers</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search challans..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option><option value="Draft">Draft</option><option value="Dispatched">Dispatched</option><option value="Delivered">Delivered</option>
                    </select>
                    <button onClick={() => { setCart([]); setCustomer(''); setVehicleNumber(''); setDriverName(''); setTransportMode('Road'); setDispatchDate(new Date().toISOString().split('T')[0]); setNotes(''); setItemSearch(''); setShowModal(true); }} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Plus size={18} /><span>New Challan</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Challans</p><p className="text-2xl font-black text-secondary-900">{stats.total}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p><p className="text-2xl font-black text-slate-600">{stats.pending}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Dispatched</p><p className="text-2xl font-black text-blue-600">{stats.dispatched}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Delivered</p><p className="text-2xl font-black text-emerald-600">{stats.delivered}</p></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Challan #</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Dispatch</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="7" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className="p-16 text-center"><Truck size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No challans found</p></td></tr>
                                    : filtered.map(dc => {
                                        const S = statusCfg[dc.status] || statusCfg.Draft;
                                        return (<tr key={dc._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-secondary-900">{dc.challanNumber}</td>
                                            <td className="px-6 py-4 font-semibold text-sm">{dc.customer?.name}</td>
                                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{dc.items.length}</span></td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{dc.vehicleNumber || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{new Date(dc.dispatchDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${S.color}`}><S.icon size={12} />{dc.status}</span></td>
                                            <td className="px-6 py-4"><div className="flex items-center justify-end gap-1">
                                                <button onClick={() => addNotification('Transport label generated!', 'success')} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="Print Transport Label"><Printer size={16} /></button>
                                                <button onClick={() => handleViewDetails(dc._id)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"><Eye size={16} /></button>
                                                {dc.status === 'Draft' && <><button onClick={() => handleStatus(dc._id, 'Dispatched')} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Dispatch"><Send size={16} /></button><button onClick={() => handleDelete(dc._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button></>}
                                                {dc.status === 'Dispatched' && <button onClick={() => handleStatus(dc._id, 'Delivered')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Delivered"><CheckCircle2 size={16} /></button>}
                                            </div></td>
                                        </tr>);
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
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0"><h3 className="text-xl font-black text-secondary-900">New Delivery Challan</h3><button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Customer *</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={customer} onChange={(e) => setCustomer(e.target.value)}><option value="">Select...</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Dispatch Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Vehicle Number</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" placeholder="KA-01-AB-1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Driver Name</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={driverName} onChange={(e) => setDriverName(e.target.value)} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Transporter</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={transporterName} onChange={(e) => setTransporterName(e.target.value)} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Transport Mode</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={transportMode} onChange={(e) => setTransportMode(e.target.value)}><option>Road</option><option>Rail</option><option>Air</option><option>Courier</option></select></div>
                                <div className="md:col-span-4"><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Tracking ID / LR Number</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} /></div>
                            </div>
                            <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Add Items</label><input type="text" placeholder="Search products..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-2" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">{filteredItems.map(p => <button key={p._id} onClick={() => addToCart(p)} className="text-xs bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-lg px-3 py-1.5 font-semibold transition-all">{p.name}</button>)}</div></div>
                            {cart.length > 0 && <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th><th className="w-10"></th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{cart.map(c => <tr key={c.item}><td className="px-4 py-3 font-semibold text-sm">{c.itemName}</td><td className="px-3 py-3 text-center"><input type="number" min="1" className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold outline-none" value={c.quantity} onChange={(e) => setCart(cart.map(x => x.item === c.item ? { ...x, quantity: parseInt(e.target.value) || 1 } : x))} /></td><td className="pr-3"><button onClick={() => setCart(cart.filter(x => x.item !== c.item))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
                            <textarea rows={2} placeholder="Notes (optional)..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0"><button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button><button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20 flex items-center gap-2"><Truck size={16} />Create Challan</button></div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowView(null)}></div>
                    <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
                            <div><div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-black text-secondary-900">{showView.challanNumber}</h3><span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusCfg[showView.status]?.color}`}>{showView.status}</span></div><p className="text-xs text-secondary-400">{showView.customer?.name} • {new Date(showView.dispatchDate).toLocaleDateString()}</p></div>
                            <button onClick={() => setShowView(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Vehicle</p><p className="font-bold text-sm">{showView.vehicleNumber || '—'}</p></div>
                                <div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Driver</p><p className="font-bold text-sm">{showView.driverName || '—'}</p></div>
                                <div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Transport</p><p className="font-bold text-sm">{showView.transportMode}</p></div>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">#</th><th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{showView.items.map((i, idx) => <tr key={idx}><td className="px-4 py-3 text-xs text-secondary-400">{idx + 1}</td><td className="px-4 py-3 font-semibold text-sm">{i.itemName}</td><td className="px-3 py-3 text-center font-bold text-sm">{i.quantity} {i.unit}</td></tr>)}</tbody></table></div>
                            {showView.notes && <div className="mt-4"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-secondary-600 bg-slate-50 rounded-xl p-3">{showView.notes}</p></div>}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DeliveryChallan;
