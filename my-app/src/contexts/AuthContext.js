'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Function to load user from localStorage
    const loadUserFromStorage = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');

            console.log('Loading from localStorage:', { token: !!token, userData: !!userData });

            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    console.log('Parsed user:', parsedUser);
                    setUser(parsedUser);
                    return true;
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    return false;
                }
            }
        }
        return false;
    };

    useEffect(() => {
        console.log('AuthContext: Initial load');
        loadUserFromStorage();
        setLoading(false);
    }, []);

    // Function to manually update user state (call this after login/register)
    const updateUserState = () => {
        console.log('AuthContext: Updating user state');
        loadUserFromStorage();
    };

    const logout = () => {
        console.log('AuthContext: Logging out');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        setUser(null);
        router.push('/');
    };

    const isAuthenticated = () => {
        const result = !!user;
        console.log('AuthContext: isAuthenticated?', result, user);
        return result;
    };

    const hasRole = (role) => {
        const result = user?.roles?.includes(role);
        console.log('AuthContext: hasRole?', role, result, user?.roles);
        return result;
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
        logout,
        isAuthenticated,
        hasRole,
        isAuthor,
        isAdmin,
        updateUserState, // Export this so components can call it after login
    };

    console.log('AuthContext render:', { user: !!user, loading, isAuthenticated: isAuthenticated() });

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