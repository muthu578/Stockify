import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Users,
    Briefcase,
    UserCheck,
    Calendar,
    IndianRupee,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const HR = () => {
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('employees');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        designation: '',
        email: '',
        phone: '',
        salary: 0,
        employee: '',
        month: 'January',
        year: '2026',
        allowance: 0,
        deduction: 0
    });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empRes, payRes] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/hr/payroll')
            ]);
            setEmployees(empRes.data);
            setPayrolls(payRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/employees', {
                employeeId: formData.employeeId,
                name: formData.name,
                designation: formData.designation,
                email: formData.email,
                phone: formData.phone,
                salary: formData.salary
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handlePayrollSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/payroll', {
                employee: formData.employee,
                month: formData.month,
                year: formData.year,
                allowance: formData.allowance,
                deduction: formData.deduction
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing salary');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Human Resources</h1>
                    <p className="text-slate-500">Manage workforce, payroll, and employee designations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20"
                >
                    <Plus size={20} />
                    <span>{activeTab === 'employees' ? 'Add Employee' : 'Process Salary'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
                        <h3 className="text-2xl font-black text-slate-900">{employees.length} Members</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll</p>
                        <h3 className="text-2xl font-black text-slate-900">{payrolls.filter(p => p.month === 'January').length} Paid</h3>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl flex items-center space-x-4 shadow-xl">
                    <div className="p-4 bg-primary-500/20 text-primary-400 rounded-2xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Wage Bill</p>
                        <h3 className="text-2xl font-black text-white">₹{payrolls.reduce((acc, p) => acc + p.netSalary, 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'employees' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'payroll' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Payroll History
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'employees' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {employees.map(emp => (
                                <div key={emp._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary-200 transition-all">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-300 group-hover:text-primary-500 shadow-sm border border-slate-100">
                                        <Briefcase size={32} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">{emp.name}</h4>
                                    <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-4">{emp.designation}</p>
                                    <div className="space-y-2 mb-6">
                                        <p className="text-xs text-slate-400 font-bold flex items-center"><Clock size={12} className="mr-2" /> ID: {emp.employeeId}</p>
                                        <p className="text-xs text-slate-400 font-bold flex items-center"><IndianRupee size={12} className="mr-2" /> Base: ₹{emp.salary.toLocaleString()}</p>
                                    </div>
                                    <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all">View Details</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Employee</th>
                                        <th className="px-6 py-4 text-left">Period</th>
                                        <th className="px-6 py-4 text-left">Base</th>
                                        <th className="px-6 py-4 text-left">Adjustment</th>
                                        <th className="px-6 py-4 text-right">Net Paid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payrolls.map(pay => (
                                        <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{pay.employee?.name}</p>
                                                <p className="text-xs text-slate-400 font-mono">{pay.employee?.employeeId}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-[10px] font-black uppercase">{pay.month} {pay.year}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-600">
                                                ₹{pay.basicSalary}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="text-emerald-500 font-bold">+{pay.allowance}</span> / <span className="text-rose-500 font-bold">-{pay.deduction}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <span className="font-black text-slate-900">₹{pay.netSalary.toFixed(2)}</span>
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                </div>
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">{activeTab === 'employees' ? 'Register New Workforce' : 'Run Payroll Disbursement'}</h3>

                        {activeTab === 'employees' ? (
                            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Staff ID</label>
                                        <input type="text" required value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" placeholder="EMP-1001" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Base Salary</label>
                                        <input type="number" required value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Full Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Designation</label>
                                    <input type="text" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" placeholder="Sales Executive" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Phone</label>
                                        <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all mt-4">Save Employee</button>
                            </form>
                        ) : (
                            <form onSubmit={handlePayrollSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Select Staff</label>
                                    <select required value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold">
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} (₹{emp.salary})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Period Month</label>
                                        <select value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold">
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Year</label>
                                        <input type="text" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Allowance (+)</label>
                                        <input type="number" value={formData.allowance} onChange={e => setFormData({ ...formData, allowance: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Deduction (-)</label>
                                        <input type="number" value={formData.allowance} onChange={e => setFormData({ ...formData, deduction: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none font-bold" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all mt-4">Confirm Payment</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default HR;
