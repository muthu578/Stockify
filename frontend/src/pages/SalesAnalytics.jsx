import React, { useState, useEffect } from 'react';
import {
    Package,
    TrendingUp,
    List,
    PieChart,
    Search,
    IndianRupee,
    Filter,
    BarChart2
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const SalesAnalytics = () => {
    const [soldItems, setSoldItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchSoldItems();
    }, []);

    const fetchSoldItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/reports/sold-items');
            setSoldItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(soldItems.map(item => item.category))];

    const filteredItems = soldItems.filter(item =>
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === 'All' || item.category === categoryFilter)
    );

    const mostSoldItem = soldItems.length > 0 ? soldItems[0] : null;
    const totalItemsSold = soldItems.reduce((acc, item) => acc + item.totalQuantity, 0);
    const totalRevenue = soldItems.reduce((acc, item) => acc + item.totalRevenue, 0);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Sales Analytics</h1>
                    <p className="text-slate-500">Deep dive into sold items and category performance</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Units Sold</p>
                        <h3 className="text-2xl font-black text-slate-900">{totalItemsSold.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Sold Item</p>
                        <h3 className="text-xl font-black text-slate-900 truncate max-w-[200px]">{mostSoldItem?.name || 'N/A'}</h3>
                    </div>
                </div>
                <div className="bg-[#0f172a] p-6 rounded-3xl flex items-center space-x-4 shadow-xl text-white">
                    <div className="p-4 bg-primary-500/20 text-primary-400 rounded-2xl">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Value</p>
                        <h3 className="text-2xl font-black">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Most Sold Items (Top List) */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        <BarChart2 className="mr-2 text-primary-500" size={20} />
                        Most Sold Items
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {soldItems.slice(0, 5).map((item, index) => (
                            <div key={item._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs mb-3 ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-primary-500'
                                    }`}>
                                    #{index + 1}
                                </span>
                                <h4 className="font-bold text-slate-900 mb-1 truncate w-full">{item.name}</h4>
                                <p className="text-xs text-primary-600 font-black uppercase tracking-widest">{item.category}</p>
                                <div className="mt-3 pt-3 border-t border-slate-200 w-full">
                                    <p className="text-lg font-black text-slate-900">{item.totalQuantity}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Units Sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed List and Filter */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        <List className="mr-2 text-primary-500" size={20} />
                        Sold Items Directory
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="text-sm font-semibold outline-none bg-transparent"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/20">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Total Quantity</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Total Revenue</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Contribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-slate-400 animate-pulse">Loading analytics data...</td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-slate-400">No items found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <span className="font-bold text-slate-900">{item.name}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className="font-black text-slate-700">{item.totalQuantity.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className="font-black text-slate-900">₹{item.totalRevenue.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-emerald-600">
                                                        {((item.totalRevenue / totalRevenue) * 100).toFixed(1)}%
                                                    </span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500"
                                                            style={{ width: `${(item.totalRevenue / totalRevenue) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SalesAnalytics;
