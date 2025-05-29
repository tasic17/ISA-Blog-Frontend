'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'reactstrap';
import Link from 'next/link';
import ClientLayout from '../ClientLayout';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:8080/api/categories', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Categories data:', data);
        setCategories(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const content = () => {
    if (loading) {
      return (
        <Container className="text-center py-5">
          <Spinner color="primary" />
          <p>Učitavanje kategorija...</p>
        </Container>
      );
    }

    if (error) {
      return (
        <Container className="py-5">
          <div className="alert alert-danger">
            Greška: {error}
          </div>
        </Container>
      );
    }

    return (
      <Container className="py-5">
        <h1 className="mb-4">Kategorije</h1>
        
        <Row>
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <Col key={category.id} md={4} className="mb-4">
                <Card body className="h-100">
                  <h5>{category.name}</h5>
                  {category.description && <p>{category.description}</p>}
                  <Link href={`/category/${category.id}`} className="btn btn-primary mt-auto">
                    Pregledaj
                  </Link>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <div className="alert alert-info">
                Nema dostupnih kategorija.
              </div>
            </Col>
          )}
        </Row>
      </Container>
    );
  };

  return <ClientLayout>{content()}</ClientLayout>;
}
