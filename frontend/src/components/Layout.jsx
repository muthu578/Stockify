import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';
import Breadcrumbs from './ui/Breadcrumbs';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 h-screen overflow-hidden font-sans relative">
            <div className="mesh-bg"></div>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className={`print:hidden fixed h-screen transition-all duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <Sidebar />
            </div>

            <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 lg:ml-64`}>
                <div className="print:hidden shrink-0">
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                </div>
                
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 print:p-0 no-scrollbar animate-slide-in">
                    <div className="max-w-[1600px] mx-auto">
                        <Breadcrumbs />
                        {children}
                    </div>
                    
                    <footer className="print:hidden mt-10 p-2 text-center border-t border-slate-200/60 bg-white/50 rounded-3xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            © 2026 Stockify Enterprise • <span className="text-emerald-500">v2.4.0</span>
                        </p>
                    </footer>
                </main>
            </div>

            <div className="print:hidden">
                <AIAssistant />
            </div>
        </div>
    );
};

export default Layout;
