import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    FileText,
    Send,
    X,
    Trash2,
    Eye,
    Edit2,
    Package,
    ChevronDown,
    Calendar,
    IndianRupee,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    Minus,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusConfig = {
    Draft: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    Sent: { color: 'bg-blue-100 text-blue-600', icon: Send },
    Partial: { color: 'bg-amber-100 text-amber-600', icon: Truck },
    Completed: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    Cancelled: { color: 'bg-red-100 text-red-600', icon: XCircle },
};

const POGeneration = () => {
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingPO, setEditingPO] = useState(null);

    // View detail state
    const [viewPO, setViewPO] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [cart, setCart] = useState([]);
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');
    const [expectedDelivery, setExpectedDelivery] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [poRes, itemRes, supRes] = await Promise.all([
                api.get('/purchase-orders'),
                api.get('/items'),
                api.get('/contacts?type=Supplier'),
            ]);
            setOrders(poRes.data);
            setItems(itemRes.data);
            setSuppliers(supRes.data);
        } catch (error) {
            console.error(error);
            addNotification('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchSearch = o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'All' || o.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    // Filtered items for product picker
    const filteredItems = useMemo(() => {
        if (!itemSearch) return items;
        return items.filter(i =>
            i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
            (i.barcode && i.barcode.includes(itemSearch))
        );
    }, [items, itemSearch]);

    // Cart helpers
    const addToCart = (product) => {
        const existing = cart.find(c => c.item === product._id);
        if (existing) {
            setCart(cart.map(c => c.item === product._id
                ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice }
                : c
            ));
        } else {
            setCart([...cart, {
                item: product._id,
                itemName: product.name,
                unitPrice: product.buyPrice || 0,
                quantity: 1,
                unit: product.unit || 'pcs',
                subtotal: product.buyPrice || 0,
            }]);
        }
    };

    const updateCartQty = (id, qty) => {
        if (qty < 1) return;
        setCart(cart.map(c => c.item === id
            ? { ...c, quantity: qty, subtotal: qty * c.unitPrice }
            : c
        ));
    };

    const updateCartPrice = (id, price) => {
        setCart(cart.map(c => c.item === id
            ? { ...c, unitPrice: price, subtotal: c.quantity * price }
            : c
        ));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(c => c.item !== id));
    };

    const totalAmount = cart.reduce((acc, c) => acc + c.subtotal, 0);
    const taxAmount = (totalAmount * taxRate) / 100;
    const grandTotal = totalAmount + taxAmount;

    // Open modal for create/edit
    const handleOpenModal = (po = null) => {
        if (po) {
            setEditingPO(po);
            setSelectedSupplier(po.supplier?._id || '');
            setCart(po.items.map(i => ({
                item: i.item?._id || i.item,
                itemName: i.itemName,
                unitPrice: i.unitPrice,
                quantity: i.quantity,
                unit: i.unit || 'pcs',
                subtotal: i.subtotal,
            })));
            setTaxRate(po.taxRate || 0);
            setNotes(po.notes || '');
            setExpectedDelivery(po.expectedDelivery ? new Date(po.expectedDelivery).toISOString().split('T')[0] : '');
        } else {
            setEditingPO(null);
            setSelectedSupplier('');
            setCart([]);
            setTaxRate(0);
            setNotes('');
            setExpectedDelivery('');
        }
        setItemSearch('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPO(null);
    };

    // Submit PO
    const handleSubmit = async () => {
        if (!selectedSupplier) {
            addNotification('Please select a supplier', 'error');
            return;
        }
        if (cart.length === 0) {
            addNotification('Add at least one item to the PO', 'error');
            return;
        }

        try {
            const payload = {
                supplier: selectedSupplier,
                items: cart,
                taxRate,
                notes,
                expectedDelivery: expectedDelivery || undefined,
            };

            if (editingPO) {
                await api.put(`/purchase-orders/${editingPO._id}`, payload);
                addNotification('Purchase order updated successfully!');
            } else {
                await api.post('/purchase-orders', payload);
                addNotification('Purchase order created successfully!');
            }

            handleCloseModal();
            fetchData();
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error saving purchase order', 'error');
        }
    };

    // Status actions
    const handleStatusChange = async (poId, newStatus) => {
        try {
            await api.patch(`/purchase-orders/${poId}/status`, { status: newStatus });
            addNotification(`PO status updated to ${newStatus}`);
            fetchData();
            if (showViewModal) {
                const { data } = await api.get(`/purchase-orders/${poId}`);
                setViewPO(data);
            }
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error updating status', 'error');
        }
    };

    // Delete PO
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this draft PO?')) return;
        try {
            await api.delete(`/purchase-orders/${id}`);
            addNotification('Purchase order deleted');
            fetchData();
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error deleting PO', 'error');
        }
    };

    // View PO detail
    const handleView = async (id) => {
        try {
            const { data } = await api.get(`/purchase-orders/${id}`);
            setViewPO(data);
            setShowViewModal(true);
        } catch (error) {
            addNotification('Error loading PO details', 'error');
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: orders.length,
        draft: orders.filter(o => o.status === 'Draft').length,
        sent: orders.filter(o => o.status === 'Sent').length,
        completed: orders.filter(o => o.status === 'Completed').length,
        totalValue: orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.grandTotal, 0),
    }), [orders]);

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <ClipboardList className="text-primary-500" />
                        PO Generation
                    </h1>
                    <p className="text-secondary-500">Create and manage purchase orders for suppliers</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by PO number or supplier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Partial">Partial</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"
                    >
                        <Plus size={18} />
                        <span>Create PO</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total POs</p>
                    <p className="text-2xl font-black text-secondary-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Drafts</p>
                    <p className="text-2xl font-black text-slate-600">{stats.draft}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Sent</p>
                    <p className="text-2xl font-black text-blue-600">{stats.sent}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Total Value</p>
                    <p className="text-2xl font-black text-primary-600">₹{stats.totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* PO Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Grand Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Expected</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center animate-pulse text-secondary-400">Loading purchase orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center">
                                        <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                                        <p className="font-bold text-secondary-400">No purchase orders found</p>
                                        <p className="text-xs text-secondary-300 mt-1">Create your first PO to get started</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.map(po => {
                                const StatusIcon = statusConfig[po.status]?.icon || Clock;
                                return (
                                    <tr key={po._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-secondary-900">{po.poNumber}</p>
                                            <p className="text-[10px] text-secondary-400">{new Date(po.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-700">{po.supplier?.name}</p>
                                            <p className="text-[10px] text-secondary-400">{po.supplier?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {po.items.length} item{po.items.length !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-secondary-900">₹{po.grandTotal.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-secondary-500">
                                            {po.expectedDelivery
                                                ? new Date(po.expectedDelivery).toLocaleDateString()
                                                : <span className="text-secondary-300">—</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[po.status]?.color}`}>
                                                <StatusIcon size={12} />
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(po._id)}
                                                    className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {po.status === 'Draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenModal(po)}
                                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(po._id, 'Sent')}
                                                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Send to Supplier"
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(po._id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {po.status === 'Sent' && (
                                                    <button
                                                        onClick={() => handleStatusChange(po._id, 'Completed')}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                {(po.status === 'Draft' || po.status === 'Sent') && (
                                                    <button
                                                        onClick={() => handleStatusChange(po._id, 'Cancelled')}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Cancel"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-secondary-900">
                                    {editingPO ? `Edit ${editingPO.poNumber}` : 'Create Purchase Order'}
                                </h3>
                                <p className="text-xs text-secondary-400 mt-0.5">
                                    {editingPO ? 'Modify the draft PO details below' : 'Fill in the details to generate a new PO'}
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Left: Item picker */}
                            <div className="w-full lg:w-[280px] flex flex-col border-r border-slate-100 bg-white">
                                <div className="p-4 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                                            value={itemSearch}
                                            onChange={(e) => setItemSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                                    {filteredItems.map(product => (
                                        <button
                                            key={product._id}
                                            onClick={() => addToCart(product)}
                                            className="w-full text-left p-3 rounded-xl border border-transparent hover:border-primary-200 hover:bg-primary-50/30 transition-all flex justify-between items-center group"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm text-slate-700 group-hover:text-primary-700 truncate">{product.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-secondary-400">₹{product.buyPrice || 0}</span>
                                                    <span className="text-[10px] text-secondary-300">•</span>
                                                    <span className="text-[10px] text-secondary-400">Stock: {product.stock}</span>
                                                </div>
                                            </div>
                                            <Plus size={14} className="text-slate-300 group-hover:text-primary-500 shrink-0 ml-2" />
                                        </button>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <div className="text-center py-8 text-secondary-300 text-xs">
                                            No products found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: PO Details */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
                                {/* Supplier & meta fields */}
                                <div className="p-5 border-b border-slate-100 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Supplier *</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={selectedSupplier}
                                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                            >
                                                <option value="">Select supplier...</option>
                                                {suppliers.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Expected Delivery</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={expectedDelivery}
                                                onChange={(e) => setExpectedDelivery(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cart Table */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    {cart.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <Package size={48} className="text-slate-200 mb-3" />
                                            <p className="font-bold text-secondary-400">No items added yet</p>
                                            <p className="text-xs text-secondary-300 mt-1">Click products from the left panel to add them</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-slate-50/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Unit Price</th>
                                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th>
                                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Unit</th>
                                                        <th className="px-4 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th>
                                                        <th className="w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {cart.map(c => (
                                                        <tr key={c.item} className="group">
                                                            <td className="px-4 py-3 font-semibold text-sm">{c.itemName}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                                    value={c.unitPrice}
                                                                    onChange={(e) => updateCartPrice(c.item, parseFloat(e.target.value) || 0)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        onClick={() => updateCartQty(c.item, c.quantity - 1)}
                                                                        className="p-1 rounded hover:bg-slate-100 text-secondary-400"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        className="w-14 px-1 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-black outline-none focus:ring-2 focus:ring-primary-500/20"
                                                                        value={c.quantity}
                                                                        onChange={(e) => updateCartQty(c.item, parseInt(e.target.value) || 1)}
                                                                    />
                                                                    <button
                                                                        onClick={() => updateCartQty(c.item, c.quantity + 1)}
                                                                        className="p-1 rounded hover:bg-slate-100 text-secondary-400"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-xs text-secondary-400 font-medium">{c.unit}</td>
                                                            <td className="px-4 py-3 text-right font-black text-sm">₹{c.subtotal.toFixed(2)}</td>
                                                            <td className="pr-3">
                                                                <button
                                                                    onClick={() => removeFromCart(c.item)}
                                                                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="px-5 pb-3">
                                    <textarea
                                        rows={2}
                                        placeholder="Internal notes (optional)..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                {/* Footer Totals & Submit */}
                                <div className="p-5 bg-white border-t border-slate-100">
                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</p>
                                                <p className="text-lg font-black text-secondary-900">₹{totalAmount.toFixed(2)}</p>
                                            </div>
                                            {taxRate > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Tax ({taxRate}%)</p>
                                                    <p className="text-lg font-black text-secondary-500">₹{taxAmount.toFixed(2)}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Grand Total</p>
                                                <p className="text-2xl font-black text-primary-600">₹{grandTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCloseModal}
                                                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2"
                                            >
                                                <FileText size={16} />
                                                {editingPO ? 'Update PO' : 'Create PO'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAIL MODAL */}
            {showViewModal && viewPO && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        {/* View Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-black text-secondary-900">{viewPO.poNumber}</h3>
                                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${statusConfig[viewPO.status]?.color}`}>
                                        {viewPO.status}
                                    </span>
                                </div>
                                <p className="text-xs text-secondary-400">
                                    Created on {new Date(viewPO.createdAt).toLocaleDateString()} by {viewPO.createdBy?.name || 'System'}
                                </p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Supplier & Meta */}
                            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6 border-b border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Supplier</p>
                                    <p className="font-bold text-secondary-900">{viewPO.supplier?.name}</p>
                                    <p className="text-xs text-secondary-400">{viewPO.supplier?.phone}</p>
                                    {viewPO.supplier?.email && <p className="text-xs text-secondary-400">{viewPO.supplier?.email}</p>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                                    <p className="font-bold text-secondary-900">
                                        {viewPO.expectedDelivery
                                            ? new Date(viewPO.expectedDelivery).toLocaleDateString()
                                            : 'Not specified'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Tax Rate</p>
                                    <p className="font-bold text-secondary-900">{viewPO.taxRate}%</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="p-6">
                                <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-3">Order Items</h4>
                                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">#</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Price</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {viewPO.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-xs text-secondary-400">{idx + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-sm text-secondary-900">{item.itemName}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-sm">{item.quantity} {item.unit}</td>
                                                    <td className="px-4 py-3 text-center text-sm">₹{item.unitPrice.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-black text-sm">₹{item.subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            {viewPO.notes && (
                                <div className="px-6 pb-4">
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-sm text-secondary-600 bg-slate-50 rounded-xl p-3">{viewPO.notes}</p>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="px-6 pb-6">
                                <div className="bg-primary-50/50 rounded-2xl p-5 flex flex-wrap items-end justify-between gap-4">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</p>
                                            <p className="text-lg font-black text-secondary-900">₹{viewPO.totalAmount.toFixed(2)}</p>
                                        </div>
                                        {viewPO.taxRate > 0 && (
                                            <div>
                                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Tax ({viewPO.taxRate}%)</p>
                                                <p className="text-lg font-black text-secondary-500">₹{viewPO.taxAmount.toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Grand Total</p>
                                            <p className="text-2xl font-black text-primary-600">₹{viewPO.grandTotal.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Quick actions in view */}
                                    <div className="flex gap-2">
                                        {viewPO.status === 'Draft' && (
                                            <>
                                                <button
                                                    onClick={() => { setShowViewModal(false); handleOpenModal(viewPO); }}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(viewPO._id, 'Sent')}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                                                >
                                                    <Send size={14} /> Send to Supplier
                                                </button>
                                            </>
                                        )}
                                        {viewPO.status === 'Sent' && (
                                            <button
                                                onClick={() => handleStatusChange(viewPO._id, 'Completed')}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default POGeneration;
