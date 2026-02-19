import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ShoppingCart,
    CheckCircle2,
    Users,
    Calendar
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [cart, setCart] = useState([]);
    const [paidAmount, setPaidAmount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [purRes, itemRes, supRes] = await Promise.all([
                api.get('/purchases'),
                api.get('/items'),
                api.get('/contacts?type=Supplier')
            ]);
            setPurchases(purRes.data);
            setItems(itemRes.data);
            setSuppliers(supRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(i => i.item === product._id);
        if (existing) {
            setCart(cart.map(i => i.item === product._id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.purchasePrice } : i));
        } else {
            setCart([...cart, {
                item: product._id,
                name: product.name,
                purchasePrice: product.buyPrice || 0,
                quantity: 1,
                subtotal: product.buyPrice || 0
            }]);
        }
    };

    const updateCartQty = (id, qty) => {
        setCart(cart.map(i => i.item === id ? { ...i, quantity: qty, subtotal: qty * i.purchasePrice } : i));
    };

    const updateCartPrice = (id, price) => {
        setCart(cart.map(i => i.item === id ? { ...i, purchasePrice: price, subtotal: i.quantity * price } : i));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(i => i.item !== id));
    };

    const totalAmount = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) return alert('Select a supplier');
        if (cart.length === 0) return alert('Add items to purchase');

        try {
            await api.post('/purchases', {
                supplier: selectedSupplier,
                items: cart,
                totalAmount,
                paidAmount
            });
            setShowModal(false);
            setCart([]);
            setSelectedSupplier('');
            setPaidAmount(0);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving purchase');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Purchases</h1>
                    <p className="text-secondary-500">Inventory intake and supplier management</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all font-bold shadow-lg shadow-primary-600/20"
                >
                    <Plus size={20} />
                    <span>Receive Stock</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Purchase ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-10 text-center animate-pulse">Loading purchases...</td></tr>
                                ) : purchases.map(pur => (
                                    <tr key={pur._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-bold text-secondary-900">{pur.purchaseId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{pur.supplier?.name}</td>
                                        <td className="px-6 py-4 text-secondary-500 text-sm">
                                            {new Date(pur.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-black">₹{pur.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                                                {pur.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Receive Stock Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-2xl font-black text-secondary-900">New Purchase Record</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><Plus className="rotate-45" /></button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Product Selector */}
                            <div className="w-full lg:w-1/3 p-6 border-r border-slate-100 overflow-y-auto bg-white">
                                <h4 className="font-bold text-secondary-900 mb-4 flex items-center">
                                    <Search size={16} className="mr-2" />
                                    Select Products
                                </h4>
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <button
                                            key={item._id}
                                            onClick={() => addToCart(item)}
                                            className="w-full text-left p-4 rounded-2xl border border-slate-50 hover:border-primary-200 hover:bg-primary-50/30 transition-all flex justify-between items-center group"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-700 group-hover:text-primary-700">{item.name}</p>
                                                <p className="text-xs text-secondary-400">Stock: {item.stock} {item.unit}</p>
                                            </div>
                                            <Plus size={16} className="text-slate-300 group-hover:text-primary-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cart and Supplier */}
                            <div className="flex-1 p-6 flex flex-col bg-slate-50/30">
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Select Supplier</label>
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 font-bold outline-none"
                                            value={selectedSupplier}
                                            onChange={(e) => setSelectedSupplier(e.target.value)}
                                        >
                                            <option value="">-- Select --</option>
                                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <label className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Purchase Date</label>
                                        <p className="font-bold text-slate-700 flex items-center py-2 h-10">
                                            <Calendar size={16} className="mr-2 text-primary-500" />
                                            {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="flex-1 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50/50 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-secondary-400 uppercase">Item</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-secondary-400 uppercase">Buy Price</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-secondary-400 uppercase">Qty</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-secondary-400 uppercase">Total</th>
                                                    <th className="w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {cart.map(item => (
                                                    <tr key={item.item}>
                                                        <td className="px-6 py-4 font-bold">{item.name}</td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                className="w-24 px-3 py-1 bg-slate-50 rounded-lg text-center font-bold outline-none"
                                                                value={item.purchasePrice}
                                                                onChange={(e) => updateCartPrice(item.item, parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button onClick={() => updateCartQty(item.item, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-slate-100 rounded">-</button>
                                                                <span className="font-black w-8 text-center">{item.quantity}</span>
                                                                <button onClick={() => updateCartQty(item.item, item.quantity + 1)} className="p-1 hover:bg-slate-100 rounded">+</button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black">₹{item.subtotal.toFixed(2)}</td>
                                                        <td className="pr-4">
                                                            <button onClick={() => removeFromCart(item.item)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                                            <div>
                                                <p className="text-xs font-bold text-secondary-400 uppercase mb-2">Total Amount</p>
                                                <p className="text-3xl font-black text-secondary-900">₹{totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-secondary-400 uppercase mb-2">Paid Amount</p>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-xl outline-none focus:ring-2 focus:ring-primary-500/20"
                                                    value={paidAmount}
                                                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="lg:col-span-2 flex items-end">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center space-x-3"
                                                >
                                                    <CheckCircle2 size={24} />
                                                    <span>Complete Purchase</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Purchases;
