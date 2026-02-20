import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ShoppingCart,
    CheckCircle2,
    Users,
    CreditCard,
    Banknote,
    Minus,
    Download,
    X,
    UserPlus,
    Check,
    Filter,
    ChevronDown
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { jsPDF } from 'jspdf';
import { useNotification } from '../context/NotificationContext';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const POS = () => {
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isRecurring, setIsRecurring] = useState(false);
    const [onlineMethod, setOnlineMethod] = useState('UPI'); // UPI, QR, Bank
    const { addNotification } = useNotification();

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastBill, setLastBill] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemRes, custRes] = await Promise.all([
                api.get('/items'),
                api.get('/contacts?type=Customer')
            ]);
            setItems(itemRes.data);
            setCustomers(custRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return alert('Out of stock!');
        const existing = cart.find(i => i._id === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                addNotification('No more stock available!', 'error');
                return;
            }
            setCart(cart.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i));
            addNotification(`Added another ${product.name}`);
        } else {
            setCart([...cart, { ...product, quantity: 1, subtotal: product.price, item: product._id }]);
            addNotification(`Added ${product.name} to cart`);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(i => {
            if (i._id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                if (delta > 0 && newQty > i.stock) {
                    alert('No more stock available!');
                    return i;
                }
                return { ...i, quantity: newQty, subtotal: newQty * i.price };
            }
            return i;
        }));
    };

    const removeFromCart = (id) => setCart(cart.filter(i => i._id !== id));

    const subtotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
    const tax = subtotal * 0.05; // 5% TAX
    const finalAmount = subtotal + tax - discount;

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty');

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
                discount,
                tax,
                finalAmount,
                finalAmount,
                paymentMethod: paymentMethod === 'Online' ? `Online (${onlineMethod})` : paymentMethod,
                isRecurring,
                customer: selectedCustomer?._id
            };

            const { data } = await api.post('/billing', billData);
            setLastBill(data);
            setIsSuccess(true);
            setCart([]);
            setSelectedCustomer(null);
            setDiscount(0);
            setPaymentMethod('Cash');
            addNotification('Order placed successfully!', 'success');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Checkout failed', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadPDF = () => {
        if (!lastBill) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("STOCKIFY ERP INVOICE", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Invoice ID: ${lastBill.billId}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
        if (selectedCustomer) doc.text(`Customer: ${selectedCustomer.name}`, 20, 50);

        const tableData = lastBill.items.map(i => [i.name, `₹${i.price}`, i.quantity, `₹${i.subtotal}`]);
        doc.autoTable({
            startY: 60,
            head: [['Item', 'Price', 'Qty', 'Subtotal']],
            body: tableData,
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Tax (5%): ₹${lastBill.tax.toFixed(2)}`, 140, finalY);
        doc.text(`Discount: ₹${lastBill.discount.toFixed(2)}`, 140, finalY + 5);
        doc.setFontSize(14);
        doc.text(`Total: ₹${lastBill.finalAmount.toFixed(2)}`, 140, finalY + 15);
        doc.save(`Invoice_${lastBill.billId}.pdf`);
    };

    const categories = ['All', ...new Set(items.map(item => item.category))];

    const filteredItems = items.filter(item =>
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === 'All' || item.category === categoryFilter)
    );

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-80px)] gap-0 overflow-hidden relative">
                {/* Left Side: Product Selector */}
                {/* Left Side: Product Selector */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 p-6 overflow-y-auto">

                    {/* Unified Header: Title & Search/Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">POS (Sales)</h1>
                            <p className="text-slate-500 text-sm">Manage billing and checkout</p>
                        </div>

                        <div className="flex flex-1 md:flex-none w-full md:w-auto gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none text-slate-800 font-semibold placeholder:text-slate-400 text-xs transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="relative w-40 shrink-0">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <select
                                    className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-100 text-xs font-bold text-slate-700 cursor-pointer appearance-none transition-all shadow-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 h-[115px] animate-pulse"></div>
                                ))
                            ) : filteredItems.length === 0 ? (
                                <div className="col-span-full py-16 text-center">
                                    <ShoppingCart size={48} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-slate-400 font-bold text-sm">No products found</p>
                                    <button onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }} className="mt-2 text-primary-500 text-xs font-bold hover:underline">Clear filters</button>
                                </div>
                            ) : filteredItems.map(item => {
                                const inCart = cart.find(i => i._id === item._id);
                                return (
                                    <button
                                        key={item._id}
                                        onClick={() => addToCart(item)}
                                        className={`group relative p-3 bg-white rounded-xl border transition-all duration-200 text-left flex flex-col justify-between h-[115px] shadow-sm hover:shadow-md hover:-translate-y-0.5 ${inCart ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/10' : 'border-slate-200 hover:border-primary-300'}`}
                                    >
                                        <div className="w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-slate-800 leading-tight text-xs line-clamp-2 pr-1">{item.name}</h3>
                                                {inCart && (
                                                    <div className="bg-primary-500 text-white p-0.5 rounded-full shrink-0">
                                                        <Check size={8} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide inline-block">{item.category}</span>
                                        </div>

                                        <div className="flex items-end justify-between mt-auto w-full">
                                            <span className="text-sm font-black text-slate-900 tracking-tight">₹{item.price.toFixed(0)}</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${item.stock < 10 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {item.stock} left
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Panel: Modern Docked Dashboard */}
                {cart.length > 0 && (
                    <div className="rounded-2xl bg-white border-2 border-primary-500 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] z-40 shrink-0 h-[140px] flex divide-x divide-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Customer Info */}
                        <div className="w-[200px] px-4 py-3 flex flex-col gap-3 bg-white shrink-0">
                            <div className="flex items-center gap-2 text-slate-400 h-4">
                                <Users size={14} />
                                <h2 className="font-bold text-[10px] uppercase tracking-widest">Customer</h2>
                            </div>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer transition-all"
                                value={selectedCustomer?._id || ''}
                                onChange={(e) => setSelectedCustomer(customers.find(c => c._id === e.target.value))}
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 min-w-0 bg-white flex flex-col relative px-4 py-3">
                            <div className="flex justify-between items-center mb-2 h-4">
                                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Current Order <span className="text-slate-300">({cart.length})</span></h3>
                                <button onClick={() => setCart([])} disabled={cart.length === 0} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded transition-all flex items-center gap-1">
                                    <Trash2 size={10} /> Clear
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-300 gap-2">
                                        <ShoppingCart size={18} className="opacity-30" />
                                        <p className="font-semibold text-xs opacity-60">Cart is empty</p>
                                    </div>
                                ) : cart.map(item => (
                                    <div key={item._id} className="flex items-center justify-between group h-8">
                                        <div className="flex items-center gap-2 overflow-hidden w-1/3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary-500 transition-colors shrink-0" />
                                            <p className="font-semibold text-slate-700 text-xs truncate">{item.name}</p>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="flex items-center gap-1 bg-slate-50 rounded px-1 border border-slate-100 group-hover:border-primary-100 transition-colors">
                                                <button onClick={() => updateQty(item._id, -1)} className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-primary-600"><Minus size={8} /></button>
                                                <span className="w-4 text-center font-bold text-[10px] text-slate-700">{item.quantity}</span>
                                                <button onClick={() => updateQty(item._id, 1)} className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-primary-600"><Plus size={8} /></button>
                                            </div>
                                            <p className="font-bold text-xs text-slate-900 w-12 text-right">₹{item.subtotal.toFixed(0)}</p>
                                            <button onClick={() => removeFromCart(item._id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all px-1"><X size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Checkout Details */}
                        <div className="w-[280px] bg-white px-4 py-3 flex flex-col justify-between shrink-0">
                            <div className="flex justify-between items-start mb-1 h-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit">
                                        <button onClick={() => setPaymentMethod('Cash')} className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all shadow-sm ${paymentMethod === 'Cash' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                            Cash
                                        </button>
                                        <button onClick={() => setPaymentMethod('Card')} className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all shadow-sm ${paymentMethod === 'Card' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                            Card
                                        </button>
                                        <button onClick={() => setPaymentMethod('Online')} className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all shadow-sm ${paymentMethod === 'Online' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                            Online
                                        </button>
                                    </div>
                                    {paymentMethod === 'Online' && (
                                        <select
                                            value={onlineMethod}
                                            onChange={(e) => setOnlineMethod(e.target.value)}
                                            className="bg-primary-50 text-[8px] font-black text-primary-700 px-2 py-1 rounded-md border-none outline-none animate-in fade-in slide-in-from-top-1"
                                        >
                                            <option>UPI</option>
                                            <option>QR Scanner</option>
                                            <option>Bank Transfer</option>
                                        </select>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            onClick={() => setIsRecurring(!isRecurring)}
                                            className={`p-1 rounded-md border transition-all ${isRecurring ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}
                                            title="Set as recurring monthly order"
                                        >
                                            <CheckCircle2 size={12} />
                                        </button>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Recurring</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Payable</span>
                                    <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">₹{finalAmount.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-400 mb-0 px-1 items-center">
                                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-semibold">Tax: 5%</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-xs uppercase tracking-widest h-10 mt-auto"
                            >
                                {isProcessing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> Pay Now <CheckCircle2 size={14} /> </>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm"></div>
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-secondary-900 mb-2">Checkout Successful!</h2>
                        <p className="text-secondary-500 mb-8 font-medium">Order #{lastBill?.billId} has been successfully recorded in the system.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={downloadPDF}
                                className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-primary-500/20"
                            >
                                <Download size={20} />
                                <span>Download Receipt (PDF)</span>
                            </button>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="w-full py-4 bg-slate-100 text-secondary-600 font-bold rounded-2xl hover:bg-secondary-800"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 20px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
            `}</style>
        </Layout>
    );
};

export default POS;
