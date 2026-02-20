import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.post('/auth/login', { username, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            // userData should be { name, username, password, role }
            const { data } = await api.post('/auth/register', userData);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const isAdmin = () => user && user.role === 'Admin';
    const isManager = () => user && (user.role === 'Admin' || user.role === 'Manager');
    const isCashier = () => user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Cashier');

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, isAdmin, isManager, isCashier }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
