import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';

// Import bootstrap CSS in a way that works with Next.js
import 'bootstrap/dist/css/bootstrap.min.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata = {
  title: 'Blog Platform',
  description: 'Blog platform for ISA project',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 