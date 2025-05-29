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
    Spinner,
    Row,
    Col
} from 'reactstrap';
import CustomAlert from '@/components/CustomAlert/CustomAlert';

export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const password = watch('password');

    console.log('Component rendered, form errors:', errors);

    const onSubmit = async (data) => {
        console.log('=== FORM SUBMIT DEBUG ===');
        console.log('1. onSubmit function called');
        console.log('2. Form data received:', data);
        console.log('3. Data keys:', Object.keys(data));
        console.log('4. Data values:', Object.values(data));

        // Provjeri da li su sva potrebna polja tu
        if (!data.firstName) console.error('Missing firstName');
        if (!data.lastName) console.error('Missing lastName');
        if (!data.email) console.error('Missing email');
        if (!data.password) console.error('Missing password');

        setLoading(true);
        setError(null);

        try {
            const userData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                contactNumber: data.contactNumber || '',
                password: data.password
            };

            console.log('5. Prepared userData:', userData);
            console.log('6. Sending request to backend...');

            const response = await fetch('http://localhost:8080/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            console.log('7. Response status:', response.status);

            const result = await response.json().catch((err) => {
                console.error('Failed to parse JSON:', err);
                return null;
            });

            console.log('8. Response data:', result);

            if (!response.ok) {
                throw new Error(result?.detail || `HTTP Error: ${response.status}`);
            }

            // Store user data in localStorage
            if (typeof window !== 'undefined' && result) {
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.user));

                setSuccess(true);
                console.log('9. Registration successful, redirecting...');

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            }
        } catch (err) {
            console.error('10. Registration error:', err);
            console.error('11. Error message:', err.message);
            setError(err.message || 'An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
            console.log('12. Loading set to false');
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <Card>
                    <CardBody>
                        <CardTitle tag="h2" className="text-center mb-4">
                            Registruj se
                        </CardTitle>

                        {error && <CustomAlert color="danger">{error}</CustomAlert>}
                        {success && <CustomAlert color="success">Uspešna registracija! Preusmeravanje...</CustomAlert>}

                        <Form onSubmit={(e) => {
                            console.log('Form onSubmit event triggered');
                            e.preventDefault();
                            handleSubmit(onSubmit)(e);
                        }}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="firstName">Ime</Label>
                                        <Input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            {...register('firstName', {
                                                required: 'Ime je obavezno',
                                                maxLength: {
                                                    value: 50,
                                                    message: 'Ime ne sme biti duže od 50 karaktera'
                                                }
                                            })}
                                            invalid={!!errors.firstName}
                                            onChange={(e) => {
                                                console.log('firstName changed:', e.target.value);
                                            }}
                                        />
                                        {errors.firstName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.firstName.message}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="lastName">Prezime</Label>
                                        <Input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            {...register('lastName', {
                                                required: 'Prezime je obavezno',
                                                maxLength: {
                                                    value: 50,
                                                    message: 'Prezime ne sme biti duže od 50 karaktera'
                                                }
                                            })}
                                            invalid={!!errors.lastName}
                                        />
                                        {errors.lastName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.lastName.message}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
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
                                <Label for="contactNumber">Broj telefona</Label>
                                <Input
                                    type="text"
                                    id="contactNumber"
                                    name="contactNumber"
                                    {...register('contactNumber', {
                                        maxLength: {
                                            value: 20,
                                            message: 'Broj telefona ne sme biti duži od 20 karaktera'
                                        }
                                    })}
                                    invalid={!!errors.contactNumber}
                                />
                                {errors.contactNumber && (
                                    <div className="invalid-feedback d-block">
                                        {errors.contactNumber.message}
                                    </div>
                                )}
                            </FormGroup>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="password">Lozinka</Label>
                                        <Input
                                            type="password"
                                            id="password"
                                            name="password"
                                            {...register('password', {
                                                required: 'Lozinka je obavezna',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Lozinka mora imati najmanje 6 karaktera'
                                                }
                                            })}
                                            invalid={!!errors.password}
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="confirmPassword">Potvrdi lozinku</Label>
                                        <Input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            {...register('confirmPassword', {
                                                required: 'Potvrda lozinke je obavezna',
                                                validate: value =>
                                                    value === password || 'Lozinke se ne poklapaju'
                                            })}
                                            invalid={!!errors.confirmPassword}
                                        />
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback d-block">
                                                {errors.confirmPassword.message}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Button
                                color="primary"
                                block
                                disabled={loading}
                                className="mt-4"
                                type="submit"
                                onClick={() => console.log('Button clicked, loading:', loading)}
                            >
                                {loading ? <Spinner size="sm" /> : 'Registruj se'}
                            </Button>
                        </Form>

                        <hr className="my-4" />

                        <p className="text-center mb-0">
                            Već imate nalog?{' '}
                            <Link href="/auth/signin">
                                Prijavite se
                            </Link>
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}