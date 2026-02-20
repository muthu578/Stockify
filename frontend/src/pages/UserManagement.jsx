import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    Search,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'Cashier',
        status: 'Active'
    });
    const { addNotification } = useNotification();

    const rolePermissions = {
        Admin: ['Full System Access', 'Manage Users', 'Financial Reports', 'Settings'],
        Manager: ['Inventory Control', 'Purchase Orders', 'Basic Reports', 'Production'],
        Cashier: ['Billing/POS', 'Customer Search', 'Shortage Entry']
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            setShowModal(false);
            fetchUsers();
            setFormData({ name: '', username: '', password: '', role: 'Cashier' });
            addNotification('User account created successfully!');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Error creating user', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Delete this user account?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
                addNotification('User deleted successfully!', 'error');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Error deleting user', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <Users className="text-primary-500" />
                        User Management
                    </h1>
                    <p className="text-secondary-500">Manage system users and their roles</p>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20 shrink-0 text-sm"
                    >
                        <UserPlus size={18} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Username</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Last Login</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center animate-pulse">Loading users...</td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-semibold">{user.name}</td>
                                    <td className="px-6 py-4 text-secondary-500">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                                            user.role === 'Manager' ? 'bg-blue-100 text-blue-600' :
                                                'bg-primary-100 text-primary-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                            <span className="text-sm font-bold text-secondary-900">{user.status || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-secondary-400">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-secondary-900 mb-6">Create Account</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Role</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Cashier">Cashier</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-3">Permissions Preview</p>
                                <div className="flex flex-wrap gap-2">
                                    {(rolePermissions[formData.role] || []).map(p => (
                                        <span key={p} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-secondary-600">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-600/20"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserManagement;
