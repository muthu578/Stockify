import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ShoppingCart,
    CheckCircle2,
    CreditCard,
    Banknote,
    Minus,
    Download,
    X,
    ChevronDown,
    Zap,
    Printer,
    ArrowLeft,
    Box,
    Hash,
    Tag,
    Star,
    Layers,
    ChevronRight,
    SearchX,
    ChevronUp
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { jsPDF } from 'jspdf';
import { useNotification } from '../context/NotificationContext';
import 'jspdf-autotable';

const POS = () => {
    // State Management
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [onlineMethod, setOnlineMethod] = useState('UPI');
    const [isCartExpanded, setIsCartExpanded] = useState(true);
    const { addNotification } = useNotification();

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastBill, setLastBill] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/items', { params: { limit: 1000 } });
            const itemsList = data.items || data;
            if (Array.isArray(itemsList)) {
                setItems(itemsList);
            } else {
                setItems([]);
                console.error('Invalid items data format', data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            addNotification('Failed to sync inventory data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Auto-expand cart when items are added
    useEffect(() => {
        if (cart.length > 0) {
            setIsCartExpanded(true);
        } else {
            setIsCartExpanded(false);
        }
    }, [cart.length]);

    // Cart Logic
    const addToCart = (product) => {
        if (!product || product.stock <= 0) {
            addNotification('Stock depleted for this item', 'warning');
            return;
        }

        setCart(prevCart => {
            const existing = prevCart.find(i => i._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    addNotification('Maximum available stock reached', 'warning');
                    return prevCart;
                }
                return prevCart.map(i => i._id === product._id ? 
                    { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i
                );
            }
            return [...prevCart, { ...product, quantity: 1, subtotal: product.price }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prevCart => prevCart.map(i => {
            if (i._id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                if (delta > 0 && newQty > i.stock) {
                    addNotification('Insufficient stock for additional units', 'warning');
                    return i;
                }
                return { ...i, quantity: newQty, subtotal: newQty * i.price };
            }
            return i;
        }));
    };

    const removeFromCart = (id) => setCart(prevCart => prevCart.filter(i => i._id !== id));

    // Calculations
    const subtotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
    const tax = subtotal * 0.05; // 5% Standard Tax
    const finalAmount = subtotal + tax;

    // Transaction Submission
    const handleCheckout = async () => {
        if (cart.length === 0) return addNotification('Your cart is empty', 'error');

        setIsProcessing(true);
        try {
            const billData = {
                items: cart.map(i => ({
                    item: i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    subtotal: i.subtotal
                })),
                totalAmount: subtotal,
                tax,
                finalAmount,
                paymentMethod: paymentMethod === 'Online' ? `Online (${onlineMethod})` : paymentMethod
            };

            const response = await api.post('/billing', billData);
            const data = response.data;
            
            setLastBill(data);
            setIsSuccess(true);
            setCart([]);
            setPaymentMethod('Cash');
            addNotification('Transaction successfully recorded', 'success');
        } catch (error) {
            console.error('Checkout error:', error);
            addNotification(error.response?.data?.message || 'Transaction processing failed', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // PDF Receipt Generation
    const downloadPDF = () => {
        if (!lastBill) return;
        const doc = new jsPDF();
        
        // Stylish Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("STOCKIFY ERP", 20, 25);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Official Digital Transaction Receipt", 20, 32);
        
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Reference ID: ${lastBill.billId}`, 190, 25, { align: 'right' });
        doc.text(`Issued: ${new Date().toLocaleString()}`, 190, 32, { align: 'right' });

        // Table
        const tableData = (lastBill.items || []).map(i => [
            i.name, 
            `Rs. ${i.price.toLocaleString()}`, 
            i.quantity, 
            `Rs. ${i.subtotal.toLocaleString()}`
        ]);
        
        doc.autoTable({
            startY: 50,
            head: [['Product/Service', 'Base Price', 'Qty', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 9, halign: 'center' },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        const finalY = doc.lastAutoTable.finalY + 20;
        
        // Summary Card
        doc.setFillColor(248, 250, 252);
        doc.rect(130, finalY - 5, 60, 35, 'F');
        
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.text(`Subtotal:`, 135, finalY + 5);
        doc.text(`Rs. ${lastBill.totalAmount.toLocaleString()}`, 185, finalY + 5, { align: 'right' });
        
        doc.text(`Tax (GST 5%):`, 135, finalY + 12);
        doc.text(`Rs. ${lastBill.tax.toLocaleString()}`, 185, finalY + 12, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Final Payable:`, 135, finalY + 22);
        doc.text(`Rs. ${lastBill.finalAmount.toLocaleString()}`, 185, finalY + 22, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text("This is an electronically generated document. Support: admin@stockify.io", 105, 280, { align: 'center' });
        
        doc.save(`Receipt_${lastBill.billId}.pdf`);
    };

    const categories = ['All', ...new Set(items.map(item => item.category))];

    const filteredItems = items.filter(item => {
        const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const barcodeMatch = item.barcode?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
        return (nameMatch || barcodeMatch) && categoryMatch;
    });

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-120px)] gap-4 overflow-hidden relative">
                {/* TOP: Discovery & Catalog */}
                <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500`}>
                    {/* Catalog Header */}
                    <div className="bg-white p-4 lg:p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 mb-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Commerce Node</h1>
                                <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">Operational Node: STATION-DELTA-01</p>
                            </div>
                            <div className="flex items-center gap-3 w-full xl:w-auto">
                                <div className="relative flex-1 xl:w-64">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={16} strokeWidth={3} />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Identify Asset..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200/60 rounded-[1rem] focus:bg-white focus:border-emerald-500 outline-none transition-all text-xs font-bold text-slate-800 placeholder:text-slate-300 shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <select
                                        className="pl-4 pr-10 py-2.5 bg-slate-900 text-white rounded-[1rem] text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/10 transition-all appearance-none cursor-pointer min-w-[120px] shadow-xl"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={12} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2 pb-2">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
                                    <div key={i} className="h-44 bg-white rounded-[1.5rem] animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2rem] border-4 border-dashed border-slate-200/60 text-center p-8">
                                <SearchX size={40} className="text-slate-200 mb-4" />
                                <h3 className="text-lg font-black text-slate-900 mb-1 leading-none">Index Empty</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                                {filteredItems.map(item => (
                                    <div 
                                        key={item._id} 
                                        className={`group relative bg-white rounded-[1.5rem] p-4 border transition-all duration-500 cursor-pointer flex flex-col ${cart.find(i => i._id === item._id) ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/10' : 'border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1'}`}
                                        onClick={() => addToCart(item)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-1.5 bg-slate-50 rounded-lg">
                                                <Box size={14} className="text-slate-400" />
                                            </div>
                                            <Badge variant={item.stock < 10 ? 'danger' : 'primary'} dot className="text-[8px] px-1.5 py-0.5">{item.stock}</Badge>
                                        </div>

                                        <h4 className="text-[10px] font-black text-slate-900 mb-1 leading-tight uppercase line-clamp-2 min-h-[1.5rem]">{item.name}</h4>
                                        <p className="text-[9px] font-black text-emerald-600 mb-3">₹{item.price.toLocaleString()}</p>
                                        
                                        <button 
                                            className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[8px] uppercase tracking-widest transition-all mt-auto ${cart.find(i => i._id === item._id) ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-emerald-500'}`}
                                        >
                                            <Plus size={12} strokeWidth={3} />
                                            Add
                                        </button>

                                        {cart.find(i => i._id === item._id) && (
                                            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-[9px] font-black border-2 border-white shadow-lg">
                                                {cart.find(i => i._id === item._id).quantity}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM: Horizontal Cart Shelf (Expandable) */}
                {cart.length > 0 && (
                    <div 
                        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-8 transform ${isCartExpanded ? 'translate-y-0 pb-4' : 'translate-y-[calc(100%-48px)] pb-0'}`}
                    >
                        {/* Expand/Collapse Toggle Handle */}
                        <div className="flex justify-center mb-[-12px] relative z-20">
                            <button 
                                onClick={() => setIsCartExpanded(!isCartExpanded)}
                                className="w-24 h-6 bg-slate-900 text-white rounded-t-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-emerald-500 transition-colors group"
                            >
                                <ChevronUp size={14} className={`transition-transform duration-500 ${isCartExpanded ? 'rotate-180' : 'rotate-0'}`} />
                                <span className="text-[8px] font-black uppercase tracking-widest">
                                    {isCartExpanded ? 'Collapse' : 'Cart'}
                                </span>
                            </button>
                        </div>

                        <div className={`h-[140px] bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.15)] flex overflow-hidden ring-4 ring-slate-900/5`}>
                            {/* Summary (Left) */}
                            <div className="w-[240px] bg-slate-900 p-4 flex flex-col justify-between relative overflow-hidden">
                                <div className="flex items-center gap-2 relative z-10">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                                        <ShoppingCart size={16} />
                                    </div>
                                    <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Summary</h3>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <div className="flex justify-between text-[8px]">
                                        <span className="text-white/40 font-black uppercase">Subtotal</span>
                                        <span className="text-white font-black">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-1">
                                        <h2 className="text-2xl font-black text-white tracking-tighter">₹{finalAmount.toLocaleString()}</h2>
                                    </div>
                                </div>

                                <button 
                                    className={`w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all relative z-10 ${cart.length > 0 ? 'bg-emerald-500 text-white shadow-lg active:scale-95' : 'bg-white/5 text-white/20'}`}
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><CheckCircle2 size={12} /> Settle</>}
                                </button>
                                
                                {/* Background Accent */}
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            </div>

                            {/* Cart Deck (Center) */}
                            <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-slate-900 font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                        Asset Deck
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">{cart.length}</span>
                                    </h3>
                                    <button onClick={() => setCart([])} className="text-slate-300 hover:text-rose-500 uppercase text-[8px] font-black tracking-widest transition-colors">Clear All</button>
                                </div>
                                
                                <div className="flex-1 flex gap-3 overflow-x-auto no-scrollbar items-center py-1">
                                    {cart.map((item) => (
                                        <div key={item._id} className="w-[140px] shrink-0 bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex flex-col justify-between h-[80px] hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-[9px] font-black text-slate-800 uppercase truncate pr-1 group-hover:text-emerald-600 transition-colors">{item.name}</h5>
                                                <button onClick={() => removeFromCart(item._id)} className="text-slate-200 hover:text-rose-500 transition-colors"><X size={10} /></button>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <p className="text-[9px] font-black text-slate-900">₹{item.price.toLocaleString()}</p>
                                                <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-sm border border-slate-200/60">
                                                    <button onClick={() => updateQty(item._id, -1)} className="text-slate-400 hover:text-rose-500"><Minus size={10} /></button>
                                                    <span className="text-[10px] font-black text-slate-900 w-3 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item._id, 1)} className="text-slate-400 hover:text-emerald-500"><Plus size={10} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Selection (Right) */}
                            <div className="w-[200px] border-l border-slate-200/60 p-4 flex flex-col justify-center gap-2 bg-slate-50/50">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Settlement</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'Cash', icon: Banknote },
                                        { id: 'Card', icon: CreditCard },
                                        { id: 'Online', icon: Zap }
                                    ].map(method => (
                                        <button 
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${paymentMethod === method.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-300 hover:text-slate-400 hover:shadow-sm'}`}
                                        >
                                            <method.icon size={12} strokeWidth={paymentMethod === method.id ? 3 : 2} />
                                            <span className="text-[6px] font-black uppercase tracking-tighter">{method.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FULL SCREEN SUCCESS MODAL */}
            {isSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-3xl animate-in fade-in duration-700"></div>
                    <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
                        <div className="bg-emerald-500 p-8 text-center">
                            <CheckCircle2 size={48} className="text-white mx-auto mb-4" />
                            <h2 className="text-white text-4xl font-black tracking-tighter uppercase">Authorized</h2>
                        </div>
                        <div className="p-8 text-center">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-8">₹{lastBill?.finalAmount.toLocaleString()}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={downloadPDF} className="p-4 bg-slate-50 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-slate-100 transition-colors"><Download size={16} /> Archive</button>
                                <button onClick={() => window.print()} className="p-4 bg-slate-50 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-slate-100 transition-colors"><Printer size={16} /> Print</button>
                                <button onClick={() => setIsSuccess(false)} className="col-span-2 p-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Continue</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default POS;
