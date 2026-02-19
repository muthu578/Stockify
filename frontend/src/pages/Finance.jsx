import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Users,
    CreditCard,
    Banknote,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Landmark,
    Wallet,
    Calendar
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const Finance = () => {
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('accounts');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        accountName: '',
        bankName: '',
        accountNumber: '',
        balance: 0,
        type: 'Bank',
        expenseTitle: '',
        category: '',
        amount: 0,
        paymentAccount: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, expRes] = await Promise.all([
                api.get('/finance/accounts'),
                api.get('/finance/expenses')
            ]);
            setAccounts(accRes.data);
            setExpenses(expRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/accounts', {
                accountName: formData.accountName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                balance: formData.balance,
                type: formData.type
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving account');
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/expenses', {
                expenseTitle: formData.expenseTitle,
                category: formData.category,
                amount: formData.amount,
                paymentAccount: formData.paymentAccount,
                description: formData.description
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving expense');
        }
    };

    const totalBankBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Finance & Accounts</h1>
                    <p className="text-secondary-500">Manage bank accounts, cash flow, and business expenses</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20"
                >
                    <Plus size={20} />
                    <span>{activeTab === 'accounts' ? 'Add Account' : 'New Expense'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Total Balance</p>
                        <h3 className="text-2xl font-black text-secondary-900">₹{totalBankBalance.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Total Expenses</p>
                        <h3 className="text-2xl font-black text-secondary-900">₹{expenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-secondary-950 p-6 rounded-3xl flex items-center space-x-4 shadow-xl">
                    <div className="p-4 bg-primary-500/20 text-primary-400 rounded-2xl">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Active Ledgers</p>
                        <h3 className="text-2xl font-black text-white">{accounts.length} Accounts</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'accounts' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-secondary-400 hover:bg-slate-50'}`}
                    >
                        Bank & Cash Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'expenses' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-secondary-400 hover:bg-slate-50'}`}
                    >
                        Expense Records
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'accounts' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accounts.map(acc => (
                                <div key={acc._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-xl bg-white shadow-sm ${acc.type === 'Bank' ? 'text-primary-500' : 'text-amber-500'}`}>
                                            {acc.type === 'Bank' ? <Landmark size={20} /> : <Wallet size={20} />}
                                        </div>
                                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{acc.type}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-secondary-900 mb-1">{acc.accountName}</h4>
                                    <p className="text-sm text-secondary-400 font-bold mb-4">{acc.bankName || 'Cash Account'}</p>
                                    <div className="pt-4 border-t border-slate-200/50">
                                        <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Current Balance</p>
                                        <h2 className="text-2xl font-black text-primary-600">₹{acc.balance.toLocaleString()}</h2>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-slate-300 hover:text-secondary-900 transition-colors"><ArrowUpRight size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-secondary-400 text-xs font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Expense Title</th>
                                        <th className="px-6 py-4 text-left">Category</th>
                                        <th className="px-6 py-4 text-left">Account</th>
                                        <th className="px-6 py-4 text-left">Date</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.map(exp => (
                                        <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-secondary-800">{exp.expenseTitle}</p>
                                                <p className="text-xs text-secondary-400">{exp.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-secondary-800 text-secondary-500 rounded-full text-xs font-bold">{exp.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                                                    <Landmark size={14} className="text-slate-300" />
                                                    <span>{exp.paymentAccount?.accountName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-secondary-400 text-sm font-medium">
                                                {new Date(exp.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-rose-500">
                                                -₹{exp.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-secondary-900 mb-6">{activeTab === 'accounts' ? 'Add Financial Account' : 'Record Business Expense'}</h3>

                        {activeTab === 'accounts' ? (
                            <form onSubmit={handleAccountSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Account Name</label>
                                    <input type="text" required value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 font-bold" placeholder="e.g. Corporate Current Acc" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold">
                                            <option value="Bank">Bank</option>
                                            <option value="Cash">Cash</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Initial Balance</label>
                                        <input type="number" required value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Bank Name (Optional)</label>
                                    <input type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" placeholder="e.g. Wells Fargo" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all mt-4">Save Account</button>
                            </form>
                        ) : (
                            <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Expense Title</label>
                                    <input type="text" required value={formData.expenseTitle} onChange={e => setFormData({ ...formData, expenseTitle: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 font-bold" placeholder="e.g. Office Rent" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold">
                                            <option value="">-- Select --</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Salaries">Salaries</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Amount</label>
                                        <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Payment Account</label>
                                    <select required value={formData.paymentAccount} onChange={e => setFormData({ ...formData, paymentAccount: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold">
                                        <option value="">-- Choose Account --</option>
                                        {accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.accountName} (₹{acc.balance})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-secondary-400 uppercase mb-2">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold h-24" placeholder="Optional notes..."></textarea>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all mt-4">Record Expense</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Finance;
