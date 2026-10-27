import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import api from '../api';

const Home: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string>('Loading...');
  const [agencyName, setAgencyName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionRes = await api.get('/auth/session-check');
        setCurrentUser(sessionRes.data.email);

        const agencyRes = await api.get('/agency');
        setAgencyName(agencyRes.data?.agencyName || '');
      } catch (error) {
        navigate('/');
      }
    };
    fetchSession();
  }, [navigate]);

  return (
    <div className="premium-dashboard p-5">
      <Container>
        <Card className="glass-card text-center p-5 mt-5 border-0 shadow-sm">
          <Card.Body>
        <h1 className="fw-bold mb-3" style = {{ color: '#0f172a' }}>
            Welcome to { String(agencyName || 'Portal') }
        </h1>
            <p className="text-muted fs-4">
              Logged in securely as: <strong style={{ color: '#4f46e5' }}>{currentUser}</strong>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Home;