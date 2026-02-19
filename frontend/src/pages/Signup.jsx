import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();

    // Default state: role is 'Cashier', agreeTerms is false
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Cashier',
        agreeTerms: false
    });

    const { signup, loading, error: authError } = useAuth(); // Get signup from context
    // Local error state for validation, authError for API errors
    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        if (!formData.agreeTerms) {
            setValidationError('You must agree to the Terms & Conditions');
            return;
        }

        try {
            // Map frontend fields to backend expectation:
            // fullName -> name, email -> username
            await signup({
                name: formData.fullName,
                username: formData.email,
                password: formData.password,
                role: formData.role
            });
            // Navigation handled in AuthContext or here if needed, 
            // but usually AuthContext redirects
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Hero/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-800 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white mb-8">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <ShoppingCart size={32} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Stockify</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Smart Inventory Management for Modern Supermarkets</h2>
                    <p className="text-emerald-100 text-lg mb-8">Streamline your billing, track sales in real-time, and manage inventory with ease.</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <CheckCircle className="text-emerald-400 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Fast Billing System</h3>
                                <p className="text-sm text-emerald-100">Checkout customers in seconds</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <CheckCircle className="text-emerald-400 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Real-time Analytics</h3>
                                <p className="text-sm text-emerald-100">Track sales and growth instantly</p>
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
                        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-2">Join Stockify to manage your store</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.role === 'Admin' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Admin"
                                            checked={formData.role === 'Admin'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="font-semibold text-sm">Admin</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.role === 'Cashier' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="Cashier"
                                            checked={formData.role === 'Cashier'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="font-semibold text-sm">Cashier</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                id="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-slate-600">
                                I agree to the <a href="#" className="text-emerald-600 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        {(validationError || authError) && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                {validationError || authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
