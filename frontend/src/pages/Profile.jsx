import React from 'react';
import { User, Mail, Shield, MapPin, Phone, Edit3, Camera, Layout as LayoutIcon, Globe, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="relative mb-32">
                    <div className="h-64 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-900 rounded-[3rem] shadow-2xl"></div>
                    <div className="absolute -bottom-20 left-12 flex items-end gap-8">
                        <div className="relative group">
                            <div className="w-44 h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-6xl font-black">
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>
                            <button className="absolute bottom-4 right-4 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 transition-all">
                                <Camera size={20} />
                            </button>
                        </div>
                        <div className="pb-4">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">{user?.name}</h1>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{user?.role}</span>
                                <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <MapPin size={12} />
                                    Main Headquarters
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Credentials</h3>
                                <button className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:translate-x-1 transition-all">
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Identity</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-bold">
                                        <User size={18} className="text-slate-300" />
                                        {user?.name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relay Email</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-bold">
                                        <Mail size={18} className="text-slate-300" />
                                        {user?.username}@stockify.com
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telecom Line</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-bold">
                                        <Phone size={18} className="text-slate-300" />
                                        +91 98765-43210
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Language</label>
                                    <div className="flex items-center gap-3 text-slate-700 font-bold">
                                        <Globe size={18} className="text-slate-300" />
                                        English (US)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">System Access Logs</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-200/60 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Authenticated Session</p>
                                                <p className="text-[10px] text-slate-400 font-bold">MacBook Pro • Mumbai, IN</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 hours ago</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                           <Shield className="text-emerald-500 mb-6" size={40} />
                           <h4 className="text-xl font-black tracking-tight mb-3">Security Level</h4>
                           <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">Your account is secured with Enterprise-grade multi-layer synchronization.</p>
                           <div className="space-y-4">
                               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                   <span>Protocols Status</span>
                                   <span className="text-emerald-500">Active</span>
                               </div>
                               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="w-[85%] h-full bg-emerald-500"></div>
                               </div>
                           </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-xl shadow-slate-900/5">
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                 <LayoutIcon size={16} className="text-emerald-500" /> System Preferences
                             </h4>
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                     <span className="text-xs font-bold text-slate-600">Dark Mode Protocol</span>
                                     <div className="w-10 h-5 bg-slate-100 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white shadow-sm rounded-full"></div></div>
                                 </div>
                                 <div className="flex items-center justify-between">
                                     <span className="text-xs font-bold text-slate-600">Sync Inventory on Login</span>
                                     <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white shadow-sm rounded-full"></div></div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
