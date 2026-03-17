import React, { useState, useEffect } from 'react';
import {
    Banknote,
    CreditCard,
    Smartphone,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Lock,
    Unlock,
    History,
    IndianRupee,
    ShieldCheck,
    BarChart3,
    Printer,
    SearchX,
    Activity,
    Clock,
    User
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClosed, setIsClosed] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/reports/daily-summary');
            setSummary(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalCash = summary.find(s => s._id === 'Cash')?.total || 0;
    const totalCard = summary.find(s => s._id === 'Card')?.total || 0;
    const totalUPI = summary.find(s => s._id === 'UPI')?.total || 0;
    const totalRevenue = summary.reduce((acc, curr) => acc + curr.total, 0);

    const toggleRegister = () => {
        const newState = !isClosed;
        setIsClosed(newState);
        addNotification(
            newState ? 'Register Vault Locked. Shift finalized.' : 'Register Vault Unlocked. New shift initialized.',
            newState ? 'error' : 'success'
        );
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant={isClosed ? "danger" : "primary"} dot>
                            {isClosed ? "Terminal Locked" : "Terminal Active"}
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Clock size={12} />
                            Today's Shift: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Register Vault</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Real-time <span className="text-slate-900 font-bold">Liquid Asset</span> tracking and shift reconciliation.</p>
                </div>
                <Button 
                    variant={isClosed ? "primary" : "danger"} 
                    size="lg"
                    icon={isClosed ? Unlock : Lock}
                    onClick={toggleRegister}
                >
                    {isClosed ? 'Initialize Shift' : 'Finalize Day & Lock'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <Banknote size={24} />
                        </div>
                        <Badge variant="secondary" size="xs">Liquid</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash Collection</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalCash.toLocaleString()}</h3>
                    <div className="absolute bottom-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                        <Banknote size={64} />
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <Badge variant="secondary" size="xs">Electronic</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Terminal</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalCard.toLocaleString()}</h3>
                    <div className="absolute bottom-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                        <CreditCard size={64} />
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <Smartphone size={24} />
                        </div>
                        <Badge variant="secondary" size="xs">Contactless</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">UPI / Digital Gateway</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalUPI.toLocaleString()}</h3>
                    <div className="absolute bottom-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                        <Smartphone size={64} />
                    </div>
                </Card>

                <Card className="relative overflow-hidden bg-slate-950 border-slate-900 group" hover={false}>
                    <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                            <IndianRupee size={24} />
                        </div>
                        <Badge variant="primary" size="xs" dot>Aggregate</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Vault Revenue</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">₹{totalRevenue.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <Badge variant="primary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5 text-[9px]">
                            +12.5% from shift start
                        </Badge>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card padding="p-0">
                    <CardHeader className="p-8 border-b border-slate-200/60 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <History size={20} />
                            </div>
                            <div>
                                <CardTitle>Historical Shift Logs</CardTitle>
                                <CardDescription>Audit trail of register reconciliations</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" icon={ArrowUpRight}>Audit Hub</Button>
                    </CardHeader>
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200/60 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                            <User size={10} /> Authorized by Admin_Entry
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">₹{(45000 - i * 5000).toLocaleString()}</p>
                                    <Badge variant="primary" size="xs" dot className="bg-emerald-50 text-emerald-600 border-emerald-100">Synchronized</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="flex flex-col justify-center items-center text-center p-12 bg-slate-50/30 border-dashed border-2 border-slate-200" animate={false} hover={false}>
                    <div className="w-24 h-24 bg-white text-slate-950 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-950/10 border border-slate-200/60">
                        <ShieldCheck size={48} />
                    </div>
                    <CardTitle className="text-3xl mb-4">Integrity Protocol</CardTitle>
                    <p className="text-slate-500 max-w-sm font-medium text-lg mb-10">
                        Finalizing the shift generates an immutable <span className="text-slate-900 font-black">Fiscal Snapshot</span> and secures all terminal nodes.
                    </p>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <Button 
                            variant="secondary" 
                            size="lg" 
                            icon={Printer}
                            className="w-full py-6 rounded-3xl"
                        >
                            Generate X-Report
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            icon={BarChart3}
                            className="w-full py-6 rounded-3xl"
                        >
                            Analytics
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="lg" 
                            icon={SearchX}
                            className="w-full col-span-2 py-6 rounded-3xl text-slate-400"
                        >
                            View Shift Discrepancies
                        </Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Register;
