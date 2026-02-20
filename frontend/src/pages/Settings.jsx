import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Globe,
    FileText,
    Image as ImageIcon,
    Plus,
    Trash2,
    CheckCircle2,
    Layout as LayoutIcon,
    Cloud
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState({
        storeName: 'Stockify Supermarket',
        taxRate: 5,
        currencySymbol: '₹',
        autoBackup: true,
        gstns: [
            { id: 1, number: '27AAAAA0000A1Z5', state: 'Maharashtra', isDefault: true },
            { id: 2, number: '29BBBBB1111B2Z6', state: 'Karnataka', isDefault: false }
        ],
        selectedTemplate: 'Classic'
    });

    const handleSave = () => {
        addNotification('Configuration updated successfully!');
    };

    const templates = [
        { name: 'Classic', description: 'Clean and professional layout', color: 'bg-slate-100' },
        { name: 'Modern', description: 'Sleek design with accents', color: 'bg-primary-50' },
        { name: 'Minimal', description: 'Bare essentials for fast printing', color: 'bg-emerald-50' }
    ];

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="shrink-0">
                    <h1 className="text-4xl font-black text-secondary-900 flex items-center gap-4">
                        <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/20">
                            <SettingsIcon className="text-white" size={28} />
                        </div>
                        Settings
                    </h1>
                    <p className="text-secondary-500 font-medium">Enterprise-grade system configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'general', label: 'General Configuration', icon: SettingsIcon },
                        { id: 'taxation', label: 'Multi-GSTN & Tax', icon: Globe },
                        { id: 'templates', label: 'Invoice Templates', icon: FileText },
                        { id: 'branding', label: 'Store Branding', icon: ImageIcon },
                        { id: 'security', label: 'Security & Backup', icon: Shield }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                    : 'bg-white text-secondary-500 hover:bg-slate-50 border border-slate-100'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px]">
                        {activeTab === 'general' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-black text-secondary-900 mb-8 flex items-center gap-3">
                                    <LayoutIcon className="text-primary-500" />
                                    Global Preferences
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={config.storeName}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-secondary-900"
                                            onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Currency Symbol</label>
                                        <input
                                            type="text"
                                            value={config.currencySymbol}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-secondary-900"
                                            onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-500"><Cloud size={24} /></div>
                                        <div>
                                            <p className="font-black text-secondary-900 leading-none mb-1">Automated Cloud Backups</p>
                                            <p className="text-xs text-secondary-500">Securely store transaction data every 24 hours</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, autoBackup: !config.autoBackup })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${config.autoBackup ? 'bg-primary-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.autoBackup ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'taxation' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-secondary-900 flex items-center gap-3">
                                        <Globe className="text-primary-500" />
                                        Tax Compliance
                                    </h3>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold">
                                        <Plus size={14} /> Add GSTN
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {config.gstns.map(gstn => (
                                        <div key={gstn.id} className="p-6 border border-slate-100 bg-slate-50/30 rounded-3xl flex items-center justify-between group hover:border-primary-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${gstn.isDefault ? 'bg-primary-600 text-white' : 'bg-white text-secondary-300 shadow-sm'}`}>
                                                    <CheckCircle2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-secondary-900 leading-none mb-1">{gstn.number}</p>
                                                    <p className="text-xs text-secondary-500 font-bold uppercase tracking-widest">{gstn.state}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-2 text-secondary-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-black text-secondary-900 mb-8 flex items-center gap-3">
                                    <FileText className="text-primary-500" />
                                    Invoice Designer
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {templates.map(tmp => (
                                        <button
                                            key={tmp.name}
                                            onClick={() => setConfig({ ...config, selectedTemplate: tmp.name })}
                                            className={`p-6 rounded-[2rem] border-2 transition-all text-left ${config.selectedTemplate === tmp.name
                                                    ? 'border-primary-600 bg-primary-50/30'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-full aspect-[4/5] ${tmp.color} rounded-2xl mb-4 shadow-inner flex items-center justify-center`}>
                                                <FileText size={40} className="text-slate-300" />
                                            </div>
                                            <p className="font-black text-secondary-900 leading-none mb-1">{tmp.name}</p>
                                            <p className="text-xs text-secondary-500 font-medium">{tmp.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-black text-secondary-900 mb-8 flex items-center gap-3">
                                    <ImageIcon className="text-primary-500" />
                                    Branding Utilities
                                </h3>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center cursor-pointer hover:bg-slate-100 transition-all flex flex-col items-center">
                                    <div className="p-5 bg-white rounded-3xl shadow-sm text-secondary-300 mb-4"><ImageIcon size={48} /></div>
                                    <p className="font-black text-secondary-900 mb-1">Click to upload your logo</p>
                                    <p className="text-xs text-secondary-500">Supports PNG, JPG (Max 2MB). Transparent recommended.</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <button
                                onClick={handleSave}
                                className="px-10 py-4 bg-secondary-950 text-white font-black rounded-2xl hover:bg-secondary-800 shadow-xl shadow-secondary-950/20 transition-all active:scale-95"
                            >
                                Apply All Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
