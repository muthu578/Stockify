import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Zap, Target, Package } from 'lucide-react';
import api from '../services/api';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Stockify AI. How can I help you optimize your business today?', type: 'text' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [stats, setStats] = useState({ lowStock: 0, totalItems: 0 });
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const { data } = await api.get('/items');
            const low = data.filter(i => i.stock < 10).length;
            setStats({ lowStock: low, totalItems: data.length });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        // Simulate AI Logic
        setTimeout(() => {
            let response = "";
            const lowerMsg = userMessage.toLowerCase();

            if (lowerMsg.includes('stock') || lowerMsg.includes('inventory')) {
                response = `I've checked your inventory. We have ${stats.lowStock} items running low on stock out of ${stats.totalItems} total products. I recommend restocking soon.`;
            } else if (lowerMsg.includes('sales') || lowerMsg.includes('revenue')) {
                response = "Your revenue is up by 12% compared to last week! The peak sales time today was between 11 AM and 1 PM.";
            } else if (lowerMsg.includes('help') || lowerMsg.includes('how')) {
                response = "You can manage inventory in the Products tab, view daily cash flow in the Register, or check your performance in Sales Analytics.";
            } else {
                response = "That's an interesting question. As your smart assistant, I'm constantly learning from your data to give you better insights. Would you like to see your top-selling items instead?";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-24 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-transparent"></div>
                    <Bot size={32} className="relative z-10 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </button>
            )}

            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] h-[600px] dark-glass rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col z-[100] border border-white/20 animate-slide-in overflow-hidden">
                    {/* Header */}
                    <div className="p-6 bg-primary-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm tracking-wide">STOCKIFY AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-primary-100 uppercase tracking-widest">Online & Thinking</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-[85%] p-4 rounded-2xl relative
                                    ${m.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-600/20'
                                        : 'bg-white/10 text-white rounded-tl-none border border-white/10 backdrop-blur-sm'}
                                `}>
                                    <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                    <span className="text-[9px] mt-2 block opacity-50 font-bold uppercase tracking-wider">
                                        {m.role === 'assistant' ? 'AI Agent' : 'You'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2">
                        {['Check Inventory', 'Sales Report', 'Daily Goal'].map(s => (
                            <button
                                key={s}
                                onClick={() => setInput(s)}
                                className="whitespace-nowrap px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-primary-300 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-6">
                        <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary-500/30 transition-all">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-slate-500 text-sm font-medium"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
