import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, User, Lock, Loader2, ArrowRight, CheckCircle, Store, BadgePercent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Cashier'); // Default role
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password, role); // Passing role if backend supports it
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Hero/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-800 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white mb-8">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <Store size={32} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Stockify</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome Back!</h2>
                    <p className="text-emerald-100 text-lg mb-8">Log in to manage your inventory, track sales, and handle billing efficiently.</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <BadgePercent className="text-emerald-400 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Sales Dashboard</h3>
                                <p className="text-sm text-emerald-100">View daily earnings and trends</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <ShoppingCart className="text-emerald-400 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Inventory Tracking</h3>
                                <p className="text-sm text-emerald-100">Real-time stock updates</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-emerald-200">
                    © 2026 Stockify Systems. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
                        <p className="text-slate-500 mt-2">Access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username / Email</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Login As</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${role === 'Admin' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Admin"
                                            checked={role === 'Admin'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'Admin' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                            {role === 'Admin' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                        </div>
                                        <span className="font-semibold text-sm">Admin</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${role === 'Cashier' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Cashier"
                                            checked={role === 'Cashier'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === 'Cashier' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                            {role === 'Cashier' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                        </div>
                                        <span className="font-semibold text-sm">Cashier</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-600 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-emerald-600 font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
