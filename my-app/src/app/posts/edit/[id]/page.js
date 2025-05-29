// my-app/src/app/posts/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { postsAPI, categoriesAPI } from '@/core/api';

export default function EditPost() {
    const { user, isAuthenticated, isAuthor, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const postId = params.id;

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
    const [loadingPost, setLoadingPost] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !isAuthor())) {
            router.push('/');
        }
    }, [loading, isAuthenticated, isAuthor, router]);

    useEffect(() => {
        if (postId) {
            fetchPost();
            fetchCategories();
        }
    }, [postId]);

    const fetchPost = async () => {
        try {
            const response = await postsAPI.getById(postId);
            const post = response.data;

            setFormData({
                title: post.title || '',
                content: post.content || '',
                excerpt: post.excerpt || '',
                featuredImageUrl: post.featuredImageUrl || '',
                categoryId: post.categoryId || '',
                tagNames: post.tagNames?.join(', ') || '',
                publish: post.status === 'PUBLISHED'
            });
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Greška pri učitavanju posta');
        } finally {
            setLoadingPost(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
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
            const postData = {
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt || '',
                featuredImageUrl: formData.featuredImageUrl || '',
                categoryId: parseInt(formData.categoryId),
                tagNames: formData.tagNames ? formData.tagNames.split(',').map(tag => tag.trim()) : [],
                publish: formData.publish
            };

            const response = await postsAPI.update(postId, postData);
            setSuccess(true);

            setTimeout(() => {
                router.push('/posts/my-posts');
            }, 2000);

        } catch (err) {
            console.error('Error updating post:', err);
            setError(err.message || 'Greška prilikom ažuriranja posta');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || loadingPost) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated() || !isAuthor()) {
        return null;
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">
                        <h3>Uredi Post</h3>
                    </div>
                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                Post je uspešno ažuriran! Preusmeravanje...
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
                                    Objavi (inače će biti sačuvan kao draft)
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
                                            Ažuriranje...
                                        </>
                                    ) : (
                                        'Ažuriraj Post'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => router.push('/posts/my-posts')}
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