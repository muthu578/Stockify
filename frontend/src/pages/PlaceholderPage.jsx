import React from 'react';
import { Construction, Search } from 'lucide-react';
import Layout from '../components/Layout';

const PlaceholderPage = ({ title }) => {
    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <Construction className="text-primary-500" />
                        {title}
                    </h1>
                    <p className="text-secondary-500">Manage your {title.toLowerCase()} data</p>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xl ml-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm font-medium"
                            disabled
                        />
                    </div>
                    <button
                        disabled
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600/50 text-white rounded-xl font-bold shrink-0 text-sm cursor-not-allowed"
                    >
                        <span>+ Add New</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-6 rounded-3xl mb-6">
                    <Construction size={48} className="text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
                <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                    The <span className="font-semibold text-primary-600">{title}</span> module is currently under development.
                    Full functionality will be available in the next update.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    In Development
                </div>
            </div>
        </Layout>
    );
};

export default PlaceholderPage;
