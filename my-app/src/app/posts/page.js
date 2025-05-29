'use client';

import { useEffect, useState } from 'react';
import { postsAPI, categoriesAPI } from '@/core/api';
import PostCard from '@/components/PostCard/PostCard';
import {
    Container,
    Row,
    Col,
    Spinner,
    Alert,
    Input,
    Button,
    ButtonGroup,
    Pagination,
    PaginationItem,
    PaginationLink
} from 'reactstrap';

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('publishedAt');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [page, sortBy, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let response;

            if (selectedCategory) {
                response = await postsAPI.getByCategory(selectedCategory, {
                    page,
                    size: 9,
                    sortBy
                });
            } else {
                response = await postsAPI.getAll({
                    page,
                    size: 9,
                    sortBy
                });
            }

            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Greška pri učitavanju postova');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            fetchPosts();
            return;
        }

        setLoading(true);
        try {
            const response = await postsAPI.search(search, {
                page: 0,
                size: 9
            });
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
            setPage(0);
        } catch (err) {
            setError('Greška pri pretraživanju');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="text-center py-5">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <h1 className="mb-4">Svi postovi</h1>

            {/* Filteri i pretraga */}
            <Row className="mb-4">
                <Col md={4}>
                    <div className="input-group">
                        <Input
                            type="text"
                            placeholder="Pretraži postove..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button color="primary" onClick={handleSearch}>
                            Pretraži
                        </Button>
                    </div>
                </Col>

                <Col md={4}>
                    <Input
                        type="select"
                        value={selectedCategory || ''}
                        onChange={(e) => handleCategoryChange(e.target.value || null)}
                    >
                        <option value="">Sve kategorije</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} ({cat.postCount})
                            </option>
                        ))}
                    </Input>
                </Col>

                <Col md={4}>
                    <ButtonGroup>
                        <Button
                            color={sortBy === 'publishedAt' ? 'primary' : 'outline-primary'}
                            onClick={() => setSortBy('publishedAt')}
                        >
                            Najnoviji
                        </Button>
                        <Button
                            color={sortBy === 'views' ? 'primary' : 'outline-primary'}
                            onClick={() => setSortBy('views')}
                        >
                            Najpopularniji
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {error && <Alert color="danger">{error}</Alert>}

            {/* Lista postova */}
            {posts.length > 0 ? (
                <>
                    <Row>
                        {posts.map(post => (
                            <Col key={post.id} md={6} lg={4} className="mb-4">
                                <PostCard post={post} />
                            </Col>
                        ))}
                    </Row>

                    {/* Paginacija */}
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
                    {search ? 'Nema rezultata za vašu pretragu.' : 'Još uvek nema objavljenih postova.'}
                </Alert>
            )}
        </>
    );
}