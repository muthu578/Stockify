import React from 'react';

const Input = ({ 
    label, 
    error, 
    icon: Icon, 
    className = '', 
    containerClassName = '',
    ...props 
}) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input 
                    className={`
                        w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 
                        ${Icon ? 'pl-12' : 'px-5'} pr-5
                        text-sm font-bold text-slate-900 outline-none
                        focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500
                        transition-all duration-300
                        ${error ? 'border-rose-500 ring-rose-500/10 animate-shake' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
