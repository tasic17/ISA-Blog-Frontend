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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !formData.categoryId) {
            setError('Molimo popunite sva obavezna polja');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const postData = {
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt || '',
                featuredImageUrl: formData.featuredImageUrl || '',
                categoryId: parseInt(formData.categoryId),
                tagNames: formData.tagNames ? formData.tagNames.split(',').map(tag => tag.trim()) : [],
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
                throw new Error(result?.detail || `HTTP Error: ${response.status}`);
            }

            setSuccess(true);

            // Redirect to posts page after success
            setTimeout(() => {
                router.push('/posts');
            }, 2000);

        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.message || 'Greška prilikom kreiranja posta');
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
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
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
                                    className="form-control"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
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
                                    placeholder="Kratki opis posta..."
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="content" className="form-label">
                                    Sadržaj <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="content"
                                    name="content"
                                    rows="10"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    placeholder="Napišite sadržaj vašeg posta..."
                                />
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
                                            placeholder="tag1, tag2, tag3"
                                        />
                                        <small className="form-text text-muted">
                                            Odvojite tagove zarezom
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
                            </div>

                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="publish"
                                    name="publish"
                                    checked={formData.publish}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="publish">
                                    Objavi odmah (inače će biti sačuvan kao draft)
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
                                            Kreiraju se...
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