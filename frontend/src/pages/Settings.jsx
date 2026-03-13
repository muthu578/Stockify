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
    Cloud,
    ChevronRight,
    Save,
    Bell,
    Smartphone,
    User,
    AppWindow,
    Database,
    Palette
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const Settings = () => {
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState({
        storeName: 'Stockify Global Enterprise',
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
        addNotification('System configuration synchronized across nodes', 'success');
    };

    const templates = [
        { name: 'Classic', description: 'Clean and professional layout', color: 'bg-slate-100', icon: FileText },
        { name: 'Modern', description: 'Sleek design with accents', color: 'bg-emerald-50', icon: LayoutIcon },
        { name: 'Minimal', description: 'Bare essentials for fast printing', color: 'bg-indigo-50', icon: Smartphone }
    ];

    const menuItems = [
        { id: 'general', label: 'Primary Core', icon: SettingsIcon, description: 'Store identity and basic protocol' },
        { id: 'taxation', label: 'Fiscal Compliance', icon: Globe, description: 'GSTN and tax grid management' },
        { id: 'templates', label: 'Asset Designer', icon: Palette, description: 'Invoice and report visuals' },
        { id: 'branding', label: 'Visual Identity', icon: ImageIcon, description: 'Logos and corporate styling' },
        { id: 'security', label: 'Protocol Defense', icon: Shield, description: 'Backups and access security' }
    ];

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>Configuration</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Database size={12} />
                            Global Registry
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">System Core</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Architecting <span className="text-slate-900 font-bold">Enterprise-wide</span> logic and visual standards.</p>
                </div>
                <Button 
                    variant="primary" 
                    size="lg"
                    icon={Save}
                    onClick={handleSave}
                >
                    Commit Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-3">
                    {menuItems.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group text-left p-5 rounded-[1.5rem] transition-all duration-300 border-2 ${activeTab === tab.id
                                    ? 'border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-500/10'
                                    : 'border-transparent bg-white hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                                    <tab.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-black uppercase tracking-tight leading-none mb-1 ${activeTab === tab.id ? 'text-emerald-900' : 'text-slate-900'}`}>{tab.label}</p>
                                    <p className={`text-[10px] font-bold truncate ${activeTab === tab.id ? 'text-emerald-600/60' : 'text-slate-400'}`}>{tab.description}</p>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={16} className="text-emerald-600" />}
                            </div>
                        </button>
                    ))}

                    <Card className="mt-8 bg-slate-900 text-white border-transparent" padding="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                                <Shield size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Enterprise Mode</span>
                        </div>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                            System is operating under high-security governance protocols. All configuration mutations are logged.
                        </p>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <Card padding="p-0" className="min-h-[600px] overflow-hidden">
                        <div className="p-10">
                            {activeTab === 'general' && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                            <SettingsIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Scale</h3>
                                            <p className="text-slate-500 font-medium text-sm">Managing core store identifiers and operational logic.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <Input 
                                            label="Store Legal Label"
                                            value={config.storeName}
                                            icon={AppWindow}
                                            onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                                        />
                                        <Input 
                                            label="Currency Standard"
                                            value={config.currencySymbol}
                                            icon={IndianRupee}
                                            onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                                        />
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between group">
                                        <div className="flex items-center gap-6 mb-6 md:mb-0">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-900/5 flex items-center justify-center text-emerald-600 border border-slate-100 group-hover:scale-110 transition-transform">
                                                <Cloud size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg leading-none mb-2">Automated Vault Backup</p>
                                                <p className="text-slate-500 font-medium text-sm max-w-sm">End-to-end encrypted daily synchronization of your entire ledger state to our secure cloud nodes.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConfig({ ...config, autoBackup: !config.autoBackup })}
                                            className={`w-20 h-10 rounded-full transition-all relative ${config.autoBackup ? 'bg-emerald-600' : 'bg-slate-200 shadow-inner'}`}
                                        >
                                            <div className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg transition-all ${config.autoBackup ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'taxation' && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                     <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fiscal Nodes</h3>
                                                <p className="text-slate-500 font-medium text-sm">Managing multi-state GSTN and taxation compliance cards.</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" size="sm" icon={Plus}>Add GSTN Protocol</Button>
                                    </div>

                                    <div className="space-y-4">
                                        {config.gstns.map(gstn => (
                                            <div key={gstn.id} className="p-8 border-2 border-slate-50 bg-slate-50/20 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/20 hover:bg-emerald-50/10 transition-all duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${gstn.isDefault ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-300 shadow-sm border border-slate-100'}`}>
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-black text-slate-900 text-xl tracking-tight leading-none">{gstn.number}</p>
                                                            {gstn.isDefault && <Badge variant="primary" size="xs">Primary Node</Badge>}
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">{gstn.state} Jurisdiction</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button variant="ghost" size="sm" icon={Trash2} className="text-slate-300 hover:text-rose-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'templates' && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                            <Palette size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Interface Presets</h3>
                                            <p className="text-slate-500 font-medium text-sm">Selecting the visual language for your customer-facing assets.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {templates.map(tmp => (
                                            <button
                                                key={tmp.name}
                                                onClick={() => setConfig({ ...config, selectedTemplate: tmp.name })}
                                                className={`p-8 rounded-[2.5rem] border-4 transition-all text-left group ${config.selectedTemplate === tmp.name
                                                        ? 'border-emerald-600 bg-emerald-50 shadow-2xl shadow-emerald-500/10 scale-[1.05]'
                                                        : 'border-slate-50 hover:border-slate-100'
                                                    }`}
                                            >
                                                <div className={`w-full aspect-[4/5] ${tmp.color} rounded-3xl mb-6 shadow-xl shadow-slate-900/5 flex items-center justify-center group-hover:-rotate-3 transition-transform duration-500`}>
                                                    <tmp.icon size={48} className={config.selectedTemplate === tmp.name ? 'text-emerald-500' : 'text-slate-300'} />
                                                </div>
                                                <p className={`font-black tracking-tight leading-none mb-2 text-xl ${config.selectedTemplate === tmp.name ? 'text-emerald-900' : 'text-slate-900'}`}>{tmp.name}</p>
                                                <p className={`text-xs font-medium leading-relaxed ${config.selectedTemplate === tmp.name ? 'text-emerald-600' : 'text-slate-500'}`}>{tmp.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'branding' && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Assets</h3>
                                            <p className="text-slate-500 font-medium text-sm">Managing high-fidelity corporate brand materials.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-20 text-center cursor-pointer hover:bg-slate-100/50 hover:border-emerald-500/20 transition-all flex flex-col items-center group">
                                        <div className="p-8 bg-white rounded-[2rem] shadow-2xl shadow-slate-950/5 text-slate-200 mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                                            <ImageIcon size={64} />
                                        </div>
                                        <p className="font-black text-slate-900 text-2xl mb-2">Synchronize Corporate Logo</p>
                                        <p className="text-sm text-slate-400 font-medium max-w-xs">Upload ultra-high resolution vector or PNG. System will automatically scale for POS and Mobile.</p>
                                        <Button variant="secondary" className="mt-8 px-10">Select Identity File</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-10 py-8 bg-slate-950 flex items-center justify-between border-t border-slate-900">
                             <div className="flex items-center gap-4">
                                <Badge variant="primary" size="xs" dot className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Synced with Node_01</Badge>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Last change: {new Date().toLocaleTimeString()}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <Button variant="ghost" className="text-slate-500 hover:text-white transition-colors">Discard</Button>
                                <Button variant="primary" icon={CheckCircle2} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">Apply Protocol Amendments</Button>
                             </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
