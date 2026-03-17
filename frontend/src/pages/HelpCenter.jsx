import React from 'react';
import { HelpCircle, Search, MessageSquare, BookOpen, Video, FileText, ChevronRight, Play, ExternalLink, LifeBuoy } from 'lucide-react';
import Layout from '../components/Layout';

const HelpCenter = () => {
    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 py-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
                        <LifeBuoy size={14} /> Global Support Node
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-8">How can we assist?</h1>
                    
                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
                        <input 
                            type="text" 
                            placeholder="Search tutorials, protocols, or common issues..."
                            className="w-full bg-white border-2 border-slate-200/60 rounded-[2.5rem] pl-16 pr-8 py-6 text-lg font-bold outline-none shadow-2xl shadow-slate-900/5 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-900/5 hover:border-emerald-500/20 transition-all group">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Knowledge Base</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Detailed technical documentation of every module and feature.</p>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-all">Explore Docs <ChevronRight size={14} /></button>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-900/5 hover:border-emerald-500/20 transition-all group">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Video size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Video Tutorials</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Visual walkthroughs for rapid deployment and training of staff.</p>
                        <button className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-all">Watch Now <ChevronRight size={14} /></button>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-900/5 hover:border-emerald-500/20 transition-all group">
                        <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Community Hub</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Connect with other enterprise users and share best practices.</p>
                        <button className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-all">Join Discord <ChevronRight size={14} /></button>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black tracking-tight mb-4">Still facing complications?</h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">Our secondary support team is available 24/7 for critical enterprise-tier resolution.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-500 hover:text-white transition-all">Open Support Ticket</button>
                            <button className="p-5 border-2 border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all"><ExternalLink size={24} /></button>
                        </div>
                    </div>
                </div>

                <div className="py-20">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-12">Frequently Audited Queries</h3>
                    <div className="space-y-4">
                        {[
                            { q: "How do I synchronize multi-location inventory?", a: "Navigate to Stock Control > Stock Transfer and initiate a global sync protocol." },
                            { q: "Can I automate purchase order generation?", a: "Yes, define reorder points in Product Master and enable 'Auto-Procure' in Settings." },
                            { q: "Is our payroll data encrypted in transit?", a: "Absolutely. All enterprise nodes use AES-256 GCM encryption for every data flow." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 hover:border-emerald-500/10 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{faq.q}</p>
                                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-all" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HelpCenter;
