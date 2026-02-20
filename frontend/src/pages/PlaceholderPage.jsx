import React from 'react';
import Layout from '../components/Layout';

const PlaceholderPage = ({ title }) => {
    return (
        <Layout title={title}>
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="bg-slate-100 p-8 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" x2="12" y1="18" y2="12" />
                        <line x1="9" x2="15" y1="15" y2="15" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
                <p className="text-slate-500 max-w-md">
                    This module is currently under development. Detailed functionality for {title} will be available in the next update.
                </p>
            </div>
        </Layout>
    );
};

export default PlaceholderPage;
