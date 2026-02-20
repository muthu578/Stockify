import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    FileText,
    X,
    Eye,
    Package,
    Calendar,
    ClipboardCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    Truck,
    ChevronRight,
    ArrowRight,
    Hash,
    PackageCheck,
    PackageX,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const statusConfig = {
    Draft: { color: 'bg-slate-100 text-slate-600', icon: Clock },
    Inspected: { color: 'bg-amber-100 text-amber-600', icon: ClipboardCheck },
    Completed: { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
};

const GRNEntry = () => {
    const [grns, setGRNs] = useState([]);
    const [pendingPOs, setPendingPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [step, setStep] = useState(1); // 1 = select PO, 2 = fill GRN

    // Selected PO for GRN
    const [selectedPO, setSelectedPO] = useState(null);

    // GRN form state
    const [grnItems, setGRNItems] = useState([]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // View modal
    const [viewGRN, setViewGRN] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [grnRes, poRes] = await Promise.all([
                api.get('/grn'),
                api.get('/grn/pending-pos'),
            ]);
            setGRNs(grnRes.data);
            setPendingPOs(poRes.data);
        } catch (error) {
            console.error(error);
            addNotification('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtered GRNs
    const filteredGRNs = useMemo(() => {
        return grns.filter(g => {
            const matchSearch = g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.purchaseOrder?.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'All' || g.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [grns, searchTerm, statusFilter]);

    // Open create modal
    const handleOpenCreate = () => {
        setStep(1);
        setSelectedPO(null);
        setGRNItems([]);
        setInvoiceNumber('');
        setInvoiceDate('');
        setReceivedDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setShowCreateModal(true);
    };

    // Select a PO and proceed to step 2
    const handleSelectPO = (po) => {
        setSelectedPO(po);
        // Pre-fill GRN items from PO items
        setGRNItems(po.items.map(item => ({
            item: item.item?._id || item.item,
            itemName: item.itemName,
            orderedQty: item.quantity,
            previouslyReceived: item.receivedQty || 0,
            remainingQty: item.quantity - (item.receivedQty || 0),
            receivedQty: item.quantity - (item.receivedQty || 0), // default to remaining
            acceptedQty: item.quantity - (item.receivedQty || 0),
            rejectedQty: 0,
            unitPrice: item.unitPrice,
            unit: item.unit || 'pcs',
            subtotal: (item.quantity - (item.receivedQty || 0)) * item.unitPrice,
            remarks: '',
        })));
        setStep(2);
    };

    // Update GRN item fields
    const updateGRNItem = (index, field, value) => {
        setGRNItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            // Auto-calc rejected and subtotal
            if (field === 'receivedQty' || field === 'acceptedQty') {
                const received = field === 'receivedQty' ? value : updated[index].receivedQty;
                const accepted = field === 'acceptedQty' ? value : updated[index].acceptedQty;
                updated[index].rejectedQty = Math.max(0, received - accepted);
                updated[index].subtotal = accepted * updated[index].unitPrice;
            }
            if (field === 'unitPrice') {
                updated[index].subtotal = updated[index].acceptedQty * value;
            }
            return updated;
        });
    };

    const totalAmount = grnItems.reduce((acc, item) => acc + item.subtotal, 0);

    // Submit GRN
    const handleSubmit = async () => {
        if (!selectedPO) return;

        const hasItems = grnItems.some(i => i.receivedQty > 0);
        if (!hasItems) {
            addNotification('At least one item must have received quantity', 'error');
            return;
        }

        try {
            const payload = {
                purchaseOrder: selectedPO._id,
                items: grnItems.filter(i => i.receivedQty > 0),
                invoiceNumber,
                invoiceDate: invoiceDate || undefined,
                receivedDate,
                notes,
            };

            await api.post('/grn', payload);
            addNotification('GRN created successfully! Stock updated.');
            setShowCreateModal(false);
            fetchData();
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error creating GRN', 'error');
        }
    };

    // View GRN detail
    const handleView = async (id) => {
        try {
            const { data } = await api.get(`/grn/${id}`);
            setViewGRN(data);
            setShowViewModal(true);
        } catch (error) {
            addNotification('Error loading GRN details', 'error');
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: grns.length,
        completed: grns.filter(g => g.status === 'Completed').length,
        pendingPOCount: pendingPOs.length,
        totalReceived: grns.reduce((acc, g) => acc + g.totalAmount, 0),
    }), [grns, pendingPOs]);

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <Truck className="text-primary-500" />
                        GRN Entry
                    </h1>
                    <p className="text-secondary-500">Receive goods against purchase orders</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by GRN, PO number or supplier..."
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
                        <option value="Inspected">Inspected</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"
                    >
                        <Plus size={18} />
                        <span>New GRN</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total GRNs</p>
                    <p className="text-2xl font-black text-secondary-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Pending POs</p>
                    <p className="text-2xl font-black text-blue-600">{stats.pendingPOCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Total Received Value</p>
                    <p className="text-2xl font-black text-primary-600">₹{stats.totalReceived.toLocaleString()}</p>
                </div>
            </div>

            {/* GRN Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">GRN Number</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">PO Reference</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Received</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="8" className="p-10 text-center animate-pulse text-secondary-400">Loading GRNs...</td></tr>
                            ) : filteredGRNs.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-16 text-center">
                                        <Truck size={40} className="mx-auto text-slate-200 mb-3" />
                                        <p className="font-bold text-secondary-400">No GRN entries found</p>
                                        <p className="text-xs text-secondary-300 mt-1">Receive goods from a purchase order to create a GRN</p>
                                    </td>
                                </tr>
                            ) : filteredGRNs.map(grn => {
                                const StatusIcon = statusConfig[grn.status]?.icon || Clock;
                                return (
                                    <tr key={grn._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-secondary-900">{grn.grnNumber}</p>
                                            {grn.invoiceNumber && (
                                                <p className="text-[10px] text-secondary-400">Inv: {grn.invoiceNumber}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {grn.purchaseOrder?.poNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-700">{grn.supplier?.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {grn.items.length} item{grn.items.length !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-secondary-900">₹{grn.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-secondary-500">
                                            {new Date(grn.receivedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[grn.status]?.color}`}>
                                                <StatusIcon size={12} />
                                                {grn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleView(grn._id)}
                                                className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE GRN MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-secondary-900">
                                    {step === 1 ? 'Select Purchase Order' : `Receive Against ${selectedPO?.poNumber}`}
                                </h3>
                                <p className="text-xs text-secondary-400 mt-0.5">
                                    {step === 1 ? 'Choose a sent/partial PO to receive goods against' : 'Enter received quantities and inspection details'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Step indicator */}
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 1 ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}>1</span>
                                    <ChevronRight size={12} className="text-secondary-300" />
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 2 ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Step 1: PO Selection */}
                        {step === 1 && (
                            <div className="flex-1 overflow-y-auto p-6">
                                {pendingPOs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <Package size={48} className="text-slate-200 mb-3" />
                                        <p className="font-bold text-secondary-400">No pending purchase orders</p>
                                        <p className="text-xs text-secondary-300 mt-1">Create and send a PO first, then come back to receive goods</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingPOs.map(po => (
                                            <button
                                                key={po._id}
                                                onClick={() => handleSelectPO(po)}
                                                className="w-full text-left p-5 rounded-2xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/20 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                                            <FileText size={20} className="text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-secondary-900 group-hover:text-primary-700">{po.poNumber}</p>
                                                            <p className="text-xs text-secondary-400 mt-0.5">
                                                                {po.supplier?.name} • {po.items.length} items • ₹{po.grandTotal.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${po.status === 'Sent' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {po.status}
                                                        </span>
                                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                    </div>
                                                </div>

                                                {/* Items preview */}
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {po.items.map((item, idx) => {
                                                        const remaining = item.quantity - (item.receivedQty || 0);
                                                        return (
                                                            <span key={idx} className="text-[10px] bg-slate-50 px-2 py-1 rounded-lg text-secondary-500">
                                                                {item.itemName}: {remaining}/{item.quantity} pending
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: GRN Form */}
                        {step === 2 && selectedPO && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Invoice Details */}
                                <div className="p-5 border-b border-slate-100 bg-white shrink-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Invoice Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. INV-12345"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Invoice Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={invoiceDate}
                                                onChange={(e) => setInvoiceDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Received Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                value={receivedDate}
                                                onChange={(e) => setReceivedDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-50/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Ordered</th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Pending</th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                                                        <span className="flex items-center justify-center gap-1"><Truck size={10} /> Received</span>
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                        <span className="flex items-center justify-center gap-1"><PackageCheck size={10} /> Accepted</span>
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                                        <span className="flex items-center justify-center gap-1"><PackageX size={10} /> Rejected</span>
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Price</th>
                                                    <th className="px-3 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {grnItems.map((item, idx) => (
                                                    <tr key={idx} className={item.remainingQty === 0 ? 'opacity-40' : ''}>
                                                        <td className="px-4 py-3">
                                                            <p className="font-semibold text-sm">{item.itemName}</p>
                                                            <p className="text-[10px] text-secondary-400">{item.unit}</p>
                                                        </td>
                                                        <td className="px-3 py-3 text-center text-sm font-bold text-secondary-500">{item.orderedQty}</td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className={`text-sm font-black ${item.remainingQty > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                                {item.remainingQty}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.remainingQty}
                                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                                                value={item.receivedQty}
                                                                onChange={(e) => {
                                                                    const val = Math.min(parseInt(e.target.value) || 0, item.remainingQty);
                                                                    updateGRNItem(idx, 'receivedQty', val);
                                                                    // Auto-set accepted to received by default
                                                                    updateGRNItem(idx, 'acceptedQty', val);
                                                                }}
                                                                disabled={item.remainingQty === 0}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.receivedQty}
                                                                className="w-16 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                                value={item.acceptedQty}
                                                                onChange={(e) => {
                                                                    const val = Math.min(parseInt(e.target.value) || 0, item.receivedQty);
                                                                    updateGRNItem(idx, 'acceptedQty', val);
                                                                }}
                                                                disabled={item.remainingQty === 0}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="text-sm font-bold text-red-500">{item.rejectedQty}</span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center text-sm text-secondary-500">₹{item.unitPrice.toFixed(2)}</td>
                                                        <td className="px-3 py-3 text-right font-black text-sm">₹{item.subtotal.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="px-5 pb-3 shrink-0">
                                    <textarea
                                        rows={2}
                                        placeholder="Receiving notes, inspection remarks (optional)..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Total Accepted</p>
                                                <p className="text-lg font-black text-emerald-600">
                                                    {grnItems.reduce((acc, i) => acc + i.acceptedQty, 0)} units
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Total Rejected</p>
                                                <p className="text-lg font-black text-red-500">
                                                    {grnItems.reduce((acc, i) => acc + i.rejectedQty, 0)} units
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Total Value</p>
                                                <p className="text-2xl font-black text-primary-600">₹{totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                            >
                                                ← Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={16} />
                                                Confirm Receipt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW GRN MODAL */}
            {showViewModal && viewGRN && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-black text-secondary-900">{viewGRN.grnNumber}</h3>
                                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${statusConfig[viewGRN.status]?.color}`}>
                                        {viewGRN.status}
                                    </span>
                                </div>
                                <p className="text-xs text-secondary-400">
                                    Against {viewGRN.purchaseOrder?.poNumber} • Received on {new Date(viewGRN.receivedDate).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Meta info */}
                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Supplier</p>
                                    <p className="font-bold text-secondary-900 text-sm">{viewGRN.supplier?.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Invoice No.</p>
                                    <p className="font-bold text-secondary-900 text-sm">{viewGRN.invoiceNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Invoice Date</p>
                                    <p className="font-bold text-secondary-900 text-sm">
                                        {viewGRN.invoiceDate ? new Date(viewGRN.invoiceDate).toLocaleDateString() : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Created By</p>
                                    <p className="font-bold text-secondary-900 text-sm">{viewGRN.createdBy?.name || 'System'}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-6">
                                <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-3">Received Items</h4>
                                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Item</th>
                                                <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Ordered</th>
                                                <th className="px-3 py-3 text-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Received</th>
                                                <th className="px-3 py-3 text-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Accepted</th>
                                                <th className="px-3 py-3 text-center text-[10px] font-bold text-red-400 uppercase tracking-widest">Rejected</th>
                                                <th className="px-3 py-3 text-right text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {viewGRN.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-sm">{item.itemName}</p>
                                                        <p className="text-[10px] text-secondary-400">₹{item.unitPrice.toFixed(2)} / {item.unit}</p>
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-sm text-secondary-500">{item.orderedQty}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-sm">{item.receivedQty}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-sm text-emerald-600">{item.acceptedQty}</td>
                                                    <td className="px-3 py-3 text-center font-bold text-sm text-red-500">{item.rejectedQty}</td>
                                                    <td className="px-3 py-3 text-right font-black text-sm">₹{item.subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            {viewGRN.notes && (
                                <div className="px-6 pb-4">
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-sm text-secondary-600 bg-slate-50 rounded-xl p-3">{viewGRN.notes}</p>
                                </div>
                            )}

                            {/* Total */}
                            <div className="px-6 pb-6">
                                <div className="bg-primary-50/50 rounded-2xl p-5">
                                    <div className="flex flex-wrap items-end gap-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Accepted</p>
                                            <p className="text-lg font-black text-emerald-600">
                                                {viewGRN.items.reduce((acc, i) => acc + i.acceptedQty, 0)} units
                                            </p>
                                        </div>
                                        {viewGRN.items.reduce((acc, i) => acc + i.rejectedQty, 0) > 0 && (
                                            <div>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Total Rejected</p>
                                                <p className="text-lg font-black text-red-500">
                                                    {viewGRN.items.reduce((acc, i) => acc + i.rejectedQty, 0)} units
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Received Value</p>
                                            <p className="text-2xl font-black text-primary-600">₹{viewGRN.totalAmount.toLocaleString()}</p>
                                        </div>
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

export default GRNEntry;
