import React, { useState, useEffect } from 'react';
import { Activity, Shield, Zap, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemStatus = () => {
    const [status, setStatus] = useState('Optimized');
    const [ping, setPing] = useState(24);

    useEffect(() => {
        const interval = setInterval(() => {
            setPing(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                const next = prev + change;
                return next < 15 ? 15 : next > 45 ? 45 : next;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:flex items-center gap-8 px-6 py-2 bg-slate-50/50 rounded-[1.5rem] border border-slate-200/60/50">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Activity size={16} className="text-emerald-500" />
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-500 rounded-full"
                    />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Core</p>
                    <p className="text-[11px] font-bold text-emerald-600 uppercase leading-none">{status}</p>
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-3">
                <Database size={16} className="text-indigo-500" />
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Latency</p>
                    <p className="text-[11px] font-bold text-indigo-600 uppercase leading-none">{ping}ms</p>
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-3">
                <Shield size={16} className="text-blue-500" />
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Security</p>
                    <p className="text-[11px] font-bold text-blue-600 uppercase leading-none">Encrypted</p>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
