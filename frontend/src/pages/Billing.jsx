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
    Check
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
                paymentMethod,
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
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Side: Product Selector */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100/50">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center gap-4 sticky top-0 z-20">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none font-semibold text-secondary-900 placeholder:text-secondary-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto max-w-sm custom-scrollbar hidden md:flex">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap text-xs ${categoryFilter === cat ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 pb-10">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 h-48 animate-pulse shadow-sm"></div>
                                ))
                            ) : filteredItems.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <ShoppingCart size={64} className="mx-auto text-secondary-200 mb-4" />
                                    <p className="text-secondary-400 font-black text-lg">No products match your search</p>
                                    <button onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }} className="mt-4 text-primary-500 font-bold hover:underline">Clear all filters</button>
                                </div>
                            ) : filteredItems.map(item => {
                                const inCart = cart.find(i => i._id === item._id);
                                return (
                                    <button
                                        key={item._id}
                                        onClick={() => addToCart(item)}
                                        className={`group relative p-6 bg-white rounded-[2.2rem] border-2 transition-all duration-300 transform active:scale-95 text-left flex flex-col min-h-[180px] shadow-sm hover:shadow-xl ${item.stock <= 0 ? 'opacity-50 grayscale pointer-events-none' : 'border-secondary-200'} ${inCart ? 'border-primary-500 bg-primary-50/10 shadow-primary-500/10' : 'hover:border-primary-100'}`}
                                    >
                                        <div className="mb-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${inCart ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-50 text-secondary-400 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                                                    <ShoppingCart size={22} />
                                                </div>
                                                {inCart && (
                                                    <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg ring-4 ring-white">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-secondary-900 leading-tight mb-2 text-sm line-clamp-2">{item.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-secondary-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                                            <span className="text-lg font-black text-secondary-900">₹{item.price.toFixed(2)}</span>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg shadow-inner ${item.stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {item.stock} IN STOCK
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Current Order (Smaller Width) */}
                <div className="w-full lg:w-[280px] flex flex-col gap-6 sticky top-4 h-fit">
                    {/* Customer Selection */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-primary-600">
                            <Users size={20} />
                            <h2 className="font-black text-xs uppercase tracking-widest">Customer</h2>
                        </div>
                        <select
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-xl px-4 py-3 text-sm font-black text-secondary-900 outline-none cursor-pointer transition-all"
                            value={selectedCustomer?._id || ''}
                            onChange={(e) => setSelectedCustomer(customers.find(c => c._id === e.target.value))}
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Cart Items */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden max-h-[calc(100vh-40px)]">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={20} className="text-primary-600" />
                                <h3 className="font-black text-secondary-800 text-sm uppercase tracking-widest">Order Summary</h3>
                            </div>
                            <span className="bg-primary-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary-500/20">{cart.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar min-h-[200px]">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-secondary-300">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                        <ShoppingCart size={32} />
                                    </div>
                                    <p className="font-black text-sm uppercase tracking-tighter">Your cart is empty</p>
                                    <p className="text-xs text-secondary-400 mt-1">Select items to start selling</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item._id} className="p-4 bg-white border border-slate-100 rounded-2xl group hover:border-primary-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="font-black text-secondary-900 text-xs truncate flex-1 pr-2 uppercase leading-tight">{item.name}</p>
                                        <button onClick={() => removeFromCart(item._id)} className="text-secondary-200 hover:text-rose-500 transition-colors p-1">
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-primary-600">₹{item.price.toFixed(2)}</p>
                                        <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100 scale-90 origin-right transition-all group-hover:border-primary-200">
                                            <button onClick={(e) => { e.stopPropagation(); updateQty(item._id, -1); }} className="p-0.5 hover:bg-slate-50 rounded text-secondary-400 hover:text-primary-600"><Minus size={12} strokeWidth={3} /></button>
                                            <span className="w-5 text-center text-xs font-black text-secondary-900">{item.quantity}</span>
                                            <button onClick={(e) => { e.stopPropagation(); updateQty(item._id, 1); }} className="p-0.5 hover:bg-slate-50 rounded text-secondary-400 hover:text-primary-600"><Plus size={12} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Footer */}
                        <div className="p-6 bg-slate-900 text-white rounded-t-[2.5rem] shadow-2xl">
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-black">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tax (5%)</span>
                                    <span className="text-sm font-black">₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Payable Amount</span>
                                    <span className="text-3xl font-black text-accent-400">₹{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button
                                    onClick={() => setPaymentMethod('Cash')}
                                    className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black transition-all ${paymentMethod === 'Cash' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white/5 text-secondary-400 hover:bg-white/10'}`}
                                >
                                    <Banknote size={16} /> CASH
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('Card')}
                                    className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black transition-all ${paymentMethod === 'Card' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white/5 text-secondary-400 hover:bg-white/10'}`}
                                >
                                    <CreditCard size={16} /> CARD
                                </button>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0}
                                className="w-full py-5 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-primary-600 font-black rounded-2xl shadow-xl shadow-white/10 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                            >
                                {isProcessing ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-xs uppercase tracking-[0.2em]">Complete Checkout</span>
                                        <CheckCircle2 size={22} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
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
