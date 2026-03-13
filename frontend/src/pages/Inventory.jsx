import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    AlertCircle,
    Download,
    Upload,
    X,
    Check,
    Calendar,
    Tag,
    Hash,
    Package,
    TrendingUp,
    ChevronDown,
    Layers,
    Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';
import * as XLSX from 'xlsx';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        brand: '',
        hsnCode: '',
        category: '',
        price: '',
        buyPrice: '',
        stock: '',
        minStockLevel: 10,
        unit: 'pcs',
        expiryDate: ''
    });

    const { isAdmin } = useAuth();
    const { addNotification } = useNotification();

    useEffect(() => {
        fetchItems();
    }, [categoryFilter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/items?category=${categoryFilter}`);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const dataToExport = items.map(item => ({
            Name: item.name,
            Barcode: item.barcode || 'N/A',
            Category: item.category,
            BuyingPrice: item.buyPrice || 0,
            SellingPrice: item.price,
            Stock: item.stock,
            Unit: item.unit
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, "Stockify_Inventory.xlsx");
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            await api.post('/items/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addNotification('Bulk upload successful!', 'success');
            fetchItems();
        } catch (error) {
            addNotification('Upload failed: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                barcode: item.barcode || '',
                brand: item.brand || '',
                hsnCode: item.hsnCode || '',
                category: item.category,
                price: item.price,
                buyPrice: item.buyPrice || '',
                stock: item.stock,
                minStockLevel: item.minStockLevel || 10,
                unit: item.unit || 'pcs',
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                barcode: '',
                brand: '',
                hsnCode: '',
                category: '',
                price: '',
                buyPrice: '',
                stock: '',
                minStockLevel: 10,
                unit: 'pcs',
                expiryDate: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/items/${editingItem._id}`, formData);
            } else {
                await api.post('/items', formData);
            }
            setShowModal(false);
            fetchItems();
            addNotification(editingItem ? 'Asset record updated!' : 'New asset registered successfully!', 'success');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Transaction failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('IRREVERSIBLE ACTION: Are you sure you want to delete this asset?')) {
            try {
                await api.delete(`/items/${id}`);
                fetchItems();
                addNotification('Asset removed from ledger', 'error');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Request rejected', 'error');
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
    );

    const categoriesList = ['All', 'Grocery', 'Beverages', 'Snacks', 'Dairy', 'Personal Care'];

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                     <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>Live Inventory</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Activity size={12} />
                            {items.length} Registered Assets
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Global Ledger</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Managing cross-channel <span className="text-slate-900 font-bold">In-Stock</span> resources.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                     <Button 
                        variant="outline" 
                        icon={Download}
                        onClick={handleExport}
                    >
                        Export Assets
                    </Button>
                    {isAdmin() && (
                        <>
                             <label className="cursor-pointer group">
                                <div className="inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 rounded-2xl px-6 py-3 text-sm bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5">
                                    <Upload size={18} />
                                    <span>Bulk Import</span>
                                </div>
                                <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                            </label>
                            <Button 
                                variant="primary" 
                                icon={Plus}
                                onClick={() => handleOpenModal()}
                            >
                                Register New Asset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="mb-12">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 pb-8 mb-8">
                     <div className="flex flex-1 gap-4 w-full md:w-auto">
                        <Input 
                            placeholder="Identify by Name, SKU or Barcode..."
                            icon={Search}
                            containerClassName="flex-1 max-w-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="relative group">
                            <select
                                className="pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer min-w-[180px]"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categoriesList.map(cat => <option key={cat} value={cat}>{cat} Lifecycle</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Badge variant="secondary" dot>Filter Active</Badge>
                         <Button variant="ghost" size="xs" icon={X} onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>Reset</Button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto -mx-6 md:-mx-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Detail</th>
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Valuation</th>
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">On-Hand</th>
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health</th>
                                <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Ledger Assets...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 italic font-black text-2xl text-slate-200">?</div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Assets identified in current scope</p>
                                    </td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                <Package size={20} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-black text-slate-900 leading-none">{item.name}</span>
                                                    {item.brand && <Badge variant="dark" size="sm" className="opacity-50">{item.brand}</Badge>}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <Hash size={10} /> {item.barcode || 'NO-SKU'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="secondary">{item.category}</Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 tracking-tight">₹{item.price.toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">Sale Conversion</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${item.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'} opacity-20`}></div>
                                            <div>
                                                <p className={`font-black tracking-tight ${item.stock < 10 ? 'text-rose-500' : 'text-slate-900'}`}>
                                                    {item.stock} <span className="text-[10px] text-slate-400">{item.unit}</span>
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Current Inventory</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {item.stock < 10 ? (
                                            <Badge variant="danger" dot>CRITICAL DEPLETION</Badge>
                                        ) : (
                                            <Badge variant="primary" dot>OPTIMAL RESERVE</Badge>
                                        )}
                                        {item.expiryDate && (
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(item.expiryDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            {isAdmin() && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-10 w-10 p-0 text-emerald-600"
                                                        onClick={() => handleOpenModal(item)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-10 w-10 p-0 text-rose-500"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                     <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)}></div>
                     <Card className="relative w-full max-w-3xl bg-white shadow-2xl border-transparent animate-in zoom-in slide-in-from-bottom-20 duration-500" padding="p-0">
                         <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                             <div>
                                 <Badge variant="primary" className="mb-2">Ledger Registry</Badge>
                                 <CardTitle>{editingItem ? 'Modify Asset Record' : 'Register New Enterprise Asset'}</CardTitle>
                             </div>
                             <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={() => setShowModal(false)}>
                                 <X size={20} />
                             </Button>
                         </div>

                         <form onSubmit={handleSubmit} className="p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                 <div className="md:col-span-2 lg:col-span-3">
                                     <Input 
                                        label="Asset Legal Name"
                                        placeholder="Enter the official product name..."
                                        icon={Package}
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                     />
                                 </div>
                                 <Input 
                                    label="Identification SKU"
                                    placeholder="Scan or enter barcode..."
                                    icon={Hash}
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                 />
                                 <Input 
                                    label="Partner Brand"
                                    placeholder="Manufacturing label..."
                                    icon={Tag}
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                 />
                                 <Input 
                                    label="HSN Compliance"
                                    placeholder="Taxation code..."
                                    icon={Layers}
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                 />
                                 
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Lifecycle Category</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Filter size={18} />
                                        </div>
                                        <select
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Select Lifecycle</option>
                                            {categoriesList.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                 <Input 
                                    label="Acquisition Cost (₹)"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    icon={TrendingUp}
                                    value={formData.buyPrice}
                                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                                 />
                                 <Input 
                                    label="Channel Price (₹)"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    icon={Activity}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                 />
                                 <Input 
                                    label="Initial Stock Reserve"
                                    type="number"
                                    required
                                    placeholder="0"
                                    icon={Plus}
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                 />
                                 <Input 
                                    label="Safety Reserve Threshold"
                                    type="number"
                                    required
                                    placeholder="10"
                                    icon={AlertCircle}
                                    value={formData.minStockLevel}
                                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                                 />
                                 <Input 
                                    label="Inventory Unit"
                                    placeholder="pcs, kg, m, etc."
                                    icon={Package}
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                 />
                                 <Input 
                                    label="Expiry Lifecycle"
                                    type="date"
                                    icon={Calendar}
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                 />
                             </div>

                             <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                                 <Button variant="ghost" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                                 <Button variant="secondary" className="px-12" type="submit">
                                     {editingItem ? 'Authorize Mutation' : 'Confirm Registration'}
                                 </Button>
                             </div>
                         </form>
                     </Card>
                </div>
            )}
        </Layout>
    );
};

export default Inventory;
