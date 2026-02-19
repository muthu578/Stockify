import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`
                            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-in
                            ${n.type === 'success' ? 'bg-emerald-600 text-white' :
                                n.type === 'error' ? 'bg-rose-600 text-white' :
                                    'bg-slate-900 text-white'}
                        `}
                    >
                        {n.type === 'success' && <CheckCircle size={20} />}
                        {n.type === 'error' && <AlertCircle size={20} />}
                        {n.type === 'info' && <Info size={20} />}
                        <span className="font-bold text-sm tracking-wide">{n.message}</span>
                        <button onClick={() => removeNotification(n.id)} className="ml-2 hover:opacity-70">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
