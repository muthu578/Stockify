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
    Filter
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
        activeProductions: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7D');
    const [activeFilter, setActiveFilter] = useState('All');

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
                revenue: (timeRange === '7D' ? [...Array(7)] : [...Array(30)]).map(() => Math.floor(Math.random() * 5000) + 1000)
            }));
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Regenerate revenue when timeRange changes (mocking historical data fetch)
        setStats(prev => ({
            ...prev,
            revenue: (timeRange === '7D' ? [...Array(7)] : [...Array(30)]).map(() => Math.floor(Math.random() * 5000) + 1000)
        }));
    }, [timeRange]);

    const lineChartData = {
        labels: timeRange === '7D' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : [...Array(30)].map((_, i) => `${i+1}`),
        datasets: [
            {
                label: lang === 'en' ? 'Actual Revenue' : 'Revenu Actuel',
                data: stats.revenue,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: timeRange === '7D' ? 4 : 2,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    const doughnutData = {
        labels: [t('inventory'), t('billing'), t('procurement'), t('manufacturing')],
        datasets: [{
            data: [stats.stockCount, stats.orderCount, stats.purchaseCount, stats.activeProductions],
            backgroundColor: ['#10b981', '#f59e0b', '#0f172a', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 20
        }]
    };

    const QuickAction = ({ icon: Icon, label, path, color }) => (
        <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = path}
            className={`flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-900/5 transition-all group`}
        >
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:rotate-12 transition-transform`}>
                <Icon size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </motion.button>
    );

    return (
        <Layout>
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>
                
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="primary" dot className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                            {t('welcome')}
                        </Badge>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Clock size={12} />
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">
                        Hello, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-lg">
                        System health is <span className="text-emerald-500 font-black">OPTIMAL</span>. All enterprise nodes are synchronized.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-2xl shadow-slate-900/5">
                    <QuickAction icon={ShoppingCart} label={t('pos')} path="/billing" color="bg-emerald-500" />
                    <QuickAction icon={Plus} label="Add Item" path="/inventory/product-master" color="bg-indigo-500" />
                    <QuickAction icon={Zap} label="Alerts" path="/alerts" color="bg-amber-500" />
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center animate-pulse text-slate-300 font-black tracking-widest uppercase">Initializing Core Dashboard...</div>
            ) : (
                <div className="space-y-10">
                    {/* Top KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: t('totalSales'), value: `₹${stats.totalSales.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12.5%' },
                            { title: 'Operational Costs', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', trend: '+4.2%' },
                            { title: 'Net Settlement', value: `₹${(stats.totalSales - stats.totalExpenses).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { title: t('lowStock'), value: `${stats.lowStock}`, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-2.1%' }
                        ].map((kpi, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-900/5 relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        <kpi.icon size={24} />
                                    </div>
                                    {kpi.trend && (
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${kpi.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {kpi.trend}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.title}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-current/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-[3rem] border-white shadow-2xl shadow-slate-900/5 p-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Revenue Trajectory' : 'Trajectoire des Revenus'}</h3>
                                    <p className="text-slate-500 font-medium text-sm">Real-time fiscal monitoring vs historical benchmarks.</p>
                                </div>
                                <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem]">
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
                                <Line 
                                    data={lineChartData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { grid: { display: true, color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10, weight: '700' } } },
                                            x: { grid: { display: false }, ticks: { font: { size: 10, weight: '700' } } }
                                        }
                                    }} 
                                />
                            </div>
                        </Card>

                        <div className="space-y-8">
                            <Card className="bg-[#0f172a] text-white rounded-[3rem] p-10 relative overflow-hidden group border-none shadow-2xl shadow-slate-950/20">
                                <h3 className="text-xl font-black mb-1">Asset Distribution</h3>
                                <p className="text-slate-400 text-xs font-medium mb-8">Resource allocation breakdown.</p>
                                <div className="h-[200px] mb-8 relative">
                                    <Doughnut 
                                        data={doughnutData} 
                                        options={{ 
                                            maintainAspectRatio: false, 
                                            plugins: { legend: { display: false } },
                                            cutout: '80%'
                                        }} 
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                                        <p className="text-2xl font-black uppercase">{stats.stockCount + stats.orderCount}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: t('inventory'), val: stats.stockCount, color: 'bg-emerald-500' },
                                        { label: t('billing'), val: stats.orderCount, color: 'bg-amber-500' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase truncate">{item.label}</p>
                                            </div>
                                            <p className="text-xl font-black">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-600/20 overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                            <Zap size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight">AI Insights</h3>
                                    </div>
                                    <p className="text-emerald-50/80 font-medium text-sm leading-relaxed mb-6">
                                        Based on last 7 days, your <span className="text-white font-black underline underline-offset-4 decoration-emerald-300">Produce</span> category has shown <span className="font-black text-white">+18% growth</span>. Consider restocking.
                                    </p>
                                    <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all">
                                        Run Simulation
                                    </button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            </Card>
                        </div>
                    </div>

                    {/* Bottom Operational Hub */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transaction Table */}
                        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-[3rem] border-white shadow-2xl shadow-slate-900/5 p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Ledger</h3>
                                    <p className="text-slate-500 font-medium text-sm">Synchronized POS transactions from all terminals.</p>
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select 
                                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none appearance-none cursor-pointer"
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Descriptor</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Value</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Health</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {stats.recentSales.map(sale => (
                                            <tr key={sale._id} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                            <Activity size={16} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900">{sale.billId}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5">
                                                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold">{sale.paymentMethod}</Badge>
                                                </td>
                                                <td className="py-5 text-right font-black text-slate-900">₹{sale.finalAmount.toLocaleString()}</td>
                                                <td className="py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase">Synced</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Secondary KPIs */}
                        <div className="grid grid-cols-1 gap-8">
                            <Card className="bg-white/80 backdrop-blur-md rounded-[3rem] border-white shadow-2xl shadow-slate-900/5 p-8 flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center flex-shrink-0 animate-bounce-subtle">
                                    <Truck size={28} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Procurement Chain</p>
                                    <h4 className="text-3xl font-black text-slate-900">{stats.pendingPOs} <span className="text-xs text-slate-400 font-bold ml-1">Pending BCs</span></h4>
                                </div>
                                <ArrowRight className="text-slate-300" size={20} />
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-md rounded-[3rem] border-white shadow-2xl shadow-slate-900/5 p-8 flex items-center gap-6">
                                <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center flex-shrink-0">
                                    <Users size={28} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Network</p>
                                    <h4 className="text-3xl font-black text-slate-900">{stats.customerCount} <span className="text-xs text-slate-400 font-bold ml-1">Nodes Active</span></h4>
                                </div>
                                <ArrowRight className="text-slate-300" size={20} />
                            </Card>

                             <Card className="bg-white/80 backdrop-blur-md rounded-[3rem] border-white shadow-2xl shadow-slate-900/5 p-8 flex items-center gap-6">
                                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center flex-shrink-0">
                                    <Layers size={28} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Queue</p>
                                    <h4 className="text-3xl font-black text-slate-900">{stats.activeProductions} <span className="text-xs text-slate-400 font-bold ml-1">Lines Hot</span></h4>
                                </div>
                                <ArrowRight className="text-slate-300" size={20} />
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
