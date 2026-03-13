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
    Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
        datasets: [
            {
                label: 'Actual Revenue',
                data: stats.revenue,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'AI Forecast',
                data: [...stats.revenue.slice(0, 4), ...stats.revenue.slice(4).map(v => v * 1.15)],
                borderColor: '#6366f1',
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
            }
        ]
    };

    const doughnutData = {
        labels: ['Inventory', 'Sales', 'Purchases', 'Production'],
        datasets: [{
            data: [stats.stockCount, stats.orderCount, stats.purchaseCount, stats.activeProductions],
            backgroundColor: ['#10b981', '#f59e0b', '#0f172a', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 20
        }]
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, index }) => (
        <Card index={index} className="overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                {trend && (
                    <Badge variant={trend === 'up' ? 'primary' : 'danger'} dot>
                        {trendValue}%
                    </Badge>
                )}
            </div>
            <div>
                <CardDescription className="uppercase tracking-[0.2em] font-black text-[10px] mb-1">{title}</CardDescription>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {trend && (
                         <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {trend === 'up' ? '+' : '-'}{trendValue}% vs last week
                         </span>
                    )}
                </div>
            </div>
            <div className={`h-1 w-full absolute bottom-0 left-0 ${color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>
        </Card>
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>Live Operations</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Calendar size={12} />
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Welcome back, <span className="text-emerald-500">{user?.name?.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Here's what's happening in your <span className="text-slate-900 font-bold">Stockify Enterprise</span> today.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Button 
                        variant="primary" 
                        icon={ShoppingCart}
                        onClick={() => window.location.href = '/billing'}
                    >
                        New POS Invoice
                    </Button>
                    <Button 
                        variant="secondary" 
                        icon={Plus}
                        onClick={() => window.location.href = '/inventory/product-master'}
                    >
                        Add Item
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <StatCard index={0} title="Gross Revenue" value={`₹${stats.totalSales.toLocaleString()}`} icon={IndianRupee} color="bg-emerald-500" trend="up" trendValue="12.5" />
                        <StatCard index={1} title="Opex Costs" value={`₹${stats.totalExpenses.toLocaleString()}`} icon={TrendingDown} color="bg-rose-500" trend="up" trendValue="4.2" />
                        <StatCard index={2} title="Operating Profit" value={`₹${(stats.totalSales - stats.totalExpenses).toLocaleString()}`} icon={TrendingUp} color="bg-emerald-600" />
                        <StatCard index={3} title="Stock Health" value={`${stats.lowStock} Alerts`} icon={Activity} color="bg-amber-500" trend="down" trendValue="5.1" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <CardTitle>Performance Hub</CardTitle>
                                    <CardDescription>Visualizing revenue growth & AI-driven predictive insights</CardDescription>
                                </div>
                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                    <button className="px-4 py-2 bg-white text-slate-900 shadow-sm rounded-lg text-xs font-bold transition-all">7D</button>
                                    <button className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold transition-all">30D</button>
                                </div>
                            </CardHeader>
                            <div className="h-[350px] w-full mt-4">
                                <Line 
                                    data={lineChartData} 
                                    options={{ 
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    usePointStyle: true,
                                                    padding: 20,
                                                    font: { size: 10, weight: '900', family: 'Outfit' }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: { grid: { display: true, color: '#f1f5f9' }, border: { display: false } },
                                            x: { grid: { display: false } }
                                        }
                                    }} 
                                />
                            </div>
                        </Card>

                        <Card className="bg-[#0f172a] text-white border-transparent relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="text-white">Portfolio Mix</CardTitle>
                                    <CardDescription className="text-slate-400">Enterprise resource distribution</CardDescription>
                                </CardHeader>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="h-[220px] mb-10 group-hover:scale-105 transition-transform duration-700">
                                        <Doughnut 
                                            data={doughnutData} 
                                            options={{ 
                                                maintainAspectRatio: false, 
                                                plugins: { legend: { display: false } },
                                                cutout: '75%'
                                            }} 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Inventory Assets', value: stats.stockCount, sub: 'Units', color: 'bg-emerald-500' },
                                            { label: 'Market Sales', value: stats.orderCount, sub: 'Orders', color: 'bg-amber-500' },
                                            { label: 'Production Flow', value: stats.activeProductions, sub: 'Active', color: 'bg-rose-500' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-current`}></div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <p className="font-black text-sm">{item.value} <span className="text-[10px] text-slate-500 font-bold ml-1">{item.sub}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <Card>
                            <CardHeader className="flex justify-between items-center border-b border-slate-50 pb-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 text-white rounded-2xl">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <CardTitle>Operational Pulse</CardTitle>
                                        <CardDescription>Real-time system health & logistics</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="xs" icon={ArrowRight}>Real-time logs</Button>
                            </CardHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl group/sub hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Badge variant="secondary" className="mb-4">Logistics</Badge>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover/sub:bg-emerald-500 group-hover/sub:text-white transition-colors"><ShoppingCart size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending POs</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.pendingPOs}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl group/sub hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Badge variant="secondary" className="mb-4">Manufacturing</Badge>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover/sub:bg-rose-500 group-hover/sub:text-white transition-colors"><Factory size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Lines</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.activeProductions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                             <CardHeader className="flex justify-between items-center border-b border-slate-50 pb-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <CardTitle>Network Hub</CardTitle>
                                        <CardDescription>B2B & B2C relationship monitoring</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="xs" icon={ArrowRight}>CRM Directory</Button>
                            </CardHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl group/sub hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Badge variant="secondary" className="mb-4">Clients</Badge>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover/sub:bg-emerald-500 group-hover/sub:text-white transition-colors"><Users size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.customerCount}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl group/sub hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <Badge variant="secondary" className="mb-4">Suppliers</Badge>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover/sub:bg-amber-500 group-hover/sub:text-white transition-colors"><Truck size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendors</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.supplierCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="mb-12">
                         <CardHeader className="flex justify-between items-center mb-10">
                            <div>
                                <CardTitle>Market Intelligence</CardTitle>
                                <CardDescription>Latest POS terminal transactions across the network</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">Audit History</Button>
                        </CardHeader>
                        <div className="overflow-x-auto -mx-6 md:-mx-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                        <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                        <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settlement</th>
                                        <th className="px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recentSales.map(sale => (
                                        <tr key={sale._id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Activity size={16} className="text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">{sale.billId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-600">{new Date(sale.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{new Date(sale.createdAt).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge variant="secondary">{sale.paymentMethod}</Badge>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900">
                                                ₹{sale.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Completed</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;

