'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import {
    Card,
    CardBody,
    CardTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert,
    Spinner,
    Row,
    Col
} from 'reactstrap';

export default function SignUp() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        // Remove confirmPassword before sending
        const { confirmPassword, ...userData } = data;

        const result = await signUp(userData);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <Card>
                    <CardBody>
                        <CardTitle tag="h2" className="text-center mb-4">
                            Registruj se
                        </CardTitle>

                        {error && <Alert color="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="firstName">Ime</Label>
                                        <Input
                                            type="text"
                                            id="firstName"
                                            {...register('firstName', {
                                                required: 'Ime je obavezno',
                                                maxLength: {
                                                    value: 50,
                                                    message: 'Ime ne sme biti duže od 50 karaktera'
                                                }
                                            })}
                                            invalid={!!errors.firstName}
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