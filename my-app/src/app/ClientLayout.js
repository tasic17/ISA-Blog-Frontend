'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { BootstrapClient } from './bootstrap';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <BootstrapClient />
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <div className="container py-4">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
} 