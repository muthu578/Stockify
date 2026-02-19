import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    BarChart3,
    Settings,
    LogOut,
    ShoppingCart,
    Users,
    Truck,
    Download,
    Landmark,
    Briefcase,
    PieChart,
    Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Cashier'] },
        { name: 'POS (Sales)', icon: ShoppingCart, path: '/billing', roles: ['Admin', 'Cashier'] },
        { name: 'Products', icon: Package, path: '/inventory', roles: ['Admin', 'Cashier'] },
        { name: 'Purchases', icon: Download, path: '/purchases', roles: ['Admin'] },
        { name: 'Customers', icon: Users, path: '/customers', roles: ['Admin', 'Cashier'] },
        { name: 'Suppliers', icon: Truck, path: '/suppliers', roles: ['Admin'] },
        { name: 'HR / Payroll', icon: Briefcase, path: '/hr', roles: ['Admin'] },
        { name: 'Finance / Accounts', icon: Landmark, path: '/accounts', roles: ['Admin'] },
        { name: 'Business Reports', icon: BarChart3, path: '/reports', roles: ['Admin'] },
        { name: 'Sales Analytics', icon: PieChart, path: '/sales-analytics', roles: ['Admin'] },
        { name: 'Daily Register', icon: Lock, path: '/register', roles: ['Admin'] },
        { name: 'Settings', icon: Settings, path: '/settings', roles: ['Admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-64 h-screen dark-glass text-white fixed left-0 top-0 flex flex-col z-50 border-r border-black/5 shadow-2xl">
            <div className="p-8 border-b border-white/10 flex items-center space-x-3">
                <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-black/10">
                    <ShoppingCart size={24} className="text-primary-500" />
                </div>
                <div>
                    <span className="text-2xl font-black tracking-tighter block leading-none text-white drop-shadow-md">Stockify</span>
                    <span className="text-[10px] font-black text-primary-950 uppercase tracking-[0.2em]">Enterprise</span>
                </div>
            </div>

            <nav className="flex-1 mt-8 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {filteredMenu.map((item, index) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={({ isActive }) => `
                            flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 animate-slide-in
                            ${isActive
                                ? 'bg-white text-primary-600 shadow-xl shadow-black/10 font-black'
                                : 'text-primary-50 hover:bg-white/10 hover:text-white hover:translate-x-1'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={`${isActive ? 'text-primary-600' : 'text-primary-100 group-hover:text-white'}`} />
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6">
                <div className="bg-black/10 rounded-3xl p-5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sm font-black text-primary-600 shadow-md">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black truncate text-white">{user?.name}</p>
                            <p className="text-[10px] text-primary-950 font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white bg-accent-500 hover:bg-accent-600 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
