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
    IndianRupee
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const Register = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClosed, setIsClosed] = useState(false);

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

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Register</h1>
                    <p className="text-slate-500">Manage daily cash flow and register closing</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsClosed(!isClosed)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${isClosed ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'
                            }`}
                    >
                        {isClosed ? <Unlock size={20} /> : <Lock size={20} />}
                        <span>{isClosed ? 'Open Register' : 'Close Register for Today'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Banknote size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Collection</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{totalCash.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <CreditCard size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Payments</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{totalCard.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Smartphone size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI / Digital</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{totalUPI.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
                    <div className="bg-primary-500/20 text-primary-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <IndianRupee size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-slate-400">Total In Drawer</p>
                    <h3 className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
                        <History className="text-primary-500" size={20} />
                        <h3 className="text-lg font-bold">Recent Shifts</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-xl shadow-sm">
                                            <Calendar className="text-slate-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Feb {19 - i}, 2026</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Closed by Admin</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">₹{(45000 - i * 5000).toLocaleString()}</p>
                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Balanced</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mb-6">
                        <Lock size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Register Security</h3>
                    <p className="text-slate-500 max-w-sm font-medium mb-8">
                        Closing the register will generate a daily summary report and lock new transactions until the next shift starts.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">
                            Print X-Report
                        </button>
                        <button className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">
                            View Discrepancies
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
