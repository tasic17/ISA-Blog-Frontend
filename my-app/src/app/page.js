'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PostCard from '@/components/PostCard/PostCard';
import { Row, Col, Spinner, Button } from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated, isAuthor, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:8080/api/posts?size=6'),
        fetch('http://localhost:8080/api/categories')
      ]);

      if (!postsRes.ok || !categoriesRes.ok) {
        throw new Error('Greška pri dohvatanju podataka');
      }

      const postsData = await postsRes.json();
      const categoriesData = await categoriesRes.json();

      console.log('Posts data:', postsData);
      console.log('Categories data:', categoriesData);

      setPosts(postsData?.posts || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
        <div className="text-center py-5">
          <Spinner size="lg" />
        </div>
    );
  }

  if (error) {
    return (
        <CustomAlert color="danger">{error}</CustomAlert>
    );
  }

  return (
      <>
        {/* Hero sekcija */}
        <div className="bg-light rounded-3 p-5 mb-5">
          <h1 className="display-4 fw-bold">Dobrodošli na Blog Platform</h1>
          <p className="lead">
            Mesto gde možete deliti svoje priče, ideje i znanje sa svetom.
            Pridružite se našoj zajednici pisaca i čitalaca.
          </p>
          <div className="d-flex gap-3">
            <Button color="primary" size="lg" tag={Link} href="/posts">
              Pregledaj postove
            </Button>

            {/* Prikaži "Postani autor" dugme samo ako korisnik nije ulogovan */}
            {!isAuthenticated() && (
                <Button color="outline-primary" size="lg" tag={Link} href="/auth/signup">
                  Postani autor
                </Button>
            )}

            {/* Ako je korisnik ulogovan i već je autor, prikaži "Kreiraj post" */}
            {isAuthenticated() && isAuthor() && (
                <Button color="success" size="lg" tag={Link} href="/posts/create">
                  Kreiraj novi post
                </Button>
            )}

            {/* Ako je korisnik ulogovan ali nije autor, prikaži poruku */}
            {isAuthenticated() && !isAuthor() && (
                <Button color="outline-secondary" size="lg" disabled>
                  Potrebne su vam author privilegije
                </Button>
            )}
          </div>
        </div>

        {/* Kategorije */}
        <section className="mb-5">
          <h2 className="mb-4">Popularne kategorije</h2>
          <Row>
            {categories.slice(0, 6).map(category => (
                <Col key={category.id} md={4} lg={2} className="mb-3">
                  <Link
                      href={`/category/${category.id}`}
                      className="text-decoration-none"
                  >
                    <div className="text-center p-3 bg-light rounded h-100 hover-card">
                      <h5 className="mb-0">{category.name}</h5>
                      <small className="text-muted">
                        {category.postCount || 0} {category.postCount === 1 ? 'post' : 'postova'}
                      </small>
                    </div>
                  </Link>
                </Col>
            ))}
          </Row>
        </section>

        {/* Najnoviji postovi */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Najnoviji postovi</h2>
            <Link href="/posts" className="btn btn-outline-primary">
              Vidi sve
            </Link>
          </div>

          {posts.length > 0 ? (
              <Row>
                {posts.map(post => (
                    <Col key={post.id} md={6} lg={4} className="mb-4">
                      <PostCard post={post} />
                    </Col>
                ))}
              </Row>
          ) : (
              <CustomAlert color="info">
                {isAuthenticated() && isAuthor() ? (
                    <>
                      Još uvek nema objavljenih postova. {' '}
                      <Link href="/posts/create" className="alert-link">
                        Budite prvi koji će podeliti svoju priču!
                      </Link>
                    </>
                ) : (
                    'Još uvek nema objavljenih postova. Budite prvi koji će podeliti svoju priču!'
                )}
              </CustomAlert>
          )}
        </section>
      </>
  );
}