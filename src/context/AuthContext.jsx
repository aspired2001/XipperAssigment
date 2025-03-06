import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/utils';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios defaults when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Load user data if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/auth/profile`);
                setUser(response.data.user);
                setError(null);
            } catch (err) {
                console.error('Failed to load user:', err);
                setToken(null);
                setUser(null);
                setError('Session expired. Please login again.');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    // Register a new user
    const register = async (email, password) => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors

            console.log('Registering with:', { email, password });
            console.log('API URL:', `${API_URL}/auth/register`);

            const response = await axios.post(`${API_URL}/auth/register`, { email, password });
            console.log('Registration response:', response.data);

            setToken(response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Login a user
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors

            console.log('Logging in with:', { email });
            console.log('API URL:', `${API_URL}/auth/login`);

            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            console.log('Login response:', response.data);

            setToken(response.data.token);
            return response.data;
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Logout a user
    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const authContextValue = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        register,
        login,
        logout,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};