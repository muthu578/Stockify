import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Contacts from './pages/Contacts';
import Purchases from './pages/Purchases';
import Finance from './pages/Finance';
import HR from './pages/HR';
import SalesAnalytics from './pages/SalesAnalytics';
import Register from './pages/Register';
import PlaceholderPage from './pages/PlaceholderPage';
import MasterManagement from './pages/MasterManagement';
import UserManagement from './pages/UserManagement';
import POGeneration from './pages/POGeneration';
import GRNEntry from './pages/GRNEntry';
import InventoryReport from './pages/InventoryReport';
import StockTransfer from './pages/StockTransfer';
import MachineMaster from './pages/MachineMaster';
import ProductionDetails from './pages/ProductionDetails';
import ProformaInvoice from './pages/ProformaInvoice';
import DeliveryChallan from './pages/DeliveryChallan';
import CreditDebitNotes from './pages/CreditDebitNotes';
import DailyStocks from './pages/DailyStocks';
import TotalStock from './pages/TotalStock';
import BatchWiseReport from './pages/BatchWiseReport';

const ProtectedRoute = ({ children, adminOnly = false, managerOnly = false }) => {
    const { user, isAdmin, isManager } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/dashboard" />;
    }

    if (managerOnly && !isManager()) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                        {/* Master Management */}
                        <Route path="/masters/storage-location" element={<ProtectedRoute managerOnly={true}><MasterManagement type="location" /></ProtectedRoute>} />
                        <Route path="/masters/product-category" element={<ProtectedRoute managerOnly={true}><MasterManagement type="category" /></ProtectedRoute>} />
                        <Route path="/masters/users" element={<ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>} />
                        <Route path="/masters/customers" element={<ProtectedRoute><Contacts type="Customer" /></ProtectedRoute>} />
                        <Route path="/masters/suppliers" element={<ProtectedRoute managerOnly={true}><Contacts type="Supplier" /></ProtectedRoute>} />
                        <Route path="/masters/settings" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />

                        {/* Purchase Management */}
                        <Route path="/purchases/po" element={<ProtectedRoute managerOnly={true}><POGeneration /></ProtectedRoute>} />
                        <Route path="/purchases/grn" element={<ProtectedRoute managerOnly={true}><GRNEntry /></ProtectedRoute>} />

                        {/* Inventory Management */}
                        <Route path="/inventory/product-master" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                        <Route path="/inventory/report" element={<ProtectedRoute><InventoryReport /></ProtectedRoute>} />
                        <Route path="/inventory/stock-transfer" element={<ProtectedRoute><StockTransfer /></ProtectedRoute>} />

                        {/* Production Management */}
                        <Route path="/production/machine-master" element={<ProtectedRoute managerOnly={true}><MachineMaster /></ProtectedRoute>} />
                        <Route path="/production/details" element={<ProtectedRoute managerOnly={true}><ProductionDetails /></ProtectedRoute>} />

                        {/* Sales Management */}
                        <Route path="/sales/performa-invoice" element={<ProtectedRoute><ProformaInvoice /></ProtectedRoute>} />
                        <Route path="/sales/delivery-challan" element={<ProtectedRoute><DeliveryChallan /></ProtectedRoute>} />
                        <Route path="/sales/notes" element={<ProtectedRoute managerOnly={true}><CreditDebitNotes /></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                        <Route path="/sales-analytics" element={<ProtectedRoute managerOnly={true}><SalesAnalytics /></ProtectedRoute>} />

                        {/* Reporting */}
                        <Route path="/reporting/daily-stocks" element={<ProtectedRoute managerOnly={true}><DailyStocks /></ProtectedRoute>} />
                        <Route path="/reporting/total-stock" element={<ProtectedRoute managerOnly={true}><TotalStock /></ProtectedRoute>} />
                        <Route path="/reporting/batch-wise" element={<ProtectedRoute managerOnly={true}><BatchWiseReport /></ProtectedRoute>} />

                        {/* Legacy/Direct Routes */}
                        <Route path="/inventory" element={<Navigate to="/inventory/product-master" />} />
                        <Route path="/customers" element={<Navigate to="/masters/customers" />} />
                        <Route path="/suppliers" element={<Navigate to="/masters/suppliers" />} />
                        <Route path="/settings" element={<Navigate to="/masters/settings" />} />
                        <Route path="/reports" element={<ProtectedRoute managerOnly={true}><Reports /></ProtectedRoute>} />
                        <Route path="/purchases" element={<ProtectedRoute managerOnly={true}><Purchases /></ProtectedRoute>} />
                        <Route path="/accounts" element={<ProtectedRoute managerOnly={true}><Finance /></ProtectedRoute>} />
                        <Route path="/hr" element={<ProtectedRoute managerOnly={true}><HR /></ProtectedRoute>} />
                        <Route path="/register" element={<ProtectedRoute adminOnly={true}><Register /></ProtectedRoute>} />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
