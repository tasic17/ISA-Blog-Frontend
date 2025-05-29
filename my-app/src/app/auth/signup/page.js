'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
    const router = useRouter();
    const { updateUserState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Simple form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: ''
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

        console.log('Form submitted with data:', formData);

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Molimo popunite sva obavezna polja');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Lozinke se ne poklapaju');
            return;
        }

        if (formData.password.length < 6) {
            setError('Lozinka mora imati najmanje 6 karaktera');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                contactNumber: formData.contactNumber || '',
                password: formData.password
            };

            console.log('Sending to backend:', userData);

            const response = await fetch('http://localhost:8080/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
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
                console.log('Registration successful, redirecting...');

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Greška prilikom registracije. Pokušajte ponovo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-center mb-4">Registruj se</h2>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                Uspešna registracija! Preusmeravanje...
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label">
                                            Ime <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">
                                            Prezime <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

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
                                <label htmlFor="contactNumber" className="form-label">
                                    Broj telefona
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-6">
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
                                            minLength="6"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Potvrdi lozinku <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mt-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Registracija...
                                    </>
                                ) : (
                                    'Registruj se'
                                )}
                            </button>
                        </form>

                        <hr className="my-4" />

                        <p className="text-center mb-0">
                            Već imate nalog?{' '}
                            <Link href="/auth/signin">
                                Prijavite se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}