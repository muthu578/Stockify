import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Bell, 
    User, 
    Settings, 
    LogOut, 
    HelpCircle, 
    ChevronDown, 
    Maximize,
    Minimize,
    Globe,
    Menu,
    Command,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SystemStatus from './SystemStatus';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { t, lang, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };


    return (
        <header className="h-20 bg-white/95 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <Menu size={20} className="text-slate-600" />
                </button>
                <div className="ml-4 flex-1">
                    <SystemStatus />
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Language and Fullscreen Group */}
                <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200/60 rounded-2xl p-1 gap-1">
                    <button 
                        onClick={toggleLanguage}
                        className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all relative group"
                    >
                        <Globe size={20} className={lang === 'fr' ? 'text-emerald-500' : ''} />
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-[7px] font-black text-white uppercase">{lang}</span>
                        </div>
                    </button>
                    <button 
                        onClick={toggleFullscreen}
                        className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all relative group"
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                {/* Notifications */}
                <Link to="/alerts" className="p-3 bg-slate-50 border border-slate-200/60 text-slate-500 hover:bg-white hover:shadow-sm rounded-2xl transition-all relative group">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                </Link>

                {/* Vertical Separator */}
                <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                {/* User Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className={`flex items-center gap-3 p-1 rounded-2xl transition-all duration-300 ${showProfileDropdown ? 'ring-2 ring-emerald-500/20' : 'hover:bg-slate-50'}`}
                    >
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                           <span className="relative z-10 text-lg uppercase">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">ADMIN</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ml-1 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileDropdown && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowProfileDropdown(false)}
                            ></div>
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-200/60 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-slate-200/60 mb-2">
                                    <p className="text-sm font-black text-slate-900">{user?.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">{user?.username}@stockify.com</p>
                                </div>
                                <div className="px-2 space-y-1">
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setShowProfileDropdown(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1"
                                    >
                                        <User size={18} />
                                        <span className="text-sm font-bold">{t('profile')}</span>
                                    </Link>
                                    <Link 
                                        to="/account-settings" 
                                        onClick={() => setShowProfileDropdown(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1"
                                    >
                                        <Settings size={18} />
                                        <span className="text-sm font-bold">{t('settings')}</span>
                                    </Link>
                                    <Link 
                                        to="/help" 
                                        onClick={() => setShowProfileDropdown(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all hover:translate-x-1"
                                    >
                                        <HelpCircle size={18} />
                                        <span className="text-sm font-bold">{t('help')}</span>
                                    </Link>
                                </div>
                                <div className="h-px bg-slate-50 my-2 mx-2"></div>
                                <div className="px-2">
                                    <button 
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm">{t('logout')}</span>
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
