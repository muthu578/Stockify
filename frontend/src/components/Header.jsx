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

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { t, lang, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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

    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.length > 2) {
                try {
                    const { data } = await api.get(`/api/items?search=${searchQuery}&limit=5`);
                    setSearchResults(data.items || data);
                    setShowSearchDropdown(true);
                } catch (error) {
                    console.error('Search failed', error);
                }
            } else {
                setSearchResults([]);
                setShowSearchDropdown(false);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length > 2 && setShowSearchDropdown(true)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-2.5 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                    />
                    
                    {showSearchDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)}></div>
                            <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Top Inventory Matches</span>
                                    <button onClick={() => setShowSearchDropdown(false)}><X size={14} className="text-slate-400" /></button>
                                </div>
                                <div className="py-2">
                                    {searchResults.length > 0 ? searchResults.map(item => (
                                        <button 
                                            key={item._id}
                                            onClick={() => {
                                                navigate(`/inventory/product-master?search=${item.name}`);
                                                setShowSearchDropdown(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category} • Stock: {item.stock}</p>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="p-8 text-center text-slate-400 text-sm font-medium">No matches found for "{searchQuery}"</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
                        <Command size={10} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-1">
                    <button 
                        onClick={toggleLanguage}
                        className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group"
                    >
                        <Globe size={20} className={lang === 'fr' ? 'text-emerald-500' : ''} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-black text-white uppercase">{lang}</span>
                        </div>
                        <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50">{t('language')}</span>
                    </button>
                    <button 
                        onClick={toggleFullscreen}
                        className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group"
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50">{t('fullscreen')}</span>
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

                <Link to="/alerts" className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                    <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-1 shadow-lg pointer-events-none z-50 font-bold">{t('alerts')}</span>
                </Link>

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
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-slate-50 mb-2">
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
