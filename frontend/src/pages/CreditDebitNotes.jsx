import React, { useState } from 'react';
import {
    Plus,
    Search,
    FileSignature,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Eye,
    X,
    Filter,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const CreditDebitNotes = () => {
    const { addNotification } = useNotification();
    const [notes, setNotes] = useState([
        { id: 'CN-1001', type: 'Credit', amount: 450.00, customer: 'John Doe', date: '2026-02-15', status: 'Applied', reason: 'Product Damage' },
        { id: 'DN-2001', type: 'Debit', amount: 1200.00, customer: 'Fresh Veggies Ltd', date: '2026-02-18', status: 'Pending', reason: 'Price Difference' },
        { id: 'CN-1002', type: 'Credit', amount: 150.00, customer: 'Mike Smith', date: '2026-02-20', status: 'Approved', reason: 'Sales Return' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ type: 'Credit', amount: '', customer: '', reason: '' });

    const filtered = notes.filter(n =>
        (n.customer.toLowerCase().includes(searchTerm.toLowerCase()) || n.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (typeFilter === 'All' || n.type === typeFilter)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const newNote = {
            id: `${formData.type === 'Credit' ? 'CN' : 'DN'}-${Math.floor(Math.random() * 9000) + 1000}`,
            ...formData,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        };
        setNotes([newNote, ...notes]);
        setShowModal(false);
        addNotification(`${formData.type} Note created successfully!`);
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="shrink-0">
                    <h1 className="text-4xl font-black text-secondary-900 flex items-center gap-4">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-600/20">
                            <FileSignature className="text-white" size={28} />
                        </div>
                        Financial Notes
                    </h1>
                    <p className="text-secondary-500 font-medium">Manage Credit & Debit notes for adjustments</p>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-2xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by ID or customer..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none shrink-0"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Credit">Credit Only</option>
                        <option value="Debit">Debit Only</option>
                    </select>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-secondary-950 text-white font-black rounded-2xl hover:bg-secondary-800 shadow-xl shadow-secondary-950/20 transition-all active:scale-95 shrink-0"
                    >
                        <Plus size={20} />
                        Create Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl shrink-0"><ArrowDownLeft size={32} /></div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Credit</p>
                        <p className="text-3xl font-black text-secondary-900">₹{notes.filter(n => n.type === 'Credit').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl shrink-0"><ArrowUpRight size={32} /></div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Total Debit</p>
                        <p className="text-3xl font-black text-secondary-900">₹{notes.filter(n => n.type === 'Debit').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl shrink-0"><Info size={32} /></div>
                    <div>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Pending Sync</p>
                        <p className="text-3xl font-black text-secondary-900">{notes.filter(n => n.status === 'Pending').length} Notes</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-xs font-bold text-secondary-400 uppercase tracking-widest">Note Details</th>
                            <th className="px-8 py-5 text-xs font-bold text-secondary-400 uppercase tracking-widest">Adjustment Type</th>
                            <th className="px-8 py-5 text-xs font-bold text-secondary-400 uppercase tracking-widest">Amount</th>
                            <th className="px-8 py-5 text-xs font-bold text-secondary-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(note => (
                            <tr key={note.id} className="hover:bg-slate-50/30 transition-all">
                                <td className="px-8 py-5">
                                    <p className="font-black text-secondary-900 leading-none mb-1.5">{note.id}</p>
                                    <p className="text-xs font-bold text-secondary-400">{note.customer} • {note.date}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${note.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {note.type === 'Credit' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                        {note.type} Note
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{note.reason}</p>
                                </td>
                                <td className="px-8 py-5 font-black text-secondary-900 text-lg decoration-primary-500 underline underline-offset-4 decoration-2">₹{note.amount.toLocaleString()}</td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${note.status === 'Applied' ? 'bg-emerald-100 text-emerald-600' :
                                            note.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {note.status === 'Applied' ? <CheckCircle2 size={12} /> : <Info size={12} />}
                                        {note.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Eye size={18} /></button>
                                        <button className="p-2.5 text-secondary-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-3xl font-black text-secondary-900">New Financial Note</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'Credit' })}
                                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${formData.type === 'Credit' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                    Credit Note
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'Debit' })}
                                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${formData.type === 'Debit' ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-lg shadow-rose-500/10' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                    Debit Note
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Customer / Entity</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-secondary-900"
                                    placeholder="Enter name..."
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Adjustment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-secondary-300">₹</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-secondary-900 text-xl"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || '' })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Reason / Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-secondary-900 resize-none"
                                    rows={2}
                                    placeholder="Why is this note being issued?"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-secondary-950 text-white font-black rounded-[1.5rem] hover:bg-secondary-800 shadow-2xl shadow-secondary-950/20 transition-all active:scale-95 text-lg"
                            >
                                Issue Note
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CreditDebitNotes;
