import React from 'react';
import Sidebar from './Sidebar';
import AIAssistant from './AIAssistant';

const Layout = ({ children }) => {
    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <AIAssistant />
        </div>
    );
};

export default Layout;
