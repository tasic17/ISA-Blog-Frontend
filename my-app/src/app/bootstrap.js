'use client';

// This file ensures Bootstrap JavaScript is loaded on the client side
import { useEffect } from 'react';

export function BootstrapClient() {
  useEffect(() => {
    // Import Bootstrap JS only on the client side
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
} 