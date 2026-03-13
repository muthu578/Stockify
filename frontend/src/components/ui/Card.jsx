import React from 'react';

const Card = ({ 
    children, 
    className = '', 
    padding = 'p-6 md:p-8',
    hover = true,
    animate = true,
    glass = false
}) => {
    return (
        <div className={`
            ${glass ? 'glass' : 'bg-white'} 
            rounded-[2.5rem] border border-slate-100 
            ${hover ? 'hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500' : ''} 
            ${animate ? 'animate-slide-in' : ''} 
            ${padding} 
            ${className}
        `}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-6 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-xl font-black text-slate-900 ${className}`}>
        {children}
    </h3>
);

export const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm font-medium text-slate-400 mt-1 ${className}`}>
        {children}
    </p>
);

export default Card;
