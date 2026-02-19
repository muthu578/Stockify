import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
                        <ShoppingCart size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Stockify</h1>
                    <p className="text-slate-400 mt-2">Manage your supermarket efficiently</p>
                </div>

                <div className="dark-glass rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                                    placeholder="admin or cashier"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <span>Sign In</span>}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-500 text-xs">
                        <p>© 2026 Stockify Systems. Premium Edition.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
