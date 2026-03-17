import React from 'react';
import { ShoppingCart } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = true }) => {
    return (
        <div className={`
            ${fullScreen ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090b14]/80 backdrop-blur-md' : 'flex flex-col items-center justify-center p-10'}
            transition-all duration-300 animate-in fade-in
        `}>
            <div className="relative">
                {/* Main Spinner Ring */}
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                
                {/* Center Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-2xl shadow-emerald-500/40">
                        <ShoppingCart size={24} className="text-white" />
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <h2 className="text-xl font-black text-white tracking-tight">Stockify</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] opacity-80">
                        Processing Enterprise Data
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
