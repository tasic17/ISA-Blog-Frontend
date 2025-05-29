'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function RootLayout({ children }) {
  return (
      <html lang="sr">
      <body>
      <AuthProvider>
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
      </body>
      </html>
  );
}