import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (location.pathname === '/' || location.pathname === '/dashboard') {
        return null;
    }

    return (
        <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex mb-6" 
            aria-label="Breadcrumb"
        >
            <ol className="flex items-center space-x-2">
                <li>
                    <Link 
                        to="/dashboard" 
                        className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                        <Home size={14} className="mr-2" />
                        Dashboard
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                    return (
                        <li key={to} className="flex items-center">
                            <ChevronRight size={14} className="text-slate-300 mx-2" />
                            {last ? (
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                                    {name}
                                </span>
                            ) : (
                                <Link 
                                    to={to} 
                                    className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                                >
                                    {name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </motion.nav>
    );
};

export default Breadcrumbs;
