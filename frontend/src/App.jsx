import React from 'react';
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

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin()) {
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

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/inventory" element={
                            <ProtectedRoute>
                                <Inventory />
                            </ProtectedRoute>
                        } />

                        <Route path="/billing" element={
                            <ProtectedRoute>
                                <Billing />
                            </ProtectedRoute>
                        } />

                        <Route path="/reports" element={
                            <ProtectedRoute adminOnly={true}>
                                <Reports />
                            </ProtectedRoute>
                        } />

                        <Route path="/sales-analytics" element={
                            <ProtectedRoute adminOnly={true}>
                                <SalesAnalytics />
                            </ProtectedRoute>
                        } />

                        <Route path="/register" element={
                            <ProtectedRoute adminOnly={true}>
                                <Register />
                            </ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute adminOnly={true}>
                                <Settings />
                            </ProtectedRoute>
                        } />
                        <Route path="/purchases" element={
                            <ProtectedRoute adminOnly={true}>
                                <Purchases />
                            </ProtectedRoute>
                        } />
                        <Route path="/accounts" element={
                            <ProtectedRoute adminOnly={true}>
                                <Finance />
                            </ProtectedRoute>
                        } />
                        <Route path="/hr" element={
                            <ProtectedRoute adminOnly={true}>
                                <HR />
                            </ProtectedRoute>
                        } />
                        <Route path="/customers" element={
                            <ProtectedRoute>
                                <Contacts type="Customer" />
                            </ProtectedRoute>
                        } />
                        <Route path="/suppliers" element={
                            <ProtectedRoute adminOnly={true}>
                                <Contacts type="Supplier" />
                            </ProtectedRoute>
                        } />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
