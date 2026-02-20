import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'Cashier'
    });
    const { addNotification } = useNotification();

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

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">User Management</h1>
                <p className="text-secondary-500">Manage system users and their roles</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Users className="text-primary-500" size={20} />
                        <h3 className="text-lg font-bold">All Users</h3>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all text-sm font-semibold"
                    >
                        <UserPlus size={16} />
                        <span>Add New User</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Username</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center animate-pulse">Loading users...</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-semibold">{user.name}</td>
                                    <td className="px-6 py-4 text-secondary-500">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {user.role}
                                        </span>
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
                                    <option value="Admin">Admin</option>
                                </select>
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
