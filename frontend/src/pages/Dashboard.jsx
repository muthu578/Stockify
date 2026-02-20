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
    Factory
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Define promises based on role
            const promises = [
                api.get('/billing'),
                api.get('/items'),
                api.get('/contacts')
            ];

            // Only Admins/Managers can see Purchases, Expenses, POs, Productions
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

            const bills = salesRes.data || [];
            const items = itemRes.data || [];
            const contacts = contactRes.data || [];
            const purchases = purchaseRes.data || [];
            const expenses = expenseRes.data || [];
            const pos = poRes.data || [];
            const productions = prodRes.data || [];

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
                activeProductions
            }));
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const lineChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Revenue',
            data: stats.revenue,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
        }]
    };

    const doughnutData = {
        labels: ['Inventory', 'Sales', 'Purchases', 'Production'],
        datasets: [{
            data: [stats.stockCount, stats.orderCount, stats.purchaseCount, stats.activeProductions],
            backgroundColor: ['#2ecc71', '#f39c12', '#2c3e50', '#e74c3c'],
            borderWidth: 0,
        }]
    };

    const Card = ({ title, value, icon: Icon, color, trend, trendValue, index }) => (
        <div
            style={{ animationDelay: `${index * 100}ms` }}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group animate-slide-in"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-3xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${trend === 'up' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{trendValue}%</span>
                    </div>
                )}
            </div>
            <p className="text-secondary-500 font-bold text-sm uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-secondary-900">{value}</h3>
        </div>
    );

    return (
        <Layout>
            <div className="mb-10">
                <h1 className="text-4xl font-black text-secondary-900 mb-2">Enterprise Dashboard</h1>
                <p className="text-secondary-500 font-medium">Real-time overview of your supermarket ERP performance</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem]"></div>)}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <Card index={0} title="Total Revenue" value={`₹${stats.totalSales.toLocaleString()}`} icon={IndianRupee} color="bg-primary-500" trend="up" trendValue="12" />
                        <Card index={1} title="Total Expenses" value={`₹${stats.totalExpenses.toLocaleString()}`} icon={TrendingDown} color="bg-rose-500" trend="up" trendValue="4" />
                        <Card index={2} title="Net Profit" value={`₹${(stats.totalSales - stats.totalExpenses).toLocaleString()}`} icon={TrendingUp} color="bg-primary-600" />
                        <Card index={3} title="Low Stock" value={stats.lowStock} icon={AlertCircle} color="bg-accent-500" trend="down" trendValue="5" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-secondary-900">Revenue Growth</h3>
                                    <p className="text-sm text-secondary-400 font-bold uppercase tracking-widest">Weekly Analytics</p>
                                </div>
                                <select className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-sm outline-none">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="h-[300px]">
                                <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>

                        <div className="bg-secondary-950 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-6">Operations Mix</h3>
                                <div className="h-[250px] mb-8">
                                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-secondary-400 flex items-center"><div className="w-2 h-2 rounded-full bg-primary-500 mr-2" /> Inventory</span>
                                        <span className="text-white">{stats.stockCount} Units</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-secondary-400 flex items-center"><div className="w-2 h-2 rounded-full bg-accent-500 mr-2" /> Total Sales</span>
                                        <span className="text-white">{stats.orderCount} Orders</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-secondary-400 flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Production</span>
                                        <span className="text-white">{stats.activeProductions} Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-primary-500/10 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-all"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-secondary-900 mb-6">Operations Insights</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-500"><ShoppingCart size={24} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary-400 uppercase">Pending POs</p>
                                        <p className="text-xl font-black">{stats.pendingPOs}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500"><Factory size={24} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary-400 uppercase">Productions</p>
                                        <p className="text-xl font-black">{stats.activeProductions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-secondary-900 mb-6">Partner Insights</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-500"><Users size={24} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary-400 uppercase">Customers</p>
                                        <p className="text-xl font-black">{stats.customerCount}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500"><Truck size={24} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary-400 uppercase">Suppliers</p>
                                        <p className="text-xl font-black">{stats.supplierCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-secondary-900 mb-6">Recent POS Transactions</h3>
                        <div className="space-y-2">
                            {stats.recentSales.map(sale => (
                                <div key={sale._id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black shadow-sm text-secondary-400 text-xs">
                                            {sale.paymentMethod === 'Cash' ? '💵' : '💳'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-secondary-900">{sale.billId}</p>
                                            <p className="text-xs text-secondary-400">{new Date(sale.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-secondary-900">₹{sale.finalAmount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;
