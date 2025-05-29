'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Profile() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/auth/signin');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">
                        <h3>Moj Profil</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3 text-center">
                                <div className="mb-3">
                                    {user.profilePictureUrl ? (
                                        <img
                                            src={user.profilePictureUrl}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                            style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                                        >
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-9">
                                <h4>{user.firstName} {user.lastName}</h4>

                                <div className="mb-3">
                                    <strong>Email:</strong> {user.email}
                                </div>

                                {user.contactNumber && (
                                    <div className="mb-3">
                                        <strong>Telefon:</strong> {user.contactNumber}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <strong>Role:</strong>{' '}
                                    {user.roles?.map((role, index) => (
                                        <span key={role} className="badge bg-primary me-1">
                                            {role}
                                        </span>
                                    ))}
                                </div>

                                {user.bio && (
                                    <div className="mb-3">
                                        <strong>Bio:</strong>
                                        <p className="mt-1">{user.bio}</p>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <strong>Član od:</strong> {new Date(user.createdAt).toLocaleDateString('sr-RS')}
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="text-center">
                            <button className="btn btn-outline-primary me-2">
                                Uredi Profil
                            </button>
                            <button className="btn btn-outline-secondary">
                                Promeni Lozinku
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Statistics */}
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Objavljeni Postovi</h5>
                                <h2 className="text-primary">0</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Komentari</h5>
                                <h2 className="text-success">0</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Lajkovi</h5>
                                <h2 className="text-danger">0</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}