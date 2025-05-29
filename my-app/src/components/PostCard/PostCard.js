import Link from 'next/link';
import {
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardImg,
    Badge
} from 'reactstrap';
import { FaEye, FaHeart, FaComment } from 'react-icons/fa';

export default function PostCard({ post }) {
    return (
        <Card className="h-100 shadow-sm">
            {post.featuredImageUrl && (
                <CardImg
                    top
                    src={post.featuredImageUrl}
                    alt={post.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                />
            )}
            <CardBody className="d-flex flex-column">
                <div className="mb-2">
                    <Badge color="primary" className="me-2">
                        {post.categoryName}
                    </Badge>
                    <small className="text-muted">
                        {new Date(post.publishedAt).toLocaleDateString('sr-RS')}
                    </small>
                </div>

                <CardTitle tag="h5">
                    <Link
                        href={`/posts/${post.slug}`}
                        className="text-decoration-none text-dark"
                    >
                        {post.title}
                    </Link>
                </CardTitle>

                <CardText className="flex-grow-1">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                </CardText>

                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        Od: {post.authorName}
                    </small>

                    <div className="d-flex gap-3 text-muted">
            <span className="d-flex align-items-center gap-1">
              <FaEye size={14} /> {post.views}
            </span>
                        <span className="d-flex align-items-center gap-1">
              <FaHeart size={14} /> {post.likesCount}
            </span>
                        <span className="d-flex align-items-center gap-1">
              <FaComment size={14} /> {post.commentsCount}
            </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}