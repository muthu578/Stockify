import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    icon: Icon, 
    loading = false, 
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:-translate-y-0.5",
        secondary: "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5",
        outline: "bg-white border-2 border-slate-200/60 text-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        danger: "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-400 hover:-translate-y-0.5",
    };

    const sizes = {
        xs: "px-3 py-1.5 text-[10px] uppercase tracking-widest",
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        xl: "px-10 py-5 text-lg",
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    {Icon && <Icon size={size === 'xs' || size === 'sm' ? 14 : 18} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
