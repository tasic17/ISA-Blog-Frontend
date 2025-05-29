'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardTitle, Alert } from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function TestPage() {
    const [pingResult, setPingResult] = useState(null);
    const [echoResult, setEchoResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testPing = async () => {
        setLoading(true);
        setError(null);
        setPingResult(null);
        
        try {
            const response = await fetch('http://localhost:8080/test/ping');
            console.log('Ping response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Ping response data:', data);
            setPingResult(data);
        } catch (err) {
            console.error('Ping error:', err);
            setError(`Ping failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testEcho = async () => {
        setLoading(true);
        setError(null);
        setEchoResult(null);
        
        try {
            const testData = {
                message: 'Hello from frontend',
                timestamp: new Date().toISOString()
            };
            
            const response = await fetch('http://localhost:8080/test/echo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            console.log('Echo response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Echo response data:', data);
            setEchoResult(data);
        } catch (err) {
            console.error('Echo error:', err);
            setError(`Echo failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testSignup = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const testUser = {
                firstName: "Test",
                lastName: "User",
                email: `test${Math.floor(Math.random() * 10000)}@example.com`,
                contactNumber: "1234567890",
                password: "password123"
            };
            
            console.log('Sending test signup data:', testUser);
            
            const response = await fetch('http://localhost:8080/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testUser)
            });
            
            console.log('Signup response status:', response.status);
            
            const data = await response.json().catch(() => null);
            console.log('Signup response data:', data);
            
            if (!response.ok) {
                throw new Error(data?.detail || `Error: ${response.status}`);
            }
            
            setPingResult({ message: 'Signup successful!' });
        } catch (err) {
            console.error('Signup error:', err);
            setError(`Signup failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h1>API Test Page</h1>
            <p className="lead">Use this page to test the backend API connectivity</p>
            
            {error && <CustomAlert color="danger">{error}</CustomAlert>}
            
            <div className="d-flex gap-3 mb-4">
                <Button color="primary" onClick={testPing} disabled={loading}>
                    Test Ping
                </Button>
                <Button color="info" onClick={testEcho} disabled={loading}>
                    Test Echo
                </Button>
                <Button color="success" onClick={testSignup} disabled={loading}>
                    Test Signup
                </Button>
            </div>
            
            {pingResult && (
                <Card className="mb-3">
                    <CardBody>
                        <CardTitle tag="h5">Ping Result</CardTitle>
                        <pre>{JSON.stringify(pingResult, null, 2)}</pre>
                    </CardBody>
                </Card>
            )}
            
            {echoResult && (
                <Card>
                    <CardBody>
                        <CardTitle tag="h5">Echo Result</CardTitle>
                        <pre>{JSON.stringify(echoResult, null, 2)}</pre>
                    </CardBody>
                </Card>
            )}
        </div>
    );
} 