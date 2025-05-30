'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/core/api';
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

    const fetchStats = async () => {
        setLoadingStats(true);
        setError('');
        try {
            console.log('Fetching admin stats...');
            const response = await adminAPI.posts.getStats();
            console.log('Stats data:', response.data);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(`Greška pri učitavanju statistika: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setError('');
        try {
            console.log('Fetching users...');
            const response = await adminAPI.users.getAll({ size: 10 });
            console.log('Users data:', response.data);
            setUsers(response.data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(`Greška pri učitavanju korisnika: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPosts = async () => {
        setLoadingPosts(true);
        setError('');
        try {
            console.log('Fetching posts...');
            const response = await adminAPI.posts.getAll({ size: 10 });
            console.log('Posts data:', response.data);
            setPosts(response.data.posts || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(`Greška pri učitavanju postova: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleUserRoleChange = async (userId, roleName, action) => {
        try {
            setError('');
            setSuccess('');

            if (action === 'add') {
                await adminAPI.users.assignRole(userId, roleName);
            } else {
                await adminAPI.users.removeRole(userId, roleName);
            }

            setSuccess(`Rola ${roleName} je ${action === 'add' ? 'dodana' : 'uklonjena'}`);
            fetchUsers(); // Refresh users list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(`Greška pri ažuriranju rola: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handlePostStatusChange = async (postId, newStatus) => {
        try {
            setError('');
            setSuccess('');

            await adminAPI.posts.updateStatus(postId, newStatus);

            setSuccess(`Status posta je ažuriran na ${newStatus}`);
            fetchPosts(); // Refresh posts list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating post status:', err);
            setError(`Greška pri ažuriranju statusa posta: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            await adminAPI.users.delete(userId);

            setSuccess('Korisnik je uspešno obrisan');
            fetchUsers(); // Refresh users list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(`Greška pri brisanju korisnika: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            await adminAPI.posts.delete(postId);

            setSuccess('Post je uspešno obrisan');
            fetchPosts(); // Refresh posts list

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting post:', err);
            setError(`Greška pri brisanju posta: ${err.response?.data?.detail || err.message}`);
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
                <div>
                    <Badge color="info" className="me-2">
                        Ulogovan kao: {user?.firstName} {user?.lastName}
                    </Badge>
                    <Badge color="danger">ADMIN</Badge>
                </div>
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

                    {/* Quick Actions */}
                    <Row className="mt-4">
                        <Col>
                            <Card>
                                <CardBody>
                                    <CardTitle>Brze akcije</CardTitle>
                                    <div className="d-flex gap-2">
                                        <Button
                                            color="primary"
                                            onClick={() => setActiveTab('users')}
                                        >
                                            Upravljaj korisnicima
                                        </Button>
                                        <Button
                                            color="secondary"
                                            onClick={() => setActiveTab('posts')}
                                        >
                                            Upravljaj postovima
                                        </Button>
                                        <Button
                                            color="success"
                                            tag={Link}
                                            href="/posts/create"
                                        >
                                            Kreiraj novi post
                                        </Button>
                                    </div>
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
                            ) : users.length > 0 ? (
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
                            ) : (
                                <CustomAlert color="info">Nema korisnika za prikaz.</CustomAlert>
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
                            ) : posts.length > 0 ? (
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
                            ) : (
                                <CustomAlert color="info">Nema postova za prikaz.</CustomAlert>
                            )}
                        </CardBody>
                    </Card>
                </TabPane>
            </TabContent>
        </>
    );
}