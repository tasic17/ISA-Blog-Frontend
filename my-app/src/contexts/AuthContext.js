'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/core/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, []);

    const signIn = async (credentials) => {
        try {
            const response = await authAPI.signIn(credentials);
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const signUp = async (userData) => {
        try {
            const response = await authAPI.signUp(userData);
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role);
    };

    const isAuthor = () => {
        return hasRole('AUTHOR') || hasRole('ADMIN');
    };

    const isAdmin = () => {
        return hasRole('ADMIN');
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        isAuthenticated,
        hasRole,
        isAuthor,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};