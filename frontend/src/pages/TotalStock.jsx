import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, Download, Archive, TrendingUp, DollarSign } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const TotalStock = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const { addNotification } = useNotification();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try { setLoading(true); const { data } = await api.get('/items'); setItems(data); }
        catch (e) { addNotification('Error loading stock data', 'error'); }
        finally { setLoading(false); }
    };

    const categories = useMemo(() => ['All', ...new Set(items.map(i => i.category))], [items]);

    const categorySummary = useMemo(() => {
        const map = {};
        items.forEach(i => {
            if (!map[i.category]) map[i.category] = { count: 0, stock: 0, value: 0, cost: 0 };
            map[i.category].count++;
            map[i.category].stock += i.stock;
            map[i.category].value += i.stock * i.price;
            map[i.category].cost += i.stock * (i.buyPrice || 0);
        });
        return Object.entries(map).map(([cat, data]) => ({ category: cat, ...data, margin: data.value - data.cost }));
    }, [items]);

    const filtered = useMemo(() => {
        let result = items.filter(i => {
            const m = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || (i.barcode && i.barcode.includes(searchTerm));
            const c = categoryFilter === 'All' || i.category === categoryFilter;
            return m && c;
        });
        if (sortBy === 'stock-asc') result.sort((a, b) => a.stock - b.stock);
        else if (sortBy === 'stock-desc') result.sort((a, b) => b.stock - a.stock);
        else if (sortBy === 'value-desc') result.sort((a, b) => (b.stock * b.price) - (a.stock * a.price));
        else result.sort((a, b) => a.name.localeCompare(b.name));
        return result;
    }, [items, searchTerm, categoryFilter, sortBy]);

    const totals = useMemo(() => ({
        items: items.length,
        stock: items.reduce((a, i) => a + i.stock, 0),
        value: items.reduce((a, i) => a + (i.stock * i.price), 0),
        cost: items.reduce((a, i) => a + (i.stock * (i.buyPrice || 0)), 0),
    }), [items]);

    const handleExport = () => {
        const csv = ['Name,Barcode,Category,Stock,Unit,Buy Price,Sell Price,Stock Value,Cost Value,Margin',
            ...filtered.map(i => `"${i.name}","${i.barcode || ''}","${i.category}",${i.stock},"${i.unit}",${i.buyPrice || 0},${i.price},${i.stock * i.price},${i.stock * (i.buyPrice || 0)},${(i.stock * i.price) - (i.stock * (i.buyPrice || 0))}`)
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'total_stock_report.csv'; a.click(); URL.revokeObjectURL(url);
        addNotification('Report exported!');
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3"><Package className="text-primary-500" />Total Stock</h1>
                    <p className="text-secondary-500">Complete stock overview with valuation</p>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} /><input type="text" placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none shrink-0" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">A-Z</option><option value="stock-desc">Stock ↓</option><option value="stock-asc">Stock ↑</option><option value="value-desc">Value ↓</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"><Download size={16} /><span>Export</span></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Products</p><p className="text-2xl font-black text-secondary-900">{totals.items}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Units</p><p className="text-2xl font-black text-secondary-900">{totals.stock.toLocaleString()}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Sell Value</p><p className="text-2xl font-black text-primary-600">₹{totals.value.toLocaleString()}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Margin</p><p className="text-2xl font-black text-emerald-600">₹{(totals.value - totals.cost).toLocaleString()}</p></div>
            </div>

            {/* Category Summary */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100"><h3 className="font-bold text-secondary-700 text-sm">Category Summary</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Total Stock</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Sell Value</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Cost Value</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Margin</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {categorySummary.map(cs => (
                                <tr key={cs.category} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-bold text-secondary-900 text-sm">{cs.category}</td>
                                    <td className="px-6 py-3 text-sm">{cs.count}</td>
                                    <td className="px-6 py-3 font-bold text-sm">{cs.stock.toLocaleString()}</td>
                                    <td className="px-6 py-3 font-black text-primary-600 text-sm">₹{cs.value.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-sm text-secondary-500">₹{cs.cost.toLocaleString()}</td>
                                    <td className="px-6 py-3 font-black text-emerald-600 text-sm">₹{cs.margin.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100"><h3 className="font-bold text-secondary-700 text-sm">Item-wise Stock ({filtered.length} items)</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50"><tr>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Buy Price</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Sell Price</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Stock Value</th>
                            <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-wider">Margin</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? <tr><td colSpan="8" className="p-10 text-center animate-pulse text-secondary-400">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="8" className="p-16 text-center"><Archive size={40} className="mx-auto text-slate-200 mb-3" /><p className="font-bold text-secondary-400">No items</p></td></tr>
                                    : filtered.map((item, idx) => {
                                        const stockVal = item.stock * item.price;
                                        const costVal = item.stock * (item.buyPrice || 0);
                                        return (<tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3 text-xs text-secondary-400">{idx + 1}</td>
                                            <td className="px-6 py-3 font-bold text-secondary-900 text-sm">{item.name}</td>
                                            <td className="px-6 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{item.category}</span></td>
                                            <td className="px-6 py-3 font-black text-secondary-900">{item.stock} <span className="text-secondary-400 font-normal text-xs">{item.unit}</span></td>
                                            <td className="px-6 py-3 text-sm text-secondary-500">₹{(item.buyPrice || 0).toFixed(2)}</td>
                                            <td className="px-6 py-3 text-sm font-semibold">₹{item.price.toFixed(2)}</td>
                                            <td className="px-6 py-3 font-black text-primary-600">₹{stockVal.toLocaleString()}</td>
                                            <td className="px-6 py-3 font-black text-emerald-600">₹{(stockVal - costVal).toLocaleString()}</td>
                                        </tr>);
                                    })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-black"><tr>
                            <td colSpan="3" className="px-6 py-3 text-sm text-secondary-700">TOTAL</td>
                            <td className="px-6 py-3 text-sm">{filtered.reduce((a, i) => a + i.stock, 0).toLocaleString()}</td>
                            <td></td><td></td>
                            <td className="px-6 py-3 text-primary-600 text-sm">₹{filtered.reduce((a, i) => a + (i.stock * i.price), 0).toLocaleString()}</td>
                            <td className="px-6 py-3 text-emerald-600 text-sm">₹{filtered.reduce((a, i) => a + ((i.stock * i.price) - (i.stock * (i.buyPrice || 0))), 0).toLocaleString()}</td>
                        </tr></tfoot>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default TotalStock;
