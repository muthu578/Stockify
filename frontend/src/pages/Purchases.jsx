import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ShoppingCart,
    CheckCircle2,
    Users,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    Package,
    Activity,
    X,
    TrendingDown,
    Layers,
    CreditCard
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { addNotification } = useNotification();

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
                api.get('/items', { params: { limit: 1000 } }),
                api.get('/contacts?type=Supplier')
            ]);
            setPurchases(purRes.data.purchases || purRes.data);
            setItems(itemRes.data.items || itemRes.data);
            setSuppliers(supRes.data.contacts || supRes.data);
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
        addNotification(`Added ${product.name} to acquisition list`, 'success');
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
        if (!selectedSupplier) return addNotification('Originator (Supplier) selection required', 'error');
        if (cart.length === 0) return addNotification('Inventory manifest is empty', 'error');

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
            addNotification('Acquisition finalized and ledger updated', 'success');
        } catch (error) {
            addNotification(error.response?.data?.message || 'Transaction rejected by server', 'error');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" dot>Live Operations</Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            <Activity size={12} />
                            Logistics Management
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Acquisitions</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Overseeing <span className="text-slate-900 font-bold">Inbound Supply Chain</span> and global procurement.</p>
                </div>
                <Button 
                    variant="primary" 
                    size="lg"
                    icon={Plus}
                    onClick={() => setShowModal(true)}
                >
                    Log New Acquisition
                </Button>
            </div>

            <Card className="mb-12" padding="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/60 bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Valuation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flow Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Records</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Logistics Vault...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Badge variant="secondary" className="mb-4">Empty Ledger</Badge>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Recent Acquisitions Recorded</p>
                                    </td>
                                </tr>
                            ) : purchases.map(pur => (
                                <tr key={pur._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                                <ShoppingCart size={16} />
                                            </div>
                                            <span className="font-black text-slate-900 leading-none">{pur.purchaseId}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{pur.supplier?.name}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1 flex items-center gap-1">
                                                <Users size={10} /> Certified Origin
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center text-slate-500 font-bold text-sm bg-slate-100/50 w-fit px-3 py-1.5 rounded-lg border border-slate-200/60">
                                            <Calendar size={14} className="mr-2 text-slate-400" />
                                            {new Date(pur.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 tracking-tight text-lg">₹{pur.totalAmount.toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-emerald-600 mt-0.5 uppercase tracking-tighter flex items-center gap-1">
                                                <ArrowUpRight size={10} /> Inventory Influx
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="primary" dot>{pur.status}</Badge>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button variant="ghost" size="sm" icon={ChevronRight} className="text-slate-300 group-hover:text-slate-900">Details</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Receive Stock Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)}></div>
                    <Card className="relative w-full max-w-6xl h-[85vh] bg-white shadow-2xl border-transparent animate-in zoom-in slide-in-from-bottom-20 duration-500 overflow-hidden flex flex-col" padding="p-0">
                        <div className="p-8 border-b border-slate-200/60 flex items-center justify-between bg-white">
                            <div>
                                <Badge variant="primary" className="mb-2">Procurement Engine</Badge>
                                <CardTitle>Global Resource Acquisition</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </Button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/30">
                            {/* Product Selector */}
                            <div className="w-full lg:w-1/3 border-r border-slate-200/60 bg-white flex flex-col">
                                <div className="p-6 border-b border-slate-200/60">
                                    <Input 
                                        placeholder="Identify Logistics SKU..." 
                                        icon={Search}
                                        containerClassName="w-full"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Package size={12} /> Live Inventory Stack
                                    </h4>
                                    {items.map(item => (
                                        <button
                                            key={item._id}
                                            onClick={() => addToCart(item)}
                                            className="w-full text-left p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-emerald-500/20 hover:bg-emerald-50/30 transition-all duration-300 flex justify-between items-center group shadow-sm"
                                        >
                                            <div>
                                                <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{item.name}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                     <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                                        <Layers size={10} /> {item.stock} {item.unit}
                                                     </p>
                                                     <span className="text-slate-200">|</span>
                                                     <p className="text-[10px] font-black text-emerald-600">₹{item.buyPrice?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-300 group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:rotate-90 transition-all">
                                                <Plus size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cart and Supplier */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-8 pb-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Users size={12} /> Distribution Origin
                                            </label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-10 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm"
                                                    value={selectedSupplier}
                                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                                >
                                                    <option value="">Locate Partner Supplier...</option>
                                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16} />
                                            </div>
                                        </div>
                                         <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Calendar size={12} /> Protocol Timestamp
                                            </label>
                                            <div className="bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 shadow-sm flex items-center gap-3">
                                                <Activity size={18} className="text-emerald-500" />
                                                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
                                    <div className="flex-1 bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-950/5 flex flex-col overflow-hidden">
                                        <div className="flex-1 overflow-y-auto">
                                            <table className="w-full border-collapse">
                                                <thead className="sticky top-0 bg-white border-b border-slate-200/60 z-10">
                                                    <tr>
                                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Identified</th>
                                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Cost</th>
                                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                                                        <th className="w-16"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {cart.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="py-20 text-center">
                                                                <ShoppingCart size={40} className="text-slate-100 mx-auto mb-4" />
                                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting Manifest Entries</p>
                                                            </td>
                                                        </tr>
                                                    ) : cart.map(item => (
                                                        <tr key={item.item} className="group hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                                        <Package size={18} />
                                                                    </div>
                                                                    <span className="font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="relative group/input flex justify-center">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-32 bg-slate-50 border border-transparent rounded-xl py-2 pl-8 pr-4 text-center font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 transition-all shadow-sm"
                                                                        value={item.purchasePrice}
                                                                        onChange={(e) => updateCartPrice(item.item, parseFloat(e.target.value))}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center justify-center gap-4 bg-slate-50 w-fit mx-auto px-3 py-1.5 rounded-xl border border-slate-200/60">
                                                                    <button onClick={() => updateCartQty(item.item, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-black text-slate-400">-</button>
                                                                    <span className="font-black text-lg text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
                                                                    <button onClick={() => updateCartQty(item.item, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-black text-slate-400">+</button>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-black text-slate-900 tracking-tight text-lg">₹{item.subtotal.toLocaleString()}</td>
                                                            <td className="px-8 py-5">
                                                                <button onClick={() => removeFromCart(item.item)} className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="p-10 bg-slate-900 text-white border-t border-slate-800">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                                <div className="flex items-center gap-10 border-r border-white/5 pr-10">
                                                    <div>
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Gross Valuation</p>
                                                        <p className="text-5xl font-black tracking-tighter">₹{totalAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Authorized Payment</label>
                                                        <div className="relative">
                                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                                                            <input
                                                                type="number"
                                                                placeholder="0.00"
                                                                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 font-black text-2xl text-white outline-none focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 transition-all w-[240px]"
                                                                value={paidAmount}
                                                                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex justify-end">
                                                    <Button
                                                        variant="primary"
                                                        size="xl"
                                                        icon={CheckCircle2}
                                                        className="px-16 py-8 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-emerald-500/20"
                                                        onClick={handleSubmit}
                                                    >
                                                        Commit Inventory Protocol
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Layout>
    );
};

export default Purchases;
