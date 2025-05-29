'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { postsAPI, categoriesAPI } from '@/core/api';
import PostCard from '@/components/PostCard/PostCard';
import {
    Container,
    Row,
    Col,
    Spinner,
    Alert,
    Pagination,
    PaginationItem,
    PaginationLink
} from 'reactstrap';

export default function CategoryDetail() {
    const params = useParams();
    const categoryId = params.id;

    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (categoryId) {
            fetchData();
        }
    }, [categoryId, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoryRes, postsRes] = await Promise.all([
                categoriesAPI.getById(categoryId),
                postsAPI.getByCategory(categoryId, { page, size: 9 })
            ]);

            setCategory(categoryRes.data);
            setPosts(postsRes.data.posts);
            setTotalPages(postsRes.data.totalPages);
        } catch (err) {
            setError('Greška pri učitavanju podataka');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    if (loading && !category) {
        return (
            <div className="text-center py-5">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <Alert color="danger">{error}</Alert>;
    }

    return (
        <>
            {category && (
                <div className="mb-4">
                    <h1>{category.name}</h1>
                    {category.description && (
                        <p className="lead">{category.description}</p>
                    )}
                </div>
            )}

            {posts.length > 0 ? (
                <>
                    <Row>
                        {posts.map(post => (
                            <Col key={post.id} md={6} lg={4} className="mb-4">
                                <PostCard post={post} />
                            </Col>
                        ))}
                    </Row>

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
                <Alert color="info">
                    Još uvek nema postova u ovoj kategoriji.
                </Alert>
            )}
        </>
    );
}