'use client';

import { useState } from 'react';
import { Container, Button, Alert } from 'reactstrap';
import ClientLayout from '../ClientLayout';

export default function DebugPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testBackendConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const content = () => {
    return (
      <Container className="py-5">
        <h1>Debug Page</h1>
        
        <div className="my-4">
          <Button 
            color="primary" 
            onClick={testBackendConnection}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Backend Connection'}
          </Button>
        </div>
        
        {error && (
          <Alert color="danger" className="my-3">
            Error: {error}
          </Alert>
        )}
        
        {result && (
          <div className="my-3">
            <h3>API Response:</h3>
            <pre className="bg-light p-3 border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Container>
    );
  };

  return <ClientLayout>{content()}</ClientLayout>;
} 