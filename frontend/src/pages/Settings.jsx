import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Shield
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
    const { addNotification } = useNotification();
    const [config, setConfig] = useState({
        taxRate: 5,
        currencySymbol: '₹'
    });

    const handleSave = () => {
        // Implement save logic later
        addNotification('Settings saved successfully!');
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
                        <SettingsIcon className="text-primary-500" />
                        Settings
                    </h1>
                    <p className="text-secondary-500">System configuration and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Config */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center">
                            <SettingsIcon className="mr-2 text-secondary-400" size={20} />
                            Billing Rules
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Default Tax Rate (%)</label>
                                <input
                                    type="number"
                                    value={config.taxRate}
                                    onChange={(e) => setConfig({ ...config, taxRate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Currency Symbol</label>
                                <input
                                    type="text"
                                    value={config.currencySymbol}
                                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none font-bold"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-secondary-950 text-white font-bold rounded-xl hover:bg-secondary-800 transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary-600 p-6 rounded-3xl text-white">
                        <h3 className="font-bold flex items-center mb-2">
                            <Shield size={18} className="mr-2" />
                            Store Security
                        </h3>
                        <p className="text-primary-100 text-xs leading-relaxed">
                            Auto-logout enabled after 30 minutes of inactivity. All transaction logs are immutable and stored for audit.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
