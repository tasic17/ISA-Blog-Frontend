'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
    const router = useRouter();
    const { updateUserState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Login form submitted with data:', formData);

        if (!formData.email || !formData.password) {
            setError('Molimo unesite email i lozinku');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Sending login request...');

            const response = await fetch('http://localhost:8080/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            console.log('Response status:', response.status);

            let result = null;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
            }

            console.log('Response data:', result);

            if (!response.ok) {
                throw new Error(result?.detail || `HTTP Error: ${response.status}`);
            }

            // Store user data in localStorage
            if (typeof window !== 'undefined' && result) {
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                // VAŽNO: Ažurirati AuthContext
                updateUserState();

                setSuccess(true);
                console.log('Login successful, redirecting...');

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Greška prilikom prijave. Pokušajte ponovo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-center mb-4">Prijavi se</h2>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                Uspešna prijava! Preusmeravanje...
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Lozinka <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mt-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Prijava...
                                    </>
                                ) : (
                                    'Prijavi se'
                                )}
                            </button>
                        </form>

                        <hr className="my-4" />

                        <p className="text-center mb-0">
                            Nemate nalog?{' '}
                            <Link href="/auth/signup">
                                Registrujte se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}