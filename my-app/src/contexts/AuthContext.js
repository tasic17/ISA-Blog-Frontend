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
        // Check if running in browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                    localStorage.removeItem('user');
                }
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (credentials) => {
        try {
            const response = await authAPI.signIn(credentials);
            const { accessToken, refreshToken, user } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            }

            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const signUp = async (userData) => {
        try {
            console.log('AuthContext: Attempting to register with data:', userData);
            
            // Make sure all required fields are present
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                console.error('Missing required fields for registration');
                return {
                    success: false,
                    error: 'All required fields must be provided'
                };
            }
            
            const response = await authAPI.signUp(userData);
            console.log('Registration successful, response:', response);
            
            const { accessToken, refreshToken, user } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            }

            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response);
            
            let errorMessage = 'Registration failed';
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Invalid registration data. Please check your information.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Email already exists. Please use a different email.';
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
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