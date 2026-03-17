import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, AlertTriangle, Package, ShoppingCart, Clock, Search, Filter } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const { addNotification } = useNotification();
    const { t } = useLanguage();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/alerts');
            setAlerts(data);
        } catch (error) {
            addNotification('Error loading alerts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/alerts/${id}/read`);
            setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
        } catch (error) {
            addNotification('Error updating alert', 'error');
        }
    };

    const deleteAlert = async (id) => {
        try {
            await api.delete(`/alerts/${id}`);
            setAlerts(alerts.filter(a => a._id !== id));
            addNotification('Alert dismissed', 'success');
        } catch (error) {
            addNotification('Error deleting alert', 'error');
        }
    };

    const filteredAlerts = alerts.filter(a => filter === 'All' || a.type === filter);

    const getIcon = (type) => {
        switch (type) {
            case 'Low Stock': return <Package size={18} />;
            case 'Order': return <ShoppingCart size={18} />;
            case 'Finance': return <AlertTriangle size={18} />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{t('alerts')}</h1>
                    <p className="text-slate-500 font-medium mt-3">Stay updated with system triggers and stock criticals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Order">Orders</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Synchronizing Alerts...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">All Clear!</h3>
                        <p className="text-slate-500 font-medium mt-2">No active alerts requiring your attention at this moment.</p>
                    </div>
                ) : (
                    filteredAlerts.map(alert => (
                        <div 
                            key={alert._id} 
                            className={`p-6 bg-white rounded-3xl border transition-all duration-300 flex items-center gap-6 group
                                ${alert.isRead ? 'border-slate-100 opacity-60' : 'border-emerald-500/20 bg-emerald-50/5 shadow-xl shadow-slate-900/5'}
                            `}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                ${alert.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                                  alert.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}
                            `}>
                                {getIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-black text-slate-900">{alert.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${alert.priority === 'High' ? 'bg-rose-500 text-white' : 
                                          alert.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}
                                    `}>
                                        {alert.priority}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm">{alert.description}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} />
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </div>
                                    <div className="h-4 w-[1px] bg-slate-200"></div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{alert.type}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                {!alert.isRead && (
                                    <button 
                                        onClick={() => markAsRead(alert._id)}
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                        title="Mark as Read"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => deleteAlert(alert._id)}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                    title="Dismiss"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default Alerts;
