import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    FileText,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    ShoppingCart,
    Users,
    AlertTriangle,
    Printer,
    Search,
    Filter,
    ArrowDownLeft,
    Landmark,
    PieChart,
    Layers
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import api from '../services/api';
import Layout from '../components/Layout';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNotification } from '../context/NotificationContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const Reports = () => {
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        bills: [],
        items: [],
        pos: [],
        transfers: [],
        topItems: [],
        salesHistory: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTable, setActiveTable] = useState('transactions'); // transactions, transfers, customers

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [billsRes, itemsRes, poRes, transferRes, topItemsRes, salesHistRes] = await Promise.all([
                api.get('/billing'),
                api.get('/items', { params: { limit: 1000 } }),
                api.get('/purchase-orders'),
                api.get('/stock-transfers'),
                api.get('/reports/top-items'),
                api.get('/reports/sales')
            ]);

            setData({
                bills: billsRes.data.bills || billsRes.data || [],
                items: itemsRes.data.items || itemsRes.data || [],
                pos: poRes.data.orders || poRes.data || [],
                transfers: transferRes.data.transfers || transferRes.data || [],
                topItems: topItemsRes.data || [],
                salesHistory: salesHistRes.data?.sales || []
            });
        } catch (error) {
            console.error('Report Fetch Error:', error);
            addNotification('Error fetching report data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // KPI Calculations
    const kpis = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const dailySales = data.bills
            .filter(b => b.createdAt.startsWith(today))
            .reduce((sum, b) => sum + b.finalAmount, 0);

        const totalStock = data.items.reduce((sum, item) => sum + item.stock, 0);
        const lowStockCount = data.items.filter(item => item.stock <= (item.minStockLevel || 10)).length;
        const pendingPOs = data.pos.filter(po => ['Sent', 'Partial'].includes(po.status)).length;

        return [
            { id: 1, title: 'Daily Sales', value: `₹${dailySales.toLocaleString()}`, icon: ShoppingCart, color: 'text-primary-600', bg: 'bg-primary-50', trend: 12 },
            { id: 2, title: 'Total Stock', value: totalStock.toLocaleString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 4 },
            { id: 3, title: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', alert: lowStockCount > 5 },
            { id: 4, title: 'Pending POs', value: pendingPOs, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', alert: pendingPOs > 0 }
        ];
    }, [data]);

    // Sales Trend Chart
    const salesChartData = {
        labels: data.salesHistory.map(s => s._id).slice(-7),
        datasets: [{
            label: 'Sales (₹)',
            data: data.salesHistory.map(s => s.totalSales).slice(-7),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1'
        }]
    };

    // Category Stock Chart
    const categoryData = useMemo(() => {
        const groups = data.items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.stock;
            return acc;
        }, {});
        return {
            labels: Object.keys(groups),
            datasets: [{
                label: 'Stock Level',
                data: Object.values(groups),
                backgroundColor: '#10b981',
                borderRadius: 8
            }]
        };
    }, [data.items]);

    // Supplier Performance Chart
    const supplierData = useMemo(() => {
        const groups = data.pos.reduce((acc, po) => {
            const name = po.supplier?.name || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        return {
            labels: Object.keys(groups),
            datasets: [{
                data: Object.values(groups),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                borderWidth: 0
            }]
        };
    }, [data.pos]);

    // Batch Expiry Chart
    const expiryData = useMemo(() => {
        const next6Months = [...Array(6)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() + i);
            return d.toLocaleString('default', { month: 'short' });
        });

        const counts = Array(6).fill(0);
        data.items.forEach(item => {
            if (item.expiryDate) {
                const expDate = new Date(item.expiryDate);
                const now = new Date();
                const diffMonths = (expDate.getFullYear() - now.getFullYear()) * 12 + (expDate.getMonth() - now.getMonth());
                if (diffMonths >= 0 && diffMonths < 6) {
                    counts[diffMonths]++;
                }
            }
        });

        return {
            labels: next6Months,
            datasets: [{
                label: 'Expiring Items',
                data: counts,
                backgroundColor: '#f43f5e',
                borderRadius: 6
            }]
        };
    }, [data.items]);

    // Customer Insights
    const customerInsights = useMemo(() => {
        const groups = data.bills.reduce((acc, bill) => {
            const name = bill.customer?.name || 'Walk-in';
            if (!acc[name]) acc[name] = { name, spent: 0, orders: 0, lastOrder: bill.createdAt };
            acc[name].spent += bill.finalAmount;
            acc[name].orders += 1;
            if (new Date(bill.createdAt) > new Date(acc[name].lastOrder)) acc[name].lastOrder = bill.createdAt;
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => b.spent - a.spent);
    }, [data.bills]);

    // Export Functions
    const handleExportCSV = () => {
        const flatData = data.bills.map(b => ({
            'Bill ID': b.billId,
            'Date': new Date(b.createdAt).toLocaleDateString(),
            'Customer': b.customer?.name || 'Walk-in',
            'Amount': b.finalAmount,
            'Payment': b.paymentMethod
        }));
        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales");
        XLSX.writeFile(wb, "Reporting_Dashboard_Export.xlsx");
        addNotification('Report exported to Excel!');
    };

    const handlePrint = () => window.print();

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('STOCKIFY ENTERPRISE REPORT', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

        const tableData = data.bills.slice(0, 20).map(b => [
            b.billId,
            new Date(b.createdAt).toLocaleDateString(),
            b.customer?.name || 'Walk-in',
            `Rs. ${b.finalAmount.toFixed(2)}`,
            b.paymentMethod
        ]);

        doc.autoTable({
            startY: 40,
            head: [['Bill ID', 'Date', 'Customer', 'Amount', 'Payment']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] }
        });

        doc.save('Stockify_Full_Report.pdf');
        addNotification('PDF Downloaded!');
    };

    if (loading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <p className="font-black text-secondary-500 uppercase tracking-widest text-xs">Aggregating Enterprise Data...</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 print:hidden">
                <div>
                    <h1 className="text-4xl font-black text-secondary-900 tracking-tight flex items-center gap-3">
                        <BarChart3 size={32} className="text-primary-600" />
                        Reporting Insights
                    </h1>
                    <p className="text-secondary-500 font-medium">Holistic view of your inventory and sales performance</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-secondary-800 font-black rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <Download size={18} />
                        Excel
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-secondary-800 font-black rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <FileText size={18} />
                        PDF
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-secondary-950 text-white font-black rounded-2xl hover:bg-secondary-800 shadow-xl shadow-secondary-950/20 transition-all active:scale-95">
                        <Printer size={18} />
                        Print
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpis.map((kpi, idx) => (
                    <div
                        key={kpi.id}
                        onClick={() => kpi.title === 'Low Stock Alerts' && setActiveTable('lowstock')}
                        className={`bg-white p-6 rounded-[2.5rem] border ${kpi.alert ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'} shadow-sm hover:shadow-xl transition-all duration-300 animate-slide-in ${kpi.title === 'Low Stock Alerts' ? 'cursor-pointer' : ''}`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-3xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            {kpi.trend && (
                                <div className="flex items-center gap-1 text-emerald-500 font-black text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={14} />
                                    {kpi.trend}%
                                </div>
                            )}
                        </div>
                        <p className="text-secondary-400 font-bold text-xs uppercase tracking-widest mb-1">{kpi.title}</p>
                        <h3 className={`text-3xl font-black ${kpi.alert ? 'text-rose-600' : 'text-secondary-900'}`}>{kpi.value}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-secondary-900">Sales Velocity</h3>
                            <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest">Revenue trends over last 7 days</p>
                        </div>
                        <TrendingUp size={20} className="text-primary-500" />
                    </div>
                    <div className="h-[300px]">
                        <Line data={salesChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { display: false } }, x: { grid: { display: false } } } }} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-secondary-900 mb-2">Category Stock</h3>
                    <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest mb-8">Raw units by department</p>
                    <div className="h-[300px]">
                        <Bar data={categoryData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-secondary-900">Batch Expiry Timeline</h3>
                            <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest">Items expiring in coming months</p>
                        </div>
                        <Calendar size={20} className="text-rose-500" />
                    </div>
                    <div className="h-[250px]">
                        <Bar data={expiryData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } }} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-secondary-900">Supplier Order Volume</h3>
                            <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest">Orders distributed by supplier</p>
                        </div>
                        <PieChart size={20} className="text-emerald-500" />
                    </div>
                    <div className="h-[250px] flex items-center justify-center">
                        <Pie data={supplierData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
                <div className="flex flex-wrap items-center bg-slate-50/50 border-b border-slate-100 p-2">
                    <button onClick={() => setActiveTable('transactions')} className={`px-6 py-3 text-sm font-black rounded-2xl transition-all ${activeTable === 'transactions' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}>Transactions</button>
                    <button onClick={() => setActiveTable('lowstock')} className={`px-6 py-3 text-sm font-black rounded-2xl transition-all ${activeTable === 'lowstock' ? 'bg-white text-rose-600 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}>Low Stock</button>
                    <button onClick={() => setActiveTable('transfers')} className={`px-6 py-3 text-sm font-black rounded-2xl transition-all ${activeTable === 'transfers' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}>Stock Transfers</button>
                    <button onClick={() => setActiveTable('customers')} className={`px-6 py-3 text-sm font-black rounded-2xl transition-all ${activeTable === 'customers' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}>Customer Insights</button>

                    <div className="ml-auto relative w-full md:w-64 p-2">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search table..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {activeTable === 'transactions' && (
                        <table className="w-full text-left animate-in fade-in duration-300">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Bill Details</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Method</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.bills.filter(b => b.billId.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(bill => (
                                    <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-secondary-900 tracking-tight">{bill.billId}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{bill.items.length} items</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-secondary-700">{bill.customer?.name || 'Walk-in'}</td>
                                        <td className="px-8 py-5 font-black text-secondary-900">₹{bill.finalAmount.toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">{bill.paymentMethod}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTable === 'lowstock' && (
                        <table className="w-full text-left animate-in fade-in duration-300">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Item Name</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Category</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Current Stock</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Min Level</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.items.filter(i => i.stock <= (i.minStockLevel || 10)).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-secondary-900 tracking-tight">{item.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{item.barcode || 'NO BARCODE'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-secondary-700">{item.category}</td>
                                        <td className="px-8 py-5 font-black text-rose-600">{item.stock} {item.unit}</td>
                                        <td className="px-8 py-5 font-bold text-slate-400">{item.minStockLevel || 10}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => window.location.href = `/purchases/po?itemId=${item._id}`}
                                                className="px-4 py-2 bg-primary-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                                            >
                                                Restock Item
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data.items.filter(i => i.stock <= (i.minStockLevel || 10)).length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center font-bold text-secondary-400 uppercase tracking-widest text-xs">All inventory is healthy! 🎉</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTable === 'transfers' && (
                        <table className="w-full text-left animate-in fade-in duration-300">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Ref #</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Routes</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Items</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.transfers.filter(t => t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-secondary-900">{t.transferNumber}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                <span className="text-secondary-900">{t.fromLocation}</span>
                                                <ChevronRight size={12} className="text-primary-500" />
                                                <span className="text-emerald-600">{t.toLocation}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5"><span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{t.items.length} units</span></td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTable === 'customers' && (
                        <table className="w-full text-left animate-in fade-in duration-300">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Customer Name</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Total Orders</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest">Total Spent</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase text-secondary-500 tracking-widest text-right">Last Visit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customerInsights.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(c => (
                                    <tr key={c.name} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-secondary-400 text-xs">{c.name.charAt(0)}</div>
                                                <p className="font-black text-secondary-900 tracking-tight">{c.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-600">{c.orders} transactions</td>
                                        <td className="px-8 py-5 font-black text-primary-600">₹{c.spent.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{new Date(c.lastOrder).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Reports;

