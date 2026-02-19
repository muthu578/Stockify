import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    FileText,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import Layout from '../components/Layout';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [topItems, setTopItems] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesRes = await api.get('/reports/sales');
                const itemsRes = await api.get('/reports/top-items');
                const billsRes = await api.get('/billing');
                setReportData(salesRes.data);
                setTopItems(itemsRes.data);
                setBills(billsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExportCSV = () => {
        if (!reportData) return;

        const salesData = reportData.sales.map(s => ({
            Date: s._id,
            TotalSales: s.totalSales,
            OrderCount: s.count
        }));

        const ws = XLSX.utils.json_to_sheet(salesData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesReport");
        XLSX.writeFile(wb, "Stockify_Sales_Report.xlsx");
    };

    const downloadBillPDF = (bill) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('STOCKIFY RECEIPT', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Bill ID: ${bill.billId}`, 20, 40);
        doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`, 20, 46);
        doc.text(`Cashier: ${bill.cashier?.name || 'Unknown'}`, 20, 52);

        const rows = bill.items.map(i => [i.name, `₹${i.price}`, i.quantity, `₹${i.subtotal}`]);
        doc.autoTable({
            startY: 60,
            head: [['Item', 'Price', 'Qty', 'Total']],
            body: rows,
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Payable: ₹${bill.finalAmount.toFixed(2)}`, 140, finalY);
        doc.save(`Invoice_${bill.billId}.pdf`);
    };

    const downloadBillExcel = (bill) => {
        const rows = bill.items.map(i => ({
            Item: i.name,
            Price: i.price,
            Quantity: i.quantity,
            Subtotal: i.subtotal
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BillDetails");
        XLSX.writeFile(wb, `Bill_${bill.billId}.xlsx`);
    };

    const barData = {
        labels: reportData?.sales.map(s => s._id) || [],
        datasets: [
            {
                label: 'Revenue',
                data: reportData?.sales.map(s => s.totalSales) || [],
                backgroundColor: '#0ea5e9',
                borderRadius: 8,
            }
        ]
    };

    const doughnutData = {
        labels: topItems.map(item => item._id),
        datasets: [
            {
                data: topItems.map(item => item.totalQuantity),
                backgroundColor: [
                    '#0ea5e9',
                    '#ec4899',
                    '#f59e0b',
                    '#10b981',
                    '#8b5cf6'
                ],
                borderWidth: 0,
            }
        ]
    };

    if (loading) return <Layout><div className="flex items-center justify-center h-[60vh]"><p className="text-slate-500 animate-pulse">Generating reports...</p></div></Layout>;

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
                    <p className="text-slate-500">Analyze your business performance over time</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium">
                        <Calendar size={18} />
                        <span>Select Range</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary-50 p-3 rounded-2xl">
                            <TrendingUp className="text-primary-600" size={24} />
                        </div>
                        <div className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={14} className="mr-0.5" />
                            14%
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{reportData?.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-50 p-3 rounded-2xl">
                            <BarChart3 className="text-purple-600" size={24} />
                        </div>
                        <div className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                            <ArrowDownRight size={14} className="mr-0.5" />
                            2%
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                    <h3 className="text-2xl font-black text-slate-900">{reportData?.totalOrders}</h3>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-3xl text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm font-medium">Estimated Profit</p>
                        <h3 className="text-3xl font-black mt-1">₹{(reportData?.totalRevenue * 0.2).toLocaleString()}</h3>
                        <p className="text-xs text-primary-400 mt-2 flex items-center">
                            Based on 20% average margin <ChevronRight size={12} className="ml-1" />
                        </p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-[100px] h-[100px] bg-primary-600/30 blur-[40px] rounded-full"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8">Revenue Growth</h3>
                    <div className="h-[300px]">
                        <Bar
                            data={barData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8">Top Selling Products</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-[200px] h-[200px]">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    cutout: '70%'
                                }}
                            />
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            {topItems.map((item, idx) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[idx] }}></div>
                                        <span className="text-sm font-semibold text-slate-700">{item._id}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{item.totalQuantity} sold</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bills.length} Orders Found</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bill ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cashier</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Method</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bills.slice(0, 10).map(bill => (
                                <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">#{bill.billId.split('-')[1]}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{bill.customer?.name || 'Walk-in'}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{bill.cashier?.name}</td>
                                    <td className="px-6 py-4 font-black text-slate-900">₹{bill.finalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{bill.paymentMethod}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => downloadBillPDF(bill)}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Download PDF"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                onClick={() => downloadBillExcel(bill)}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                title="Download Excel"
                                            >
                                                <FileText size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
