import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, AlertTriangle, TrendingDown, TrendingUp, BarChart3, Download, Archive, DollarSign } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const InventoryReport = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/items');
            setItems(data);
        } catch (error) { addNotification('Error loading inventory', 'error'); }
        finally { setLoading(false); }
    };

    const categories = useMemo(() => ['All', ...new Set(items.map(i => i.category))], [items]);

    const filteredItems = useMemo(() => {
        return items.filter(i => {
            const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || (i.barcode && i.barcode.includes(searchTerm));
            const matchCat = categoryFilter === 'All' || i.category === categoryFilter;
            let matchStock = true;
            if (stockFilter === 'Low') matchStock = i.stock > 0 && i.stock < 10;
            if (stockFilter === 'Out') matchStock = i.stock === 0;
            if (stockFilter === 'Healthy') matchStock = i.stock >= 10;
            return matchSearch && matchCat && matchStock;
        });
    }, [items, searchTerm, categoryFilter, stockFilter]);

    const stats = useMemo(() => ({
        totalItems: items.length,
        totalStock: items.reduce((a, i) => a + i.stock, 0),
        totalValue: items.reduce((a, i) => a + (i.stock * i.price), 0),
        totalCost: items.reduce((a, i) => a + (i.stock * (i.buyPrice || 0)), 0),
        lowStock: items.filter(i => i.stock > 0 && i.stock < 10).length,
        outOfStock: items.filter(i => i.stock === 0).length,
    }), [items]);

    const handleExport = () => {
        const csv = ['Name,Barcode,Category,Stock,Unit,Buy Price,Sell Price,Stock Value',
            ...filteredItems.map(i => `"${i.name}","${i.barcode || ''}","${i.category}",${i.stock},"${i.unit}",${i.buyPrice || 0},${i.price},${i.stock * i.price}`)
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'inventory_report.csv'; a.click();
        URL.revokeObjectURL(url);
        addNotification('Report exported successfully!');
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <BarChart3 className="text-primary-500" />
                        Inventory Report
                    </h1>
                    <p className="text-secondary-500">Stock levels, valuation, and alerts</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input type="text" placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                        <option value="All">All Stock</option>
                        <option value="Healthy">Healthy (≥10)</option>
                        <option value="Low">Low Stock</option>
                        <option value="Out">Out of Stock</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm">
                        <Download size={16} /><span>Export</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Products</p>
                    <p className="text-2xl font-black text-secondary-900">{stats.totalItems}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Stock</p>
                    <p className="text-2xl font-black text-secondary-900">{stats.totalStock.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Stock Value</p>
                    <p className="text-2xl font-black text-primary-600">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Cost Value</p>
                    <p className="text-2xl font-black text-emerald-600">₹{stats.totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Low Stock</p>
                    <p className="text-2xl font-black text-amber-600">{stats.lowStock}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Out of Stock</p>
                    <p className="text-2xl font-black text-red-600">{stats.outOfStock}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Barcode</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Buy Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Sell Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="8" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan="8" className="p-16 text-center"><Archive size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No items found</p></td></tr>
                            ) : filteredItems.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-secondary-900">{item.name}</td>
                                    <td className="px-6 py-4 text-xs text-secondary-400 font-mono">{item.barcode || '—'}</td>
                                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{item.category}</span></td>
                                    <td className="px-6 py-4 font-black text-secondary-900">{item.stock} {item.unit}</td>
                                    <td className="px-6 py-4 text-sm text-secondary-500">₹{(item.buyPrice || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-secondary-900 font-semibold">₹{item.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-black text-primary-600">₹{(item.stock * item.price).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {item.stock === 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600"><TrendingDown size={10} />Out</span>
                                        ) : item.stock < 10 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600"><AlertTriangle size={10} />Low</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600"><TrendingUp size={10} />OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default InventoryReport;
