// my-app/src/app/posts/[slug]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/core/api';
import Link from 'next/link';
import {
    Container,
    Row,
    Col,
    Badge,
    Button,
    Spinner
} from 'reactstrap';
import { FaEye, FaHeart, FaEdit, FaArrowLeft } from 'react-icons/fa';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function SinglePost() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liking, setLiking] = useState(false);

    useEffect(() => {
        if (params.slug) {
            fetchPost();
        }
    }, [params.slug]);

    const fetchPost = async () => {
        try {
            const response = await postsAPI.getBySlug(params.slug);
            setPost(response.data);
        } catch (err) {
            setError('Post nije pronađen');
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated()) {
            router.push('/auth/signin');
            return;
        }

        setLiking(true);
        try {
            await postsAPI.toggleLike(post.id);
            // Refresh post to get updated like count
            fetchPost();
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLiking(false);
        }
    };

    const canEdit = isAuthenticated() && (user?.id === post?.authorId || isAdmin());

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Container>
                <CustomAlert color="danger">{error}</CustomAlert>
                <Link href="/posts" className="btn btn-primary">
                    <FaArrowLeft className="me-2" />
                    Nazad na postove
                </Link>
            </Container>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <Container>
            <Row>
                <Col md={8} className="mx-auto">
                    {/* Breadcrumb/Navigation */}
                    <div className="mb-4">
                        <Link href="/posts" className="text-decoration-none">
                            <FaArrowLeft className="me-2" />
                            Nazad na postove
                        </Link>
                    </div>

                    {/* Post Header */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <Badge color="primary" className="me-2">
                                    {post.categoryName}
                                </Badge>
                                {post.tags?.map(tag => (
                                    <Badge key={tag.id} color="secondary" className="me-1">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                            {canEdit && (
                                <div className="d-flex gap-2">
                                    <Button
                                        color="outline-primary"
                                        size="sm"
                                        onClick={() => router.push(`/posts/edit/${post.id}`)}
                                    >
                                        <FaEdit className="me-1" />
                                        Uredi
                                    </Button>
                                </div>
                            )}
                        </div>

                        <h1 className="mb-3">{post.title}</h1>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="text-muted">
                                <small>
                                    Od: <strong>{post.authorName}</strong> • {' '}
                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('sr-RS', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </small>
                            </div>

                            <div className="d-flex gap-3 text-muted">
                                <span className="d-flex align-items-center gap-1">
                                    <FaEye size={14} /> {post.views}
                                </span>
                                <span
                                    className="d-flex align-items-center gap-1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleLike}
                                >
                                    <FaHeart
                                        size={14}
                                        color={post.likedByCurrentUser ? 'red' : 'inherit'}
                                    />
                                    {liking ? <Spinner size="sm" /> : post.likesCount}
                                </span>
                            </div>
                        </div>

                        {post.excerpt && (
                            <p className="lead">{post.excerpt}</p>
                        )}
                    </div>

                    {/* Featured Image */}
                    {post.featuredImageUrl && (
                        <div className="mb-4">
                            <img
                                src={post.featuredImageUrl}
                                alt={post.title}
                                className="img-fluid rounded"
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="post-content mb-5">
                        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
                    </div>

                    {/* Post Footer */}
                    <div className="border-top pt-4 mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6>Podelite ovaj post:</h6>
                                <div className="d-flex gap-2">
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: post.title,
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link je kopiran!');
                                            }
                                        }}
                                    >
                                        Podeli
                                    </Button>
                                </div>
                            </div>

                            <div className="text-end">
                                <small className="text-muted">
                                    Poslednja izmena: {new Date(post.updatedAt).toLocaleDateString('sr-RS')}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                {post.authorProfilePicture ? (
                                    <img
                                        src={post.authorProfilePicture}
                                        alt={post.authorName}
                                        className="rounded-circle me-3"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3"
                                        style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                                    >
                                        {post.authorName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                                <div>
                                    <h6 className="mb-1">{post.authorName}</h6>
                                    <small className="text-muted">{post.authorEmail}</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Posts - možete dodati kasnije */}
                    <div className="text-center">
                        <Link href="/posts" className="btn btn-outline-primary">
                            <FaArrowLeft className="me-2" />
                            Vidi sve postove
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}