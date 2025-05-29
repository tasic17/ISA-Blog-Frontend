'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    Table,
    Badge,
    Button,
    Spinner,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function AdminDashboard() {
    const { user, isAuthenticated, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !isAdmin())) {
            router.push('/');
        }
    }, [loading, isAuthenticated, isAdmin, router]);

    useEffect(() => {
        if (user && isAdmin()) {
            fetchStats();
        }
    }, [user, isAdmin]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8080/api/admin/posts/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError('Greška pri učitavanju statistika');
            console.error('Error fetching stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8080/api/admin/users?size=10', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            setError('Greška pri učitavanju korisnika');
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8080/api/admin/posts?size=10', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data.posts);
        } catch (err) {
            setError('Greška pri učitavanju postova');
            console.error('Error fetching posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleUserRoleChange = async (userId, roleName, action) => {
        try {
            const token = localStorage.getItem('accessToken');
            const method = action === 'add' ? 'POST' : 'DELETE';
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/roles?roleName=${roleName}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            fetchUsers(); // Refresh users list
        } catch (err) {
            setError('Greška pri ažuriranju rola');
            console.error('Error updating user role:', err);
        }
    };

    const handlePostStatusChange = async (postId, newStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/admin/posts/${postId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update post status');
            }

            fetchPosts(); // Refresh posts list
        } catch (err) {
            setError('Greška pri ažuriranju statusa posta');
            console.error('Error updating post status:', err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            fetchUsers(); // Refresh users list
        } catch (err) {
            setError('Greška pri brisanju korisnika');
            console.error('Error deleting user:', err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            fetchPosts(); // Refresh posts list
        } catch (err) {
            setError('Greška pri brisanju posta');
            console.error('Error deleting post:', err);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated() || !isAdmin()) {
        return null;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Admin Dashboard</h1>
            </div>

            {error && <CustomAlert color="danger">{error}</CustomAlert>}

            <Nav tabs className="mb-4">
                <NavItem>
                    <NavLink
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                        style={{ cursor: 'pointer' }}
                    >
                        Pregled
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                        style={{ cursor: 'pointer' }}
                    >
                        Korisnici
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === 'posts' ? 'active' : ''}
                        onClick={() => setActiveTab('posts')}
                        style={{ cursor: 'pointer' }}
                    >
                        Postovi
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="overview">
                    <Row>
                        <Col md={3}>
                            <Card className="text-center">
                                <CardBody>
                                    <CardTitle>Ukupno Postova</CardTitle>
                                    <h2 className="text-primary">
                                        {loadingStats ? <Spinner size="sm" /> : stats.totalPosts || 0}
                                    </h2>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center">
                                <CardBody>
                                    <CardTitle>Objavljeni</CardTitle>
                                    <h2 className="text-success">
                                        {loadingStats ? <Spinner size="sm" /> : stats.publishedPosts || 0}
                                    </h2>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center">
                                <CardBody>
                                    <CardTitle>Draft</CardTitle>
                                    <h2 className="text-warning">
                                        {loadingStats ? <Spinner size="sm" /> : stats.draftPosts || 0}
                                    </h2>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center">
                                <CardBody>
                                    <CardTitle>Arhivirani</CardTitle>
                                    <h2 className="text-secondary">
                                        {loadingStats ? <Spinner size="sm" /> : stats.archivedPosts || 0}
                                    </h2>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tabId="users">
                    <Card>
                        <CardBody>
                            <CardTitle>Upravljanje Korisnicima</CardTitle>
                            {loadingUsers ? (
                                <div className="text-center py-3">
                                    <Spinner />
                                </div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Ime</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Datum registracije</th>
                                        <th>Akcije</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {user.roles?.map(role => (
                                                    <Badge key={role} color="primary" className="me-1">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString('sr-RS')}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    {!user.roles?.includes('AUTHOR') && (
                                                        <Button
                                                            size="sm"
                                                            color="success"
                                                            onClick={() => handleUserRoleChange(user.id, 'AUTHOR', 'add')}
                                                        >
                                                            + Author
                                                        </Button>
                                                    )}
                                                    {user.roles?.includes('AUTHOR') && (
                                                        <Button
                                                            size="sm"
                                                            color="warning"
                                                            onClick={() => handleUserRoleChange(user.id, 'AUTHOR', 'remove')}
                                                        >
                                                            - Author
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        Obriši
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </TabPane>

                <TabPane tabId="posts">
                    <Card>
                        <CardBody>
                            <CardTitle>Upravljanje Postovima</CardTitle>
                            {loadingPosts ? (
                                <div className="text-center py-3">
                                    <Spinner />
                                </div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Naslov</th>
                                        <th>Autor</th>
                                        <th>Status</th>
                                        <th>Datum kreiranja</th>
                                        <th>Pregledi</th>
                                        <th>Akcije</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {posts.map(post => (
                                        <tr key={post.id}>
                                            <td>
                                                <Link href={`/posts/${post.slug}`} className="text-decoration-none">
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td>{post.authorName}</td>
                                            <td>
                                                <Badge color={
                                                    post.status === 'PUBLISHED' ? 'success' :
                                                        post.status === 'DRAFT' ? 'warning' : 'secondary'
                                                }>
                                                    {post.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(post.createdAt).toLocaleDateString('sr-RS')}</td>
                                            <td>{post.views}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    {post.status !== 'PUBLISHED' && (
                                                        <Button
                                                            size="sm"
                                                            color="success"
                                                            onClick={() => handlePostStatusChange(post.id, 'PUBLISHED')}
                                                        >
                                                            Objavi
                                                        </Button>
                                                    )}
                                                    {post.status !== 'ARCHIVED' && (
                                                        <Button
                                                            size="sm"
                                                            color="secondary"
                                                            onClick={() => handlePostStatusChange(post.id, 'ARCHIVED')}
                                                        >
                                                            Arhiviraj
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onClick={() => handleDeletePost(post.id)}
                                                    >
                                                        Obriši
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </TabPane>
            </TabContent>
        </>
    );}