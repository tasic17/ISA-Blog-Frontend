'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postsAPI } from '@/core/api';
import Link from 'next/link';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    CardText,
    Badge,
    Button,
    ButtonGroup,
    Spinner,
    Pagination,
    PaginationItem,
    PaginationLink
} from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function MyPosts() {
    const { user, isAuthenticated, loading, isAuthor } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !isAuthor())) {
            router.push('/');
        }
    }, [loading, isAuthenticated, isAuthor, router]);

    useEffect(() => {
        if (user && isAuthenticated() && isAuthor()) {
            fetchMyPosts();
        }
    }, [user, statusFilter, page]);

    const fetchMyPosts = async () => {
        setLoadingPosts(true);
        try {
            const response = await postsAPI.getMyPosts({
                page,
                size: 10,
                status: statusFilter
            });

            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Greška pri učitavanju postova');
            console.error('Error fetching my posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
            return;
        }

        setDeleting(postId);
        try {
            await postsAPI.delete(postId);
            fetchMyPosts(); // Refresh the list
        } catch (err) {
            setError('Greška pri brisanju posta');
            console.error('Error deleting post:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'success';
            case 'DRAFT': return 'warning';
            case 'ARCHIVED': return 'secondary';
            default: return 'light';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'Objavljeno';
            case 'DRAFT': return 'Draft';
            case 'ARCHIVED': return 'Arhivirano';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated() || !isAuthor()) {
        return null;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Moji Postovi</h1>
                <Link href="/posts/create" className="btn btn-primary">
                    Novi Post
                </Link>
            </div>

            {/* Status Filters */}
            <div className="mb-4">
                <ButtonGroup>
                    <Button
                        color={statusFilter === 'all' ? 'primary' : 'outline-primary'}
                        onClick={() => handleStatusFilterChange('all')}
                    >
                        Svi
                    </Button>
                    <Button
                        color={statusFilter === 'published' ? 'primary' : 'outline-primary'}
                        onClick={() => handleStatusFilterChange('published')}
                    >
                        Objavljeni
                    </Button>
                    <Button
                        color={statusFilter === 'draft' ? 'primary' : 'outline-primary'}
                        onClick={() => handleStatusFilterChange('draft')}
                    >
                        Draft
                    </Button>
                </ButtonGroup>
            </div>

            {error && <CustomAlert color="danger">{error}</CustomAlert>}

            {loadingPosts ? (
                <div className="text-center py-5">
                    <Spinner size="lg" />
                </div>
            ) : posts.length > 0 ? (
                <>
                    <Row>
                        {posts.map(post => (
                            <Col key={post.id} md={6} lg={4} className="mb-4">
                                <Card className="h-100">
                                    {post.featuredImageUrl && (
                                        <img
                                            src={post.featuredImageUrl}
                                            alt={post.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardBody className="d-flex flex-column">
                                        <div className="mb-2">
                                            <Badge color={getStatusBadgeColor(post.status)} className="me-2">
                                                {getStatusText(post.status)}
                                            </Badge>
                                            <Badge color="light" className="me-2">
                                                {post.categoryName}
                                            </Badge>
                                            <small className="text-muted">
                                                {new Date(post.createdAt).toLocaleDateString('sr-RS')}
                                            </small>
                                        </div>

                                        <CardTitle tag="h5" className="mb-2">
                                            {post.title}
                                        </CardTitle>

                                        <CardText className="flex-grow-1">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                        </CardText>

                                        <div className="mb-3">
                                            <small className="text-muted">
                                                👁 {post.views} | ❤ {post.likesCount} | 💬 {post.commentsCount}
                                            </small>
                                        </div>

                                        <div className="d-flex gap-2 mt-auto">
                                            {post.status === 'PUBLISHED' && (
                                                <Link
                                                    href={`/posts/${post.slug}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Pogledaj
                                                </Link>
                                            )}
                                            <Link
                                                href={`/posts/edit/${post.id}`}
                                                className="btn btn-sm btn-outline-secondary"
                                            >
                                                Uredi
                                            </Link>
                                            <Button
                                                size="sm"
                                                color="outline-danger"
                                                onClick={() => handleDelete(post.id)}
                                                disabled={deleting === post.id}
                                            >
                                                {deleting === post.id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    'Obriši'
                                                )}
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <PaginationItem disabled={page === 0}>
                                    <PaginationLink
                                        previous
                                        onClick={() => handlePageChange(page - 1)}
                                    />
                                </PaginationItem>

                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i} active={i === page}>
                                        <PaginationLink onClick={() => handlePageChange(i)}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem disabled={page === totalPages - 1}>
                                    <PaginationLink
                                        next
                                        onClick={() => handlePageChange(page + 1)}
                                    />
                                </PaginationItem>
                            </Pagination>
                        </div>
                    )}
                </>
            ) : (
                <CustomAlert color="info">
                    {statusFilter === 'all'
                        ? 'Još uvek nemate postova. Kreirajte svoj prvi post!'
                        : `Nemate postova sa statusom "${getStatusText(statusFilter.toUpperCase())}".`
                    }
                    <div className="mt-2">
                        <Link href="/posts/create" className="btn btn-primary">
                            Kreiraj novi post
                        </Link>
                    </div>
                </CustomAlert>
            )}
        </>
    );
}