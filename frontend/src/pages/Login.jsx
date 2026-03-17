import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, User, Lock, Loader2, ArrowRight, CheckCircle, Zap, BadgePercent } from 'lucide-react';
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
        <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Left Side - Hero/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-subtle"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-subtle"></div>
                
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534452207293-19443cfa5d73?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-transparent to-black/70"></div>

                <div className="relative z-10 animate-slide-in">
                    <div className="flex items-center gap-4 mb-12 group/logo cursor-pointer">
                        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                            <Zap size={38} className="text-white fill-white/10" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-300">STOCKIFY<span className="text-emerald-400">.</span></h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-5xl font-black mb-6 leading-[1.1] animate-slide-in [animation-delay:100ms] text-white">
                        Management <br /> 
                        <span className="text-emerald-400">Simplified.</span>
                    </h2>
                    <p className="text-emerald-50/80 text-xl mb-12 leading-relaxed animate-slide-in [animation-delay:200ms]">
                        Join thousands of smart retailers who trust Stockify to power their daily operations.
                    </p>

                    <div className="space-y-5 animate-slide-in [animation-delay:300ms]">
                        <div className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-default">
                            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <BadgePercent className="text-emerald-300 shrink-0" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Dynamic Dashboards</h3>
                                <p className="text-sm text-emerald-100/60">Real-time insights at your fingertips</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-default">
                            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <ShoppingCart className="text-emerald-300 shrink-0" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Smart Inventory</h3>
                                <p className="text-sm text-emerald-100/60">Automated stock tracking & alerts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-default">
                            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <CheckCircle className="text-emerald-300 shrink-0" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Secure Access</h3>
                                <p className="text-sm text-emerald-100/60">Enterprise-grade security protocols</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm font-medium text-emerald-100/40 flex justify-between items-center animate-slide-in [animation-delay:400ms]">
                    <span>© 2026 Stockify Systems</span>
                    <div className="flex gap-4">
                        <span className="hover:text-white cursor-pointer transition-colors">Support</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-slate-50/30">
                <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[2.5rem] lg:shadow-2xl lg:shadow-emerald-900/5 border border-slate-200/60 animate-slide-in">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 mt-3 font-medium">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username / Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200/60 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                                        placeholder="admin@stockify.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-sm font-bold text-slate-700">Password</label>
                                    <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot Password?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200/60 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Login Role</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'Admin' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-4 ring-emerald-500/5' : 'border-slate-200/60 hover:border-slate-200 bg-slate-50/50'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Admin"
                                            checked={role === 'Admin'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="hidden"
                                        />
                                        <User size={24} className={role === 'Admin' ? 'text-emerald-600' : 'text-slate-400'} />
                                        <span className="font-bold text-sm">Administrator</span>
                                    </label>
                                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'Cashier' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-4 ring-emerald-500/5' : 'border-slate-200/60 hover:border-slate-200 bg-slate-50/50'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Cashier"
                                            checked={role === 'Cashier'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="hidden"
                                        />
                                        <ShoppingCart size={24} className={role === 'Cashier' ? 'text-emerald-600' : 'text-slate-400'} />
                                        <span className="font-bold text-sm">Cashier / Staff</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center px-1">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <div className={`w-5 h-5 border-2 rounded-md transition-all ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300 group-hover:border-emerald-500'}`}>
                                        {rememberMe && <CheckCircle size={14} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </div>
                                </div>
                                <span className="ml-3 text-sm font-semibold text-slate-600">Keep me logged in</span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                </div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-[0.98] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10">{loading ? 'Processing...' : 'Sign In to Dashboard'}</span>
                            {loading ? <Loader2 className="animate-spin relative z-10" size={20} /> : <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Don't have an account yet?{' '}
                            <Link to="/signup" className="text-emerald-600 font-black hover:text-emerald-700 underline underline-offset-4 decoration-2 decoration-emerald-500/20 hover:decoration-emerald-500 transition-all">
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
