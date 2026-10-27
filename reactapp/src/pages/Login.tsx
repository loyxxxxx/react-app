import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Login: React.FC = () => {
    const [agencyId, setAgencyId] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [step, setStep] = useState<number>(1);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleVerifyAgency = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/verify-agency', { agencyId });
            setStep(2);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setError((err.response?.data as string) || 'Agency ID not found.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { agencyId, email, password });

            if (response.status === 200) {
                // Clears any leftover lock state from previous sessions
                localStorage.removeItem('hipaa_locked');
                navigate('/home');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err.response?.data as string) || 'Invalid email or password.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className= "d-flex justify-content-center align-items-center vh-100 bg-light" fluid >
            <Card className="shadow-sm" style = {{ width: '100%', maxWidth: '400px' }
}>
    <Card.Body className="p-4" >
        <h3 className="text-center mb-4 text-primary" > Portal </h3>
{ error && <Alert variant="danger" > { error } </Alert> }

{
    step === 1 ? (
        <Form onSubmit= { handleVerifyAgency } >
        <p className="text-center text-muted mb-3" > Please enter your Agency ID to continue.</p>
            < Form.Group className = "mb-3" >
                <Form.Control 
                  type="text"
    placeholder = "Agency ID"
    value = { agencyId }
    onChange = {(e) => setAgencyId(e.target.value)
}
required
    />
    </Form.Group>
    < Button variant = "primary" type = "submit" className = "w-100" disabled = { isLoading } >
    { isLoading? 'Verifying...': 'Continue' }
        </Button>
        </Form>
          ) : (
    <Form onSubmit= { handleLogin } >
        <div className="d-flex justify-content-between align-items-center mb-3" >
            <span className="fw-bold text-primary" > Agency: { agencyId } </span>
            < Button variant = "link" className = "p-0 text-muted" onClick = {() => setStep(1)}> Change </Button>
        </div>
        < Form.Group className = "mb-3" >
            <Form.Control type="email" placeholder = "Email address" value = { email } onChange = {(e) => setEmail(e.target.value)}required/>
        </Form.Group>
        < Form.Group className = "mb-4" >
            <Form.Control type="password" placeholder = "Password" value = { password } onChange = {(e) => setPassword(e.target.value)} required/>
        </Form.Group>
        < Button variant = "primary" type = "submit" className = "w-100" disabled = { isLoading } >
            { isLoading? 'Signing In...': 'Sign In' }
        </Button>
    </Form>
          )}
</Card.Body>
    </Card>
    </Container>
  );
};

export default Login;