import React, { useState, useEffect } from 'react';
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
    ChevronRight,
    Zap,
    Layout as LayoutIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Auto-expand the parent menu when a child route is active
    useEffect(() => {
        const pathToMenu = {
            '/masters': 'Administration',
            '/purchases': 'Procurement',
            '/inventory': 'Stock Control',
            '/production': 'Manufacturing',
            '/sales': 'Revenue & Billing',
            '/billing': 'Revenue & Billing',
            '/sales-analytics': 'Revenue & Billing',
            '/reporting': 'Analytics',
        };

        for (const [prefix, menuName] of Object.entries(pathToMenu)) {
            if (location.pathname.startsWith(prefix)) {
                setExpandedMenus(prev => ({ ...prev, [menuName]: true }));
                break;
            }
        }
    }, [location.pathname]);

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const modules = [
        {
            group: 'Core Operations',
            items: [
                {
                    name: t('dashboard'),
                    icon: LayoutDashboard,
                    path: '/dashboard',
                    roles: ['Admin', 'Manager', 'Cashier']
                },
                {
                    name: t('billing'),
                    icon: ShoppingCart,
                    roles: ['Admin', 'Manager', 'Cashier'],
                    subItems: [
                        { name: t('pos'), path: '/billing', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('performa'), path: '/sales/performa-invoice', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('challan'), path: '/sales/delivery-challan', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('notes'), path: '/sales/notes', roles: ['Admin', 'Manager'] },
                        { name: t('insights'), path: '/sales-analytics', roles: ['Admin', 'Manager'] },
                    ]
                },
            ]
        },
        {
            group: 'Supply Chain',
            items: [
                {
                    name: t('procurement'),
                    icon: Download,
                    roles: ['Admin', 'Manager'],
                    subItems: [
                        { name: t('po_gen'), path: '/purchases/po', roles: ['Admin', 'Manager'] },
                        { name: t('grn'), path: '/purchases/grn', roles: ['Admin', 'Manager'] },
                    ]
                },
                {
                    name: t('inventory'),
                    icon: Package,
                    roles: ['Admin', 'Manager', 'Cashier'],
                    subItems: [
                        { name: t('product_master'), path: '/inventory/product-master', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('live_inventory'), path: '/inventory/report', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('transfer'), path: '/inventory/stock-transfer', roles: ['Admin', 'Manager', 'Cashier'] },
                    ]
                },
                {
                    name: t('manufacturing'),
                    icon: Factory,
                    roles: ['Admin', 'Manager'],
                    subItems: [
                        { name: t('machines'), path: '/production/machine-master', roles: ['Admin', 'Manager'] },
                        { name: t('production_flow'), path: '/production/details', roles: ['Admin', 'Manager'] },
                    ]
                },
            ]
        },
        {
            group: 'Reporting & Analytics',
            items: [
                {
                    name: t('reports'),
                    icon: BarChart3,
                    roles: ['Admin', 'Manager'],
                    subItems: [
                        { name: t('exec_report'), path: '/reports', roles: ['Admin', 'Manager'] },
                        { name: t('daily_snap'), path: '/reporting/daily-stocks', roles: ['Admin', 'Manager'] },
                        { name: t('valuation'), path: '/reporting/total-stock', roles: ['Admin', 'Manager'] },
                        { name: t('batch_track'), path: '/reporting/batch-wise', roles: ['Admin', 'Manager'] },
                    ]
                },
            ]
        },
        {
            group: 'Enterprise',
            items: [
                {
                    name: t('administration'),
                    icon: Database,
                    roles: ['Admin', 'Manager', 'Cashier'],
                    subItems: [
                        { name: t('storage'), path: '/masters/storage-location', roles: ['Admin', 'Manager'] },
                        { name: t('categories'), path: '/masters/product-category', roles: ['Admin', 'Manager'] },
                        { name: t('users'), path: '/masters/users', roles: ['Admin'] },
                        { name: t('customers'), path: '/masters/customers', roles: ['Admin', 'Manager', 'Cashier'] },
                        { name: t('vendors'), path: '/masters/suppliers', roles: ['Admin', 'Manager'] },
                        { name: t('app_settings'), path: '/masters/settings', roles: ['Admin'] },
                    ]
                },
                { name: t('hr_payroll'), icon: Briefcase, path: '/hr', roles: ['Admin', 'Manager'] },
                { name: t('financials'), icon: Landmark, path: '/accounts', roles: ['Admin', 'Manager'] },
            ]
        }
    ];

    const hasPermission = (roles) => {
        return roles.includes(user?.role);
    };

    return (
        <aside className="w-64 h-screen flex flex-col z-50 bg-[#090b14] border-r border-white/5 shadow-2xl overflow-hidden font-sans">
            <div className="p-8 flex items-center gap-5 shrink-0 transition-all duration-500 group/logo cursor-pointer hover:translate-x-1">
                <div className="p-3.5 bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl shadow-emerald-500/30 relative overflow-hidden ring-4 ring-white/5 group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                    <Zap size={26} className="text-white relative z-10 fill-white/20" />
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/logo:translate-x-0 transition-transform duration-700 skew-x-12"></div>
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-white leading-none flex items-center gap-1">
                        STOCKIFY<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h1>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2.5 group-hover/logo:text-emerald-400 transition-colors duration-500">Neural Commerce</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar min-h-0 pb-8 custom-scrollbar">
                {modules.map((module, mIdx) => (
                    <div key={mIdx} className="space-y-3">
                        <div className="px-4 flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{module.group}</span>
                            <div className="h-px bg-slate-800/50 flex-1"></div>
                        </div>
                        
                        <div className="space-y-1">
                            {module.items.map((item, index) => {
                                if (!hasPermission(item.roles || [])) return null;

                                if (item.subItems) {
                                    const isActive = item.subItems.some(sub => location.pathname.startsWith(sub.path));
                                    const isExpanded = expandedMenus[item.name] || isActive;

                                    return (
                                        <div key={item.name} className="space-y-1">
                                            <button
                                                onClick={() => toggleMenu(item.name)}
                                                className={`w-full group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 relative
                                                    ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <div className="flex items-center space-x-3 relative z-10">
                                                    <item.icon size={20} className={`${isActive ? 'text-emerald-500' : 'group-hover:text-emerald-500 transition-colors'}`} />
                                                    <span className="text-sm font-bold tracking-wide">{item.name}</span>
                                                </div>
                                                <ChevronDown size={14} className={`transition-transform duration-300 relative z-10 ${isExpanded ? 'rotate-180' : '-rotate-90'}`} />
                                            </button>

                                            {isExpanded && (
                                                <div className="pl-6 space-y-1 border-l-2 border-slate-800/50 ml-6 mt-1 animate-slide-in">
                                                    {item.subItems.map(subItem => {
                                                        if (!hasPermission(subItem.roles)) return null;
                                                        const isSubActive = location.pathname === subItem.path;
                                                        return (
                                                            <NavLink
                                                                key={subItem.name}
                                                                to={subItem.path}
                                                                className={`
                                                                    block px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative group
                                                                    ${isSubActive
                                                                        ? 'text-white'
                                                                        : 'text-slate-500 hover:text-white hover:pl-5'}
                                                                `}
                                                            >
                                                                {isSubActive && <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-[2px] bg-emerald-500 rounded-full"></div>}
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
                                            flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                                            ${isActive
                                                ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                        `}
                                    >
                                        <item.icon size={20} className={`${location.pathname === item.path ? 'text-white' : 'group-hover:text-emerald-500 transition-colors'}`} />
                                        <span className="text-sm font-bold tracking-wide">{item.name}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
