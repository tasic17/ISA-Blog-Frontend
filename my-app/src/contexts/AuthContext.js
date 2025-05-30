'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Function to check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    };

    // Function to load user from localStorage with token validation
    const loadUserFromStorage = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userData = localStorage.getItem('user');

            console.log('Loading from localStorage:', {
                token: !!token,
                refreshToken: !!refreshToken,
                userData: !!userData
            });

            // If no tokens, clear everything
            if (!token || !refreshToken) {
                clearStorage();
                return false;
            }

            // If access token is expired but we have refresh token, try to refresh
            if (isTokenExpired(token)) {
                console.log('Access token expired, will be refreshed by API interceptor');
                // Don't clear user data yet, let the API interceptor handle refresh
                if (userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        console.log('Parsed user (token expired):', parsedUser);
                        setUser(parsedUser);
                        return true;
                    } catch (e) {
                        console.error('Error parsing user data:', e);
                        clearStorage();
                        return false;
                    }
                }
            }

            // If access token is valid, load user
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    console.log('Parsed user:', parsedUser);
                    setUser(parsedUser);
                    return true;
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                    clearStorage();
                    return false;
                }
            }
        }
        return false;
    };

    // Function to clear all storage
    const clearStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
        setUser(null);
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

    // Function to handle logout
    const logout = () => {
        console.log('AuthContext: Logging out');
        clearStorage();
        router.push('/');
    };

    // Function to handle session expiry (called by API when refresh fails)
    const handleSessionExpiry = () => {
        console.log('AuthContext: Session expired');
        clearStorage();
        router.push('/auth/signin');
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

    // Listen for storage changes (e.g., logout in another tab)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleStorageChange = (e) => {
                if (e.key === 'accessToken' && !e.newValue) {
                    // Token was removed, logout user
                    setUser(null);
                } else if (e.key === 'user' && e.newValue) {
                    // User data was updated, refresh state
                    loadUserFromStorage();
                }
            };

            window.addEventListener('storage', handleStorageChange);
            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }
    }, []);

    const value = {
        user,
        loading,
        logout,
        isAuthenticated,
        hasRole,
        isAuthor,
        isAdmin,
        updateUserState,
        handleSessionExpiry,
    };

    console.log('AuthContext render:', {
        user: !!user,
        loading,
        isAuthenticated: isAuthenticated()
    });

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