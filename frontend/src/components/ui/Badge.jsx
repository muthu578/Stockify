import React from 'react';

const Badge = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '',
    dot = false
}) => {
    const variants = {
        primary: "bg-emerald-50 text-emerald-600 border-emerald-100",
        secondary: "bg-slate-50 text-slate-600 border-slate-200/60",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        danger: "bg-rose-50 text-rose-600 border-rose-100",
        info: "bg-sky-50 text-sky-600 border-sky-100",
        dark: "bg-slate-900 text-white border-slate-800",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-1 text-[10px]",
        lg: "px-3 py-1.5 text-xs",
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 font-black uppercase tracking-widest border rounded-full
            ${variants[variant]} 
            ${sizes[size]} 
            ${className}
        `}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'dark' ? 'bg-white' : 'bg-current'} animate-pulse`}></span>
            )}
            {children}
        </span>
    );
};

export default Badge;
