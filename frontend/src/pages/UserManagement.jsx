import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    Search,
    Shield,
    Lock,
    Eye,
    EyeOff,
    MoreHorizontal,
    X,
    Activity,
    Clock,
    UserCheck,
    AlertCircle,
    ChevronRight,
    Key
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            addNotification('Security credentials provisioned successfully', 'success');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Access rejected by system', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('IRREVERSIBLE ACTION: Deauthorize this user and revoke all access?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
                addNotification('User identity purged from system', 'error');
            } catch (error) {
                addNotification(error.response?.data?.message || 'Authorization failure', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>Access Control</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Shield size={12} />
                            Governance Module
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Command Center</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Managing <span className="text-slate-900 font-bold">Identity and Access</span> protocols across enterprise nodes.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Input 
                            placeholder="Identify Personnel..." 
                            icon={Search}
                            containerClassName="min-w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="primary" 
                        size="lg"
                        icon={UserPlus}
                        onClick={() => setShowModal(true)}
                    >
                        Provision User
                    </Button>
                </div>
            </div>

            <Card className="mb-12 overflow-hidden border-transparent" padding="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Network Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Active</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center animate-pulse">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Identity Database...</p>
                                    </div>
                                </td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No personnel matched query</p>
                                </td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 leading-none">{user.name}</span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{user.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge 
                                            variant={user.role === 'Admin' ? 'primary' : user.role === 'Manager' ? 'secondary' : 'primary'} 
                                            className={user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : user.role === 'Manager' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-50 text-slate-600 border-slate-100'}
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Suspended' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{user.status || 'Verified'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs bg-slate-50/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Clock size={14} className="text-slate-300" />
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'PROTOCOL NEVER INITIALIZED'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button variant="ghost" size="sm" icon={Activity} className="h-10 w-10 p-0 text-slate-300 hover:text-slate-900" />
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                icon={Trash2} 
                                                className="h-10 w-10 p-0 text-slate-300 hover:text-rose-500"
                                                onClick={() => handleDeleteUser(user._id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)}></div>
                    <Card className="relative w-full max-w-xl bg-white shadow-2xl border-transparent animate-in zoom-in slide-in-from-bottom-20 duration-500 overflow-hidden flex flex-col" padding="p-0">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <Badge variant="primary" className="mb-2">Security Provisioning</Badge>
                                <CardTitle>Initialize Access Protocol</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </Button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-8">
                            <div className="space-y-6 mb-10">
                                <Input 
                                    label="Personnel Legal Name"
                                    placeholder="Enter full identity name..."
                                    icon={Users}
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="System Handle"
                                        placeholder="Enter username..."
                                        icon={UserCheck}
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                    <div className="flex flex-col gap-2 relative">
                                        <Input 
                                            label="Secret Cipher"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            icon={Lock}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 bottom-3.5 text-slate-300 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Shield size={12} /> Authorization Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Cashier', 'Manager', 'Admin'].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role })}
                                                className={`py-4 rounded-2xl border-2 font-black text-sm uppercase tracking-tighter transition-all ${
                                                    formData.role === role 
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Key size={12} /> Privilege Manifest
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(rolePermissions[formData.role] || []).map(p => (
                                            <Badge key={p} variant="primary" className="bg-white border-slate-200 text-slate-600 font-bold py-1.5 px-4 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                                <Button variant="ghost" onClick={() => setShowModal(false)} type="button">Decline</Button>
                                <Button variant="secondary" className="px-12" type="submit" icon={Lock}>Authorize Access</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </Layout>
    );
};

export default UserManagement;
