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
    const [success, setSuccess] = useState('');

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

    const makeAuthenticatedRequest = async (url, options = {}) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return response;
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        setError('');
        try {
            console.log('Fetching admin stats...');
            const response = await makeAuthenticatedRequest('http://localhost:8080/api/admin/posts/stats');
            const data = await response.json();
            console.log('Stats data:', data);
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(`Greška pri učitavanju statistika: ${err.message}`);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setError('');
        try {
            console.log('Fetching users...');
            const response = await makeAuthenticatedRequest('http://localhost:8080/api/admin/users?size=10');
            const data = await response.json();
            console.log('Users data:', data);
            setUsers(data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(`Greška pri učitavanju korisnika: ${err.message}`);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPosts = async () => {
        setLoadingPosts(true);
        setError('');
        try {
            console.log('Fetching posts...');
            const response = await makeAuthenticatedRequest('http://localhost:8080/api/admin/posts?size=10');
            const data = await response.json();
            console.log('Posts data:', data);
            setPosts(data.posts || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(`Greška pri učitavanju postova: ${err.message}`);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleUserRoleChange = async (userId, roleName, action) => {
        try {
            setError('');
            setSuccess('');

            const method = action === 'add' ? 'POST' : 'DELETE';
            await makeAuthenticatedRequest(
                `http://localhost:8080/api/admin/users/${userId}/roles?roleName=${roleName}`,
                { method }
            );

            setSuccess(`Rola ${roleName} je ${action === 'add' ? 'dodana' : 'uklonjena'}`);
            fetchUsers(); // Refresh users list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(`Greška pri ažuriranju rola: ${err.message}`);
        }
    };

    const handlePostStatusChange = async (postId, newStatus) => {
        try {
            setError('');
            setSuccess('');

            await makeAuthenticatedRequest(
                `http://localhost:8080/api/admin/posts/${postId}/status?status=${newStatus}`,
                { method: 'PUT' }
            );

            setSuccess(`Status posta je ažuriran na ${newStatus}`);
            fetchPosts(); // Refresh posts list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating post status:', err);
            setError(`Greška pri ažuriranju statusa posta: ${err.message}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            await makeAuthenticatedRequest(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            setSuccess('Korisnik je uspešno obrisan');
            fetchUsers(); // Refresh users list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(`Greška pri brisanju korisnika: ${err.message}`);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            await makeAuthenticatedRequest(`http://localhost:8080/api/admin/posts/${postId}`, {
                method: 'DELETE'
            });

            setSuccess('Post je uspešno obrisan');
            fetchPosts(); // Refresh posts list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting post:', err);
            setError(`Greška pri brisanju posta: ${err.message}`);
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
            {success && <CustomAlert color="success">{success}</CustomAlert>}

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
                                <Table responsive hover>
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
                                <Table responsive hover>
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
                                                {post.status === 'PUBLISHED' && post.slug ? (
                                                    <Link href={`/posts/${post.slug}`} className="text-decoration-none">
                                                        {post.title}
                                                    </Link>
                                                ) : (
                                                    post.title
                                                )}
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
    );
}