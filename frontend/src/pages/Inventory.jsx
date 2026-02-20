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
    Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
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
        category: '',
        price: '',
        buyPrice: '',
        stock: '',
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
            addNotification('Bulk upload successful!');
            fetchItems();
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
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
                category: item.category,
                price: item.price,
                buyPrice: item.buyPrice || '',
                stock: item.stock,
                unit: item.unit || 'pcs',
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                barcode: '',
                category: '',
                price: '',
                buyPrice: '',
                stock: '',
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
            addNotification(editingItem ? 'Item updated successfully!' : 'New item added and stock updated!');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error saving item', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${id}`);
                fetchItems();
                addNotification('Item deleted successfully!', 'error');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Error deleting item', 'error');
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm))
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900">Inventory</h1>
                    <p className="text-secondary-500">Manage your product stock and details</p>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or barcode..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center">
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Personal Care">Personal Care</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm shrink-0"
                    >
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    {isAdmin() && (
                        <>
                            <label className="flex items-center space-x-2 px-4 py-2.5 bg-secondary-950 text-white rounded-xl hover:bg-secondary-800 transition-all font-medium cursor-pointer text-sm shrink-0">
                                <Upload size={16} />
                                <span>Bulk Upload</span>
                                <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                            </label>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 text-sm shrink-0"
                            >
                                <Plus size={18} />
                                <span>Add Item</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-secondary-400 animate-pulse">Fetching inventory items...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-secondary-400">No items found matching your search.</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-secondary-900">{item.name}</span>
                                                <span className="text-xs text-secondary-400 font-mono">{item.barcode || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-secondary-900">₹{item.price.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-semibold ${item.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {item.stock} {item.unit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.stock < 10 ? (
                                                <div className="flex items-center text-amber-600 text-xs font-bold">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    LOW STOCK
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-emerald-600 text-xs font-bold">
                                                    <Check size={14} className="mr-1" />
                                                    IN STOCK
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isAdmin() && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2 hover:bg-slate-100 text-secondary-400 rounded-lg transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-secondary-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-secondary-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Barcode</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Grocery">Grocery</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Personal Care">Personal Care</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Buy Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.buyPrice}
                                        onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sale Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all"
                                >
                                    {editingItem ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Inventory;
