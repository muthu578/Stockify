import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    Lock,
    Database,
    Factory,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            roles: ['Admin', 'Cashier']
        },
        {
            name: 'Master Management',
            icon: Database,
            roles: ['Admin', 'Cashier'],
            subItems: [
                { name: 'Storage Location', path: '/masters/storage-location', roles: ['Admin'] },
                { name: 'Product Category', path: '/masters/product-category', roles: ['Admin'] },
                { name: 'User Management', path: '/masters/users', roles: ['Admin'] },
                { name: 'Customer Master', path: '/masters/customers', roles: ['Admin', 'Cashier'] },
                { name: 'Supplier Master', path: '/masters/suppliers', roles: ['Admin'] },
                { name: 'Settings', path: '/masters/settings', roles: ['Admin'] },
            ]
        },
        {
            name: 'Purchase Mgmt',
            icon: Download,
            roles: ['Admin'],
            subItems: [
                { name: 'PO Generation', path: '/purchases/po', roles: ['Admin'] },
                { name: 'GRN Entry', path: '/purchases/grn', roles: ['Admin'] },
            ]
        },
        {
            name: 'Inventory Mgmt',
            icon: Package,
            roles: ['Admin', 'Cashier'],
            subItems: [
                { name: 'Product Master', path: '/inventory/product-master', roles: ['Admin', 'Cashier'] },
                { name: 'Inventory Report', path: '/inventory/report', roles: ['Admin', 'Cashier'] },
                { name: 'Stock Transfer', path: '/inventory/stock-transfer', roles: ['Admin', 'Cashier'] },
            ]
        },
        {
            name: 'Production Mgmt',
            icon: Factory,
            roles: ['Admin'],
            subItems: [
                { name: 'Machine Master', path: '/production/machine-master', roles: ['Admin'] },
                { name: 'Production Details', path: '/production/details', roles: ['Admin'] },
            ]
        },
        {
            name: 'Sales Management',
            icon: ShoppingCart,
            roles: ['Admin', 'Cashier'],
            subItems: [
                { name: 'Performa Invoice', path: '/sales/performa-invoice', roles: ['Admin', 'Cashier'] },
                { name: 'Delivery Challan', path: '/sales/delivery-challan', roles: ['Admin', 'Cashier'] },
                { name: 'POS (Billing)', path: '/billing', roles: ['Admin', 'Cashier'] },
                { name: 'Sales Analytics', path: '/sales-analytics', roles: ['Admin'] },
            ]
        },
        {
            name: 'Reporting',
            icon: BarChart3,
            roles: ['Admin'],
            subItems: [
                { name: 'Daily Stocks', path: '/reporting/daily-stocks', roles: ['Admin'] },
                { name: 'Total Stock', path: '/reporting/total-stock', roles: ['Admin'] },
                { name: 'Batch-wise Report', path: '/reporting/batch-wise', roles: ['Admin'] },
            ]
        },
        { name: 'HR / Payroll', icon: Briefcase, path: '/hr', roles: ['Admin'] },
        { name: 'Finance', icon: Landmark, path: '/accounts', roles: ['Admin'] },
    ];

    const hasPermission = (roles) => {
        return roles.includes(user?.role);
    };

    return (
        <aside className="w-64 h-screen dark-glass text-white fixed left-0 top-0 flex flex-col z-50 border-r border-black/5 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center space-x-3 shrink-0">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                    <ShoppingCart size={20} className="text-primary-600" />
                </div>
                <div>
                    <span className="text-xl font-black tracking-tighter block leading-none text-white drop-shadow-md">Stockify</span>
                    <span className="text-[9px] font-black text-primary-200 uppercase tracking-[0.2em]">Enterprise</span>
                </div>
            </div>

            <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto no-scrollbar pb-20">
                {menuItems.map((item, index) => {
                    if (!hasPermission(item.roles)) return null;

                    if (item.subItems) {
                        const isActive = item.subItems.some(sub => location.pathname.startsWith(sub.path));
                        const isExpanded = expandedMenus[item.name] || isActive; // Auto-expand if active

                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 
                                        ${isActive ? 'bg-white/10 text-white' : 'text-primary-100 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon size={18} />
                                        <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                                    </div>
                                    {expandedMenus[item.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {expandedMenus[item.name] && (
                                    <div className="pl-4 space-y-1 animate-slide-in">
                                        {item.subItems.map(subItem => {
                                            if (!hasPermission(subItem.roles)) return null;
                                            return (
                                                <NavLink
                                                    key={subItem.name}
                                                    to={subItem.path}
                                                    className={({ isActive }) => `
                                                        block px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                                        ${isActive
                                                            ? 'bg-white text-primary-700 shadow-md font-bold'
                                                            : 'text-primary-200 hover:bg-white/10 hover:text-white'}
                                                    `}
                                                >
                                                    {subItem.name}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-white text-primary-700 shadow-xl shadow-black/10 font-bold'
                                    : 'text-primary-100 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            <item.icon size={18} />
                            <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-primary-700 shadow-md">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                            <p className="text-xs font-bold truncate text-white">{user?.name}</p>
                            <p className="text-[9px] text-primary-200 uppercase tracking-widest truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-white bg-red-500/80 hover:bg-red-600 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest shadow-lg"
                    >
                        <LogOut size={14} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
