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
    Spinner
} from 'reactstrap';

export default function SignIn() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        const result = await signIn(data);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
                <Card>
                    <CardBody>
                        <CardTitle tag="h2" className="text-center mb-4">
                            Prijavi se
                        </CardTitle>

                        {error && <Alert color="danger">{error}</Alert>}

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