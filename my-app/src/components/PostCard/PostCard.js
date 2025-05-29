// my-app/src/components/PostCard/PostCard.js - Popravka sa funkcionalnim dugmadima
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/core/api';
import {
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardImg,
    Badge,
    Button,
    Spinner
} from 'reactstrap';
import { FaEye, FaHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';

export default function PostCard({ post, showActions = false, onPostDeleted }) {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [liking, setLiking] = useState(false);

    const canEdit = isAuthenticated() && (user?.id === post.authorId || isAdmin());
    const canDelete = isAuthenticated() && (user?.id === post.authorId || isAdmin());

    const handleView = () => {
        if (post.slug) {
            router.push(`/posts/${post.slug}`);
        }
    };

    const handleEdit = () => {
        router.push(`/posts/edit/${post.id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj post?')) {
            return;
        }

        setDeleting(true);
        try {
            await postsAPI.delete(post.id);
            if (onPostDeleted) {
                onPostDeleted(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Greška pri brisanju posta');
        } finally {
            setDeleting(false);
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
            // Osvežite podatke ili ažurirajte state
            window.location.reload(); // Privremeno rešenje
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLiking(false);
        }
    };

    return (
        <Card className="h-100 shadow-sm">
            {post.featuredImageUrl && (
                <CardImg
                    top
                    src={post.featuredImageUrl}
                    alt={post.title}
                    style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={handleView}
                />
            )}
            <CardBody className="d-flex flex-column">
                <div className="mb-2">
                    <Badge color="primary" className="me-2">
                        {post.categoryName}
                    </Badge>
                    <small className="text-muted">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('sr-RS')}
                    </small>
                </div>

                <CardTitle tag="h5" style={{ cursor: 'pointer' }} onClick={handleView}>
                    {post.title}
                </CardTitle>

                <CardText className="flex-grow-1">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                </CardText>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                        Od: {post.authorName}
                    </small>

                    <div className="d-flex gap-3 text-muted">
                        <span className="d-flex align-items-center gap-1">
                            <FaEye size={14} /> {post.views || 0}
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
                            {liking ? <Spinner size="sm" /> : (post.likesCount || 0)}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <FaComment size={14} /> {post.commentsCount || 0}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2 mt-auto">
                    <Button
                        color="primary"
                        size="sm"
                        onClick={handleView}
                        className="flex-grow-1"
                    >
                        Pogledaj
                    </Button>

                    {(showActions || canEdit) && (
                        <Button
                            color="outline-secondary"
                            size="sm"
                            onClick={handleEdit}
                            disabled={!canEdit}
                        >
                            <FaEdit />
                        </Button>
                    )}

                    {(showActions || canDelete) && (
                        <Button
                            color="outline-danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting || !canDelete}
                        >
                            {deleting ? <Spinner size="sm" /> : <FaTrash />}
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}