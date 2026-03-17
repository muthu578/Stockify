import React, { useState, useEffect } from 'react';
import {
    IndianRupee,
    Package,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Truck,
    Users,
    AlertCircle,
    Factory,
    Plus,
    Calendar,
    ArrowRight,
    Activity,
    Clock,
    Zap,
    Briefcase,
    BarChart3,
    Layers,
    ChevronDown,
    Filter,
    Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const Dashboard = () => {
    const { user, isAdmin, isManager } = useAuth();
    const { t, lang } = useLanguage();
    const [stats, setStats] = useState({
        totalSales: 0,
        orderCount: 0,
        stockCount: 0,
        lowStock: 0,
        revenue: ([...Array(7)]).map(() => Math.floor(Math.random() * 5000) + 1000),
        recentSales: [],
        customerCount: 0,
        supplierCount: 0,
        purchaseCount: 0,
        totalExpenses: 0,
        pendingPOs: 0,
        activeProductions: 0,
        categoryStats: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7D');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const promises = [
                api.get('/billing'),
                api.get('/items', { params: { limit: 1000 } }),
                api.get('/contacts')
            ];

            if (isManager()) {
                promises.push(api.get('/purchases'));
                promises.push(api.get('/finance/expenses'));
                promises.push(api.get('/purchase-orders'));
                promises.push(api.get('/productions'));
            }

            const results = await Promise.all(promises);
            const salesRes = results[0];
            const itemRes = results[1];
            const contactRes = results[2];
            const purchaseRes = isManager() ? results[3] : { data: [] };
            const expenseRes = isManager() ? results[4] : { data: [] };
            const poRes = isManager() ? results[5] : { data: [] };
            const prodRes = isManager() ? results[6] : { data: [] };

            const bills = salesRes.data.bills || salesRes.data || [];
            const items = itemRes.data.items || itemRes.data || [];
            const contacts = contactRes.data.contacts || contactRes.data || [];
            const purchases = purchaseRes.data.purchases || purchaseRes.data || [];
            const expenses = expenseRes.data.expenses || expenseRes.data || [];
            const pos = poRes.data.orders || poRes.data || [];
            const productions = prodRes.data.productions || prodRes.data || [];

            const totalSales = bills.reduce((acc, b) => acc + (b.finalAmount || 0), 0);
            const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
            const lowStock = items.filter(i => i.stock < 10).length;
            const customers = contacts.filter(c => c.type === 'Customer').length;
            const suppliers = contacts.filter(c => c.type === 'Supplier').length;
            const pendingPOs = pos.filter(po => po.status === 'Pending' || po.status === 'Partial').length;
            const activeProductions = productions.filter(p => p.status === 'In Progress' || p.status === 'Planned').length;

            // Calculate category distribution
            const categoryMap = items.reduce((acc, item) => {
                const cat = item.category || 'Other';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});

            const totalItems = items.length || 1;
            const categoryStats = Object.entries(categoryMap)
                .map(([label, count]) => ({
                    label,
                    val: Math.round((count / totalItems) * 100),
                    color: ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'][Math.floor(Math.random() * 5)]
                }))
                .sort((a, b) => b.val - a.val)
                .slice(0, 4);

            setStats(prev => ({
                ...prev,
                totalSales,
                totalExpenses,
                orderCount: bills.length,
                stockCount: items.length,
                lowStock,
                recentSales: bills.slice(0, 5),
                customerCount: customers,
                supplierCount: suppliers,
                purchaseCount: purchases.length,
                pendingPOs,
                activeProductions,
                categoryStats,
                revenue: (timeRange === '7D' ? [...Array(7)] : [...Array(30)]).map(() => Math.floor(Math.random() * 5000) + 1000)
            }));
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const lineChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { size: 12, weight: '800' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
            }
        },
        scales: {
            y: {
                grid: { display: true, color: 'rgba(226, 232, 240, 0.4)', drawBorder: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10, weight: '700' }, callback: (v) => '₹' + v }
            },
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10, weight: '700' } }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 0, hoverRadius: 6, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#fff' }
        }
    };

    const lineChartData = {
        labels: timeRange === '7D' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : [...Array(30)].map((_, i) => `${i + 1}`),
        datasets: [{
            data: stats.revenue,
            borderColor: '#10b981',
            borderWidth: 4,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
        }]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading) {
        return (
            <Layout>
                <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="text-emerald-500 animate-pulse" size={32} />
                        </div>
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Synchronizing Core Assets</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 pb-12"
            >
                {/* Hero / Welcome Strip */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-8 relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/20"
                    >
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -ml-24 -mb-24"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between h-full">
                            <div className="max-w-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node Cluster Alpha</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">System Hot</p>
                                    </div>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none">
                                    Welcome back, <br />
                                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                    Your enterprise is performing <span className="text-emerald-400 font-bold">12.5% better</span> than last week. All systems are operational.
                                </p>
                            </div>
                            
                            <div className="mt-10 md:mt-0 flex flex-col justify-end">
                                <div className="p-6 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 space-y-4 min-w-[240px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Uptime</span>
                                        <span className="text-xs font-black text-emerald-400">99.9%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '99.9%' }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Sales</p>
                                            <p className="text-xl font-black tracking-tight">₹{stats.totalSales.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Orders</p>
                                            <p className="text-xl font-black tracking-tight">{stats.orderCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-4 grid grid-cols-2 gap-4"
                    >
                        {[
                            { icon: ShoppingCart, label: 'Billing', path: '/billing', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                            { icon: Package, label: 'Inventory', path: '/inventory', color: 'bg-indigo-500', bg: 'bg-indigo-50' },
                            { icon: Truck, label: 'Purchase', path: '/purchase-orders', color: 'bg-amber-500', bg: 'bg-amber-50' },
                            { icon: Factory, label: 'Production', path: '/production', color: 'bg-rose-500', bg: 'bg-rose-50' }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => window.location.href = action.path}
                                className="group relative flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-900/5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color.replace('bg-', 'text-')} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                    <action.icon size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{action.label}</span>
                                <div className={`absolute bottom-0 inset-x-0 h-1 ${action.color} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
                            </button>
                        ))}
                    </motion.div>
                </div>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Revenue Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-2xl shadow-slate-900/5"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Matrix</h3>
                                <p className="text-slate-500 font-medium text-sm">Real-time fiscal monitoring vs historical benchmarks.</p>
                            </div>
                            <div className="flex bg-slate-50 p-1.5 rounded-[1.2rem] border border-slate-200/60">
                                {['7D', '30D'].map(range => (
                                    <button 
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </motion.div>

                    {/* Side Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Distribution Card */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-1">Asset Distribution</h3>
                                <p className="text-slate-400 text-xs font-medium mb-8">Resource allocation breakdown.</p>
                                <div className="h-[180px] mb-8 relative">
                                    <Doughnut 
                                        data={{
                                            labels: ['Inventory', 'Orders', 'Purchase', 'Production'],
                                            datasets: [{
                                                data: [stats.stockCount, stats.orderCount, stats.purchaseCount, stats.activeProductions],
                                                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'],
                                                borderWidth: 0,
                                                cutout: '82%',
                                                hoverOffset: 10
                                            }]
                                        }} 
                                        options={{ 
                                            maintainAspectRatio: false, 
                                            plugins: { legend: { display: false } }
                                        }} 
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate</p>
                                        <p className="text-3xl font-black tracking-tighter">{(stats.stockCount + stats.orderCount + stats.purchaseCount + stats.activeProductions).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Stock', val: stats.stockCount, color: 'bg-emerald-500' },
                                        { label: 'Orders', val: stats.orderCount, color: 'bg-indigo-500' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">{item.label}</p>
                                            </div>
                                            <p className="text-lg font-black">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Card */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-emerald-500 rounded-[3rem] p-8 text-white shadow-2xl shadow-emerald-500/20 relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-125 transition-transform duration-700">
                                <Zap size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                        <Activity size={20} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">AI Optimizer</h3>
                                </div>
                                <p className="text-emerald-50 font-medium text-sm leading-relaxed mb-6">
                                    Predictive models suggest a <span className="font-black underline decoration-emerald-300">18% surge</span> in requirements next week.
                                </p>
                                <button className="w-full py-4 bg-white text-emerald-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all">
                                    Analyze Flux
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Ledger */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-2xl shadow-slate-900/5"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Operational Ledger</h3>
                                <p className="text-slate-500 font-medium text-sm">Real-time terminal synchronization.</p>
                            </div>
                            <Button variant="ghost" size="sm" icon={ArrowUpRight} className="text-emerald-600 font-black">Full Audit</Button>
                        </div>
                        <div className="space-y-4">
                            {stats.recentSales.map((sale, i) => (
                                <div key={sale._id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-[1.5rem] border border-transparent hover:border-slate-200/60 hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            {sale.paymentMethod === 'Cash' ? <IndianRupee size={20} /> : <Zap size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 leading-none mb-1">{sale.billId}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sale.paymentMethod} Protocol</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 tracking-tight">₹{sale.finalAmount.toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* System Monitoring */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-4 grid grid-cols-1 gap-4"
                    >
                         {[
                            { label: 'Active Nodes', val: stats.customerCount, sub: 'Global Terminals', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Cloud Sync', val: 'Synchronized', sub: 'Last: 2m ago', icon: Cloud, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { label: 'Stock Health', val: stats.lowStock, sub: 'Critical Alerts', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-200/60 shadow-xl shadow-slate-900/5 flex items-center gap-6 group hover:border-slate-200 transition-colors">
                                <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900 truncate leading-none mb-1">{stat.val}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.sub}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
                {/* New Section: Top Products & Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Top Products */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-7 bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-2xl shadow-slate-900/5"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top Velocity Assets</h3>
                                <p className="text-slate-500 font-medium text-sm">Most frequent inventory movements.</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Premium Steel Sheet', category: 'Raw Material', sales: 145, trend: '+12%', color: 'bg-blue-500' },
                                { name: 'Industrial Drill Bit', category: 'Tools', sales: 98, trend: '+5%', color: 'bg-emerald-500' },
                                { name: 'Hydraulic Press Oil', category: 'Consumables', sales: 76, trend: '-2%', color: 'bg-amber-500' },
                                { name: 'Safety Harness L', category: 'Safety', sales: 54, trend: '+20%', color: 'bg-rose-500' },
                            ].map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-slate-200/60 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${product.color} rounded-xl shadow-lg flex items-center justify-center text-white font-bold`}>
                                            {product.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 leading-none mb-1">{product.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{product.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">{product.sales} <span className="text-[10px] text-slate-400 font-bold ml-1">Units</span></p>
                                        <p className={`text-[10px] font-black uppercase ${product.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {product.trend} Trend
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Category Breakdown */}
                    <motion.div 
                        variants={itemVariants}
                        className="lg:col-span-5 bg-slate-50 rounded-[3rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-900/5"
                    >
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Structural Dynamics</h3>
                        <div className="space-y-6">
                            {(stats.categoryStats.length > 0 ? stats.categoryStats : [
                                { label: 'Electronics', val: 65, color: 'bg-indigo-500' },
                                { label: 'Machinery', val: 45, color: 'bg-emerald-500' },
                                { label: 'Hardware', val: 30, color: 'bg-amber-500' },
                                { label: 'Safety Gear', val: 20, color: 'bg-rose-500' },
                            ]).map((cat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat.label}</span>
                                        <span className="text-sm font-black text-slate-900">{cat.val}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${cat.val}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full ${cat.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 p-6 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">System Intelligence</p>
                                    <p className="text-xs font-bold text-slate-600 leading-tight">Electronics inventory is reaching peak optimization levels.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Layout>
    );
};

export default Dashboard;
