'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
    Card,
    CardBody,
    CardTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner
} from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            console.log('Sending login data:', data);
            
            const response = await fetch('http://localhost:8080/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                })
            });
            
            console.log('Login response status:', response.status);
            
            const result = await response.json().catch(() => null);
            console.log('Login response data:', result);
            
            if (!response.ok) {
                throw new Error(result?.detail || `Error: ${response.status}`);
            }
            
            // Store user data in localStorage
            if (typeof window !== 'undefined' && result) {
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                setSuccess(true);
                
                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
                <Card>
                    <CardBody>
                        <CardTitle tag="h2" className="text-center mb-4">
                            Prijavi se
                        </CardTitle>

                        {error && <CustomAlert color="danger">{error}</CustomAlert>}
                        {success && <CustomAlert color="success">Uspešna prijava! Preusmeravanje...</CustomAlert>}

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    {...register('email', {
                                        required: 'Email je obavezan',
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: 'Neispravan format email adrese'
                                        }
                                    })}
                                    invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback d-block">
                                        {errors.email.message}
                                    </div>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label for="password">Lozinka</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    {...register('password', {
                                        required: 'Lozinka je obavezna'
                                    })}
                                    invalid={!!errors.password}
                                />
                                {errors.password && (
                                    <div className="invalid-feedback d-block">
                                        {errors.password.message}
                                    </div>
                                )}
                            </FormGroup>

                            <Button
                                color="primary"
                                block
                                disabled={loading}
                                className="mt-4"
                                type="submit"
                            >
                                {loading ? <Spinner size="sm" /> : 'Prijavi se'}
                            </Button>
                        </Form>

                        <hr className="my-4" />

                        <p className="text-center mb-0">
                            Nemate nalog?{' '}
                            <Link href="/auth/signup">
                                Registrujte se
                            </Link>
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}