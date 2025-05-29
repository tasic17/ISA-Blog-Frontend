'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postsAPI } from '@/core/api';
import Link from 'next/link';

export default function Profile() {
    const { user, isAuthenticated, loading, updateUserState } = useAuth();
    const router = useRouter();
    const [userStats, setUserStats] = useState({
        publishedPosts: 0,
        totalComments: 0,
        totalLikes: 0
    });
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        bio: '',
        profilePictureUrl: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/auth/signin');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
                bio: user.bio || '',
                profilePictureUrl: user.profilePictureUrl || ''
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        if (!user) return;

        try {
            // Fetch user's posts statistics
            const response = await postsAPI.getMyPosts({ page: 0, size: 1000, status: 'all' });
            const publishedCount = response.data.posts.filter(post => post.status === 'PUBLISHED').length;

            setUserStats({
                publishedPosts: publishedCount,
                totalComments: 0, // TODO: implement when comments API is ready
                totalLikes: response.data.posts.reduce((sum, post) => sum + (post.likesCount || 0), 0)
            });
        } catch (err) {
            console.error('Error fetching user stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        setError('');
        setSuccess('');
        if (!editMode) {
            // Reset form data when entering edit mode
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
                bio: user.bio || '',
                profilePictureUrl: user.profilePictureUrl || ''
            });
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName) {
            setError('Ime i prezime su obavezni');
            return;
        }

        setSavingProfile(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Greška prilikom ažuriranja profila');
            }

            const updatedUser = await response.json();

            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            updateUserState();

            setSuccess('Profil je uspešno ažuriran');
            setEditMode(false);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Sva polja za lozinku su obavezna');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Nova lozinka i potvrda se ne poklapaju');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Nova lozinka mora imati najmanje 6 karaktera');
            return;
        }

        setChangingPassword(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Greška prilikom promene lozinke');
            }

            setSuccess('Lozinka je uspešno promenjena');
            setChangePasswordMode(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setChangingPassword(false);
        }
    };

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
        return null;
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-10">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h3>Moj Profil</h3>
                        <div>
                            {!editMode && !changePasswordMode && (
                                <>
                                    <button className="btn btn-outline-primary me-2" onClick={handleEditToggle}>
                                        Uredi Profil
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => setChangePasswordMode(true)}
                                    >
                                        Promeni Lozinku
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
                        {!editMode && !changePasswordMode ? (
                            // View Mode
                            <div className="row">
                                <div className="col-md-3 text-center">
                                    <div className="mb-3">
                                        {user.profilePictureUrl ? (
                                            <img
                                                src={user.profilePictureUrl}
                                                alt="Profile"
                                                className="rounded-circle"
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto"
                                                style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}
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
                        ) : editMode ? (
                            // Edit Profile Mode
                            <form onSubmit={handleSaveProfile}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Ime *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Prezime *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Broj telefona</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Biografija</label>
                                    <textarea
                                        className="form-control"
                                        name="bio"
                                        rows="3"
                                        value={formData.bio}
                                        onChange={handleFormChange}
                                        placeholder="Napišite nešto o sebi..."
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">URL profilne slike</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        name="profilePictureUrl"
                                        value={formData.profilePictureUrl}
                                        onChange={handleFormChange}
                                        placeholder="https://example.com/slika.jpg"
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Čuvanje...
                                            </>
                                        ) : (
                                            'Sačuvaj izmene'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleEditToggle}
                                    >
                                        Otkaži
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // Change Password Mode
                            <form onSubmit={handleChangePassword}>
                                <h5 className="mb-3">Promena lozinke</h5>

                                <div className="mb-3">
                                    <label className="form-label">Trenutna lozinka *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nova lozinka *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        minLength="6"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Potvrdi novu lozinku *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Menjanje...
                                            </>
                                        ) : (
                                            'Promeni lozinku'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setChangePasswordMode(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setError('');
                                        }}
                                    >
                                        Otkaži
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* User Statistics */}
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Objavljeni Postovi</h5>
                                {loadingStats ? (
                                    <div className="spinner-border text-primary" role="status"></div>
                                ) : (
                                    <h2 className="text-primary">{userStats.publishedPosts}</h2>
                                )}
                                <Link href="/posts/my-posts" className="btn btn-sm btn-outline-primary mt-2">
                                    Vidi sve
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Komentari</h5>
                                <h2 className="text-success">{userStats.totalComments}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">Ukupno Lajkova</h5>
                                <h2 className="text-danger">{userStats.totalLikes}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}