'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
    const { user, isAuthenticated, isAuthor, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImageUrl: '',
        categoryId: '',
        tagNames: '',
        publish: false
    });
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !isAuthor())) {
            router.push('/');
        }
    }, [loading, isAuthenticated, isAuthor, router]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Ukloni grešku kada korisnik počne da kuca
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !formData.categoryId) {
            setError('Molimo popunite sva obavezna polja');
            return;
        }

        // Validacija naslova
        if (formData.title.trim().length < 3) {
            setError('Naslov mora imati najmanje 3 karaktera');
            return;
        }

        if (formData.content.trim().length < 10) {
            setError('Sadržaj mora imati najmanje 10 karaktera');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                excerpt: formData.excerpt.trim() || '',
                featuredImageUrl: formData.featuredImageUrl.trim() || '',
                categoryId: parseInt(formData.categoryId),
                tagNames: formData.tagNames ? formData.tagNames.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
                publish: formData.publish
            };

            console.log('Creating post:', postData);

            const response = await fetch('http://localhost:8080/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            const result = await response.json();
            console.log('Post creation response:', result);

            if (!response.ok) {
                // Proveri različite tipove grešaka
                if (result?.detail) {
                    throw new Error(result.detail);
                } else if (response.status === 400) {
                    throw new Error('Podaci nisu ispravno uneti. Molimo proverite formu i pokušajte ponovo.');
                } else if (response.status === 401) {
                    throw new Error('Nemate dozvolu za kreiranje postova. Molimo prijavite se ponovo.');
                } else if (response.status === 403) {
                    throw new Error('Nemate potrebne privilegije za kreiranje postova.');
                } else {
                    throw new Error(`Greška ${response.status}: ${response.statusText || 'Neočekivana greška'}`);
                }
            }

            setSuccess(true);

            // Redirect to posts page after success
            setTimeout(() => {
                router.push('/posts');
            }, 2000);

        } catch (err) {
            console.error('Error creating post:', err);

            // Specifične poruke za različite greške
            let errorMessage = err.message;

            if (errorMessage.includes('već postoji') || errorMessage.includes('Duplicate')) {
                errorMessage = 'Već postoji post sa sličnim naslovom. Molimo promenite naslov posta.';
            } else if (errorMessage.includes('ValidationException')) {
                errorMessage = 'Podaci nisu ispravno uneti. Molimo proverite formu.';
            } else if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
                errorMessage = 'Greška u komunikaciji sa serverom. Molimo proverite internet konekciju.';
            } else if (!errorMessage || errorMessage === 'Failed to fetch') {
                errorMessage = 'Neočekivana greška prilikom kreiranja posta. Molimo pokušajte ponovo.';
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
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

    if (!isAuthenticated() || !isAuthor()) {
        return null; // Will redirect
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">
                        <h3>Kreiraj Novi Post</h3>
                    </div>
                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger alert-dismissible" role="alert">
                                <i className="fa fa-exclamation-triangle me-2"></i>
                                {error}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setError(null)}
                                    aria-label="Close"
                                ></button>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                <i className="fa fa-check-circle me-2"></i>
                                Post je uspešno kreiran! Preusmeravanje...
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">
                                    Naslov <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${error && error.includes('naslov') ? 'is-invalid' : ''}`}
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    minLength="3"
                                    maxLength="255"
                                    placeholder="Unesite privlačan naslov za vaš post..."
                                />
                                <small className="form-text text-muted">
                                    Naslov mora biti jedinstven i imati najmanje 3 karaktera
                                </small>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="excerpt" className="form-label">
                                    Kratak opis
                                </label>
                                <textarea
                                    className="form-control"
                                    id="excerpt"
                                    name="excerpt"
                                    rows="2"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    maxLength="500"
                                    placeholder="Kratki opis koji će se prikazati u pregledu posta..."
                                />
                                <small className="form-text text-muted">
                                    Maksimalno 500 karaktera
                                </small>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="content" className="form-label">
                                    Sadržaj <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="content"
                                    name="content"
                                    rows="12"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    minLength="10"
                                    placeholder="Napišite sadržaj vašeg posta..."
                                />
                                <small className="form-text text-muted">
                                    Minimum 10 karaktera
                                </small>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="categoryId" className="form-label">
                                            Kategorija <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-control"
                                            id="categoryId"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Izaberite kategoriju</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="tagNames" className="form-label">
                                            Tagovi
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="tagNames"
                                            name="tagNames"
                                            value={formData.tagNames}
                                            onChange={handleChange}
                                            placeholder="React, JavaScript, Tutorial"
                                        />
                                        <small className="form-text text-muted">
                                            Odvojite tagove zarezom (maksimalno 10 tagova)
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="featuredImageUrl" className="form-label">
                                    URL slike
                                </label>
                                <input
                                    type="url"
                                    className="form-control"
                                    id="featuredImageUrl"
                                    name="featuredImageUrl"
                                    value={formData.featuredImageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <small className="form-text text-muted">
                                    Dodajte sliku koja predstavlja vaš post
                                </small>
                            </div>

                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="publish"
                                    name="publish"
                                    checked={formData.publish}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="publish">
                                    <strong>Objavi odmah</strong> (inače će biti sačuvan kao draft)
                                </label>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {formData.publish ? 'Objavljivanje...' : 'Čuvanje...'}
                                        </>
                                    ) : (
                                        formData.publish ? 'Objavi Post' : 'Sačuvaj kao Draft'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => router.push('/posts')}
                                >
                                    Otkaži
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}