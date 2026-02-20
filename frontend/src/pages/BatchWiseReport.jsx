import React, { useState, useEffect, useMemo } from 'react';
import { Search, Layers, Download, Archive, ChevronDown, ChevronRight, Package } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const BatchWiseReport = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try { setLoading(true); const { data } = await api.get('/items'); setItems(data); }
        catch (e) { addNotification('Error loading data', 'error'); }
        finally { setLoading(false); }
    };

    const filtered = useMemo(() => items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || (i.barcode && i.barcode.includes(searchTerm)) || i.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [items, searchTerm]);

    // Group by category
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(i => {
            if (!map[i.category]) map[i.category] = { items: [], totalStock: 0, totalValue: 0 };
            map[i.category].items.push(i);
            map[i.category].totalStock += i.stock;
            map[i.category].totalValue += i.stock * i.price;
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([category, data]) => ({ category, ...data }));
    }, [filtered]);

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat); else next.add(cat);
            return next;
        });
    };

    const expandAll = () => setExpandedCategories(new Set(grouped.map(g => g.category)));
    const collapseAll = () => setExpandedCategories(new Set());

    const stats = useMemo(() => ({
        categories: grouped.length,
        totalItems: filtered.length,
        totalStock: filtered.reduce((a, i) => a + i.stock, 0),
        totalValue: filtered.reduce((a, i) => a + (i.stock * i.price), 0),
    }), [grouped, filtered]);

    const handleExport = () => {
        const rows = ['Category,Name,Barcode,Stock,Unit,Price,Value'];
        grouped.forEach(g => {
            g.items.forEach(i => rows.push(`"${g.category}","${i.name}","${i.barcode || ''}",${i.stock},"${i.unit}",${i.price},${i.stock * i.price}`));
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'batch_wise_report.csv'; a.click(); URL.revokeObjectURL(url);
        addNotification('Report exported!');
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><Layers className="text-primary-500" />Batch-wise Item Report</h1>
                    <p className="text-secondary-500">Items grouped by category with totals</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search items or categories..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Download size={16} /><span>Export</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Categories</p><p className="text-2xl font-black text-secondary-900">{stats.categories}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Items</p><p className="text-2xl font-black text-secondary-900">{stats.totalItems}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Stock</p><p className="text-2xl font-black text-secondary-900">{stats.totalStock.toLocaleString()}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Total Value</p><p className="text-2xl font-black text-primary-600">₹{stats.totalValue.toLocaleString()}</p></div>
            </div>

            <div className="flex gap-2 mb-4">
                <button onClick={expandAll} className="text-xs text-primary-600 font-bold hover:underline">Expand All</button>
                <span className="text-slate-300">|</span>
                <button onClick={collapseAll} className="text-xs text-primary-600 font-bold hover:underline">Collapse All</button>
            </div>

            {loading ? <div className="text-center p-10 text-secondary-400 animate-pulse">Loading...</div>
                : grouped.length === 0 ? <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm"><Archive size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No items found</p></div>
                    : (
                        <div className="space-y-3">
                            {grouped.map(g => (
                                <div key={g.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {/* Category Header */}
                                    <button onClick={() => toggleCategory(g.category)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {expandedCategories.has(g.category) ? <ChevronDown size={18} className="text-primary-500" /> : <ChevronRight size={18} className="text-secondary-400" />}
                                            <div className="text-left">
                                                <p className="font-bold text-secondary-900">{g.category}</p>
                                                <p className="text-xs text-secondary-400">{g.items.length} items</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right"><p className="text-[10px] text-secondary-400 uppercase tracking-widest">Stock</p><p className="font-black text-secondary-900">{g.totalStock.toLocaleString()}</p></div>
                                            <div className="text-right"><p className="text-[10px] text-secondary-400 uppercase tracking-widest">Value</p><p className="font-black text-primary-600">₹{g.totalValue.toLocaleString()}</p></div>
                                        </div>
                                    </button>

                                    {/* Expanded Items */}
                                    {expandedCategories.has(g.category) && (
                                        <div className="border-t border-slate-100">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/30"><tr>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">#</th>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Name</th>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Barcode</th>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Stock</th>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Price</th>
                                                    <th className="px-6 py-2.5 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Value</th>
                                                </tr></thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {g.items.map((item, idx) => (
                                                        <tr key={item._id} className="hover:bg-primary-50/20 transition-colors">
                                                            <td className="px-6 py-2.5 text-xs text-secondary-400">{idx + 1}</td>
                                                            <td className="px-6 py-2.5 font-semibold text-sm text-secondary-900">{item.name}</td>
                                                            <td className="px-6 py-2.5 text-xs text-secondary-400 font-mono">{item.barcode || '—'}</td>
                                                            <td className="px-6 py-2.5 font-bold text-sm">{item.stock} {item.unit}</td>
                                                            <td className="px-6 py-2.5 text-sm">₹{item.price.toFixed(2)}</td>
                                                            <td className="px-6 py-2.5 font-black text-sm text-primary-600">₹{(item.stock * item.price).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
        </Layout>
    );
};

export default BatchWiseReport;
