import React, { useState } from 'react';
import { 
    Search, 
    Bell, 
    User, 
    Settings, 
    LogOut, 
    HelpCircle, 
    ChevronDown, 
    Maximize,
    Globe,
    Menu,
    Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    return (
        <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <Menu size={20} className="text-slate-600" />
                </button>

                <div className="relative group max-w-md w-full hidden md:block">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search products, orders, or suppliers... (Ctrl + K)"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-2.5 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
                        <Command size={10} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-1">
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
                        <Globe size={20} />
                        <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50">Language</span>
                    </button>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
                        <Maximize size={20} />
                        <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50">Fullscreen</span>
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                    <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50 font-bold">Alerts</span>
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all duration-300 ${showProfileDropdown ? 'bg-slate-100 shadow-inner' : 'hover:bg-slate-50'}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{user?.name}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">{user?.role}</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileDropdown && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowProfileDropdown(false)}
                            ></div>
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-50 animate-slide-in">
                                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                                    <p className="text-sm font-black text-slate-900">{user?.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">admin@stockify.com</p>
                                </div>
                                <div className="px-2 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1">
                                        <User size={18} />
                                        <span className="text-sm font-bold">My Profile</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1">
                                        <Settings size={18} />
                                        <span className="text-sm font-bold">Account Settings</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1">
                                        <HelpCircle size={18} />
                                        <span className="text-sm font-bold">Help Center</span>
                                    </button>
                                </div>
                                <div className="h-px bg-slate-50 my-2 mx-2"></div>
                                <div className="px-2">
                                    <button 
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
