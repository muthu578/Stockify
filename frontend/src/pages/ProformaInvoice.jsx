import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, FileText, X, Eye, Trash2, Send, CheckCircle2, Clock, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusCfg = {
    Draft: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    Sent: { color: 'bg-blue-100 text-blue-600', icon: Send },
    Accepted: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Expired: { color: 'bg-amber-100 text-amber-600', icon: AlertCircle },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const ProformaInvoice = () => {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(null);
    const [customer, setCustomer] = useState('');
    const [cart, setCart] = useState([]);
    const [taxRate, setTaxRate] = useState(0);
    const [validUntil, setValidUntil] = useState('');
    const [notes, setNotes] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [iRes, cRes, pRes] = await Promise.all([api.get('/proforma-invoices'), api.get('/contacts?type=Customer'), api.get('/items')]);
            setInvoices(iRes.data); setCustomers(cRes.data); setItems(pRes.data);
        } catch (e) { addNotification('Error loading data', 'error'); }
        finally { setLoading(false); }
    };

    const filtered = useMemo(() => invoices.filter(i => {
        const m = i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || i.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const s = statusFilter === 'All' || i.status === statusFilter;
        return m && s;
    }), [invoices, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: invoices.length,
        accepted: invoices.filter(i => i.status === 'Accepted').length,
        totalValue: invoices.reduce((a, i) => a + i.grandTotal, 0),
        pending: invoices.filter(i => i.status === 'Draft' || i.status === 'Sent').length,
    }), [invoices]);

    const addToCart = (p) => {
        if (cart.find(c => c.item === p._id)) return;
        setCart([...cart, { item: p._id, itemName: p.name, quantity: 1, unitPrice: p.price, subtotal: p.price }]);
    };
    const updateCart = (id, field, val) => {
        setCart(cart.map(c => {
            if (c.item !== id) return c;
            const u = { ...c, [field]: val };
            u.subtotal = u.quantity * u.unitPrice;
            return u;
        }));
    };

    const totalAmt = cart.reduce((a, c) => a + c.subtotal, 0);
    const taxAmt = (totalAmt * taxRate) / 100;
    const grandTotal = totalAmt + taxAmt;

    const handleSubmit = async () => {
        if (!customer) return addNotification('Select customer', 'error');
        if (cart.length === 0) return addNotification('Add items', 'error');
        try {
            await api.post('/proforma-invoices', { customer, items: cart, taxRate, validUntil: validUntil || undefined, notes });
            addNotification('Proforma Invoice created!'); setShowModal(false); fetchData();
        } catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleStatus = async (id, status) => {
        try { await api.patch(`/proforma-invoices/${id}/status`, { status }); addNotification(`Status: ${status}`); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try { await api.delete(`/proforma-invoices/${id}`); addNotification('Deleted'); fetchData(); }
        catch (e) { addNotification(e.response?.data?.message || 'Error', 'error'); }
    };

    const handleViewDetails = async (id) => {
        try { const { data } = await api.get(`/proforma-invoices/${id}`); setShowView(data); }
        catch (e) { addNotification('Error loading details', 'error'); }
    };

    const filteredItems = useMemo(() => {
        if (!itemSearch) return items.slice(0, 15);
        return items.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
    }, [items, itemSearch]);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><FileText className="text-primary-500" />Proforma Invoice</h1>
                    <p className="text-secondary-500">Create quotations and estimates</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search invoices..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option><option value="Draft">Draft</option><option value="Sent">Sent</option><option value="Accepted">Accepted</option><option value="Expired">Expired</option>
                    </select>
                    <button onClick={() => { setCart([]); setCustomer(''); setTaxRate(0); setValidUntil(''); setNotes(''); setItemSearch(''); setShowModal(true); }} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Plus size={18} /><span>New Invoice</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Invoices</p><p className="text-2xl font-black text-secondary-900">{stats.total}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Accepted</p><p className="text-2xl font-black text-emerald-600">{stats.accepted}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Pending</p><p className="text-2xl font-black text-blue-600">{stats.pending}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Total Value</p><p className="text-2xl font-black text-primary-600">₹{stats.totalValue.toLocaleString()}</p></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Grand Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="7" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className="p-16 text-center"><FileText size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No invoices found</p></td></tr>
                                    : filtered.map(inv => {
                                        const S = statusCfg[inv.status] || statusCfg.Draft;
                                        return (<tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-secondary-900">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-4 font-semibold text-sm">{inv.customer?.name}</td>
                                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{inv.items.length}</span></td>
                                            <td className="px-6 py-4 font-black text-primary-600">₹{inv.grandTotal.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-secondary-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${S.color}`}><S.icon size={12} />{inv.status}</span></td>
                                            <td className="px-6 py-4"><div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleViewDetails(inv._id)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"><Eye size={16} /></button>
                                                {inv.status === 'Draft' && <><button onClick={() => handleStatus(inv._id, 'Sent')} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Send"><Send size={16} /></button><button onClick={() => handleDelete(inv._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button></>}
                                                {inv.status === 'Sent' && <button onClick={() => handleStatus(inv._id, 'Accepted')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Accept"><CheckCircle2 size={16} /></button>}
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
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0"><h3 className="text-xl font-black text-secondary-900">New Proforma Invoice</h3><button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Customer *</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={customer} onChange={(e) => setCustomer(e.target.value)}><option value="">Select...</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Tax Rate (%)</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} /></div>
                                <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Valid Until</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
                            </div>
                            <div><label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Add Items</label><input type="text" placeholder="Search products..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-2" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">{filteredItems.map(p => <button key={p._id} onClick={() => addToCart(p)} className="text-xs bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-lg px-3 py-1.5 font-semibold transition-all">{p.name} <span className="text-secondary-400">₹{p.price}</span></button>)}</div></div>
                            {cart.length > 0 && <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Price</th><th className="px-3 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th><th className="w-10"></th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{cart.map(c => <tr key={c.item}><td className="px-4 py-3 font-semibold text-sm">{c.itemName}</td><td className="px-3 py-3 text-center"><input type="number" min="1" className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold outline-none" value={c.quantity} onChange={(e) => updateCart(c.item, 'quantity', parseInt(e.target.value) || 1)} /></td><td className="px-3 py-3 text-center"><input type="number" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold outline-none" value={c.unitPrice} onChange={(e) => updateCart(c.item, 'unitPrice', parseFloat(e.target.value) || 0)} /></td><td className="px-3 py-3 text-right font-black text-sm">₹{c.subtotal.toFixed(2)}</td><td className="pr-3"><button onClick={() => setCart(cart.filter(x => x.item !== c.item))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
                            <textarea rows={2} placeholder="Notes (optional)..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100 flex items-end justify-between shrink-0">
                            <div className="flex gap-6">
                                <div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</p><p className="text-lg font-black text-secondary-900">₹{totalAmt.toFixed(2)}</p></div>
                                <div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Tax ({taxRate}%)</p><p className="text-lg font-black text-secondary-500">₹{taxAmt.toFixed(2)}</p></div>
                                <div><p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Grand Total</p><p className="text-2xl font-black text-primary-600">₹{grandTotal.toFixed(2)}</p></div>
                            </div>
                            <div className="flex gap-3"><button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button><button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20">Create Invoice</button></div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowView(null)}></div>
                    <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
                            <div><div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-black text-secondary-900">{showView.invoiceNumber}</h3><span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusCfg[showView.status]?.color}`}>{showView.status}</span></div><p className="text-xs text-secondary-400">{showView.customer?.name} • {new Date(showView.createdAt).toLocaleDateString()}</p></div>
                            <button onClick={() => setShowView(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden mb-4"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th><th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Price</th><th className="px-3 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th></tr></thead><tbody className="divide-y divide-slate-100">{showView.items.map((i, idx) => <tr key={idx}><td className="px-4 py-3 font-semibold text-sm">{i.itemName}</td><td className="px-3 py-3 text-center font-bold text-sm">{i.quantity}</td><td className="px-3 py-3 text-center text-sm">₹{i.unitPrice.toFixed(2)}</td><td className="px-3 py-3 text-right font-black text-sm">₹{i.subtotal.toFixed(2)}</td></tr>)}</tbody></table></div>
                            <div className="bg-primary-50/50 rounded-2xl p-5 flex flex-wrap gap-8"><div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</p><p className="text-lg font-black text-secondary-900">₹{showView.totalAmount.toLocaleString()}</p></div><div><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Tax ({showView.taxRate}%)</p><p className="text-lg font-black text-secondary-500">₹{showView.taxAmount.toFixed(2)}</p></div><div><p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Grand Total</p><p className="text-2xl font-black text-primary-600">₹{showView.grandTotal.toLocaleString()}</p></div></div>
                            {showView.notes && <div className="mt-4"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-secondary-600 bg-slate-50 rounded-xl p-3">{showView.notes}</p></div>}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProformaInvoice;
