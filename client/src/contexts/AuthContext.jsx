import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    // Set up axios interceptor or headers for API calls
    const getAuthHeaders = () => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const { token: newToken, user: userData } = data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('authToken', newToken);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (email, password, username) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            const { token: newToken, user: userData } = data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('authToken', newToken);

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
        }
    };

    // Check if user is authenticated on app load
    const checkAuth = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // Token is invalid, clear it
                setToken(null);
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setToken(null);
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getAuthHeaders,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};