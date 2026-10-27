import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../api';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // --- SECURE IDLE TIMEOUT STATE ---
  // Initialize from localStorage to survive page reloads
  const [isIdle, setIsIdle] = useState<boolean>(() => {
    return localStorage.getItem('hipaa_locked') === 'true';
  });
  
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (isIdle) return; // Don't reset timer if already locked

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      // WRITE TO LOCAL STORAGE ON TIMEOUT
      localStorage.setItem('hipaa_locked', 'true');
    }, 60000); 
  }, [isIdle]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    
    // Only start the timer if they aren't already locked
    if (!isIdle) {
        resetTimer(); 
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer, isIdle]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      // CLEAR LOCK STATE ON LOGOUT
      localStorage.removeItem('hipaa_locked');
      setShowLogoutConfirm(false);
      setIsIdle(false);
      navigate('/');
    } catch (error) {
      // CLEAR LOCK STATE EVEN ON ERROR TO PREVENT GHOST LOCKS
      localStorage.removeItem('hipaa_locked');
      navigate('/');
    }
  };

  const handleRenewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setIsUnlocking(true);

    try {
      // Sends the password to our C# endpoint
      await api.post('/auth/renew-session', { password: unlockPassword });
      
      // CLEAR LOCK STATE ON SUCCESS
      localStorage.removeItem('hipaa_locked');
      setIsIdle(false);
      setUnlockPassword('');
      resetTimer(); 
    } catch (error) {
      setUnlockError('Incorrect password. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="d-flex vh-100 overflow-hidden bg-light">
      
      {/* SIDEBAR */}
      <div className="bg-dark text-white d-flex flex-column p-4 shadow" style={{ width: '280px' }}>
        <span className="fs-4 fw-bold mb-5 mt-2 border-bottom border-secondary pb-3">HHC Portal</span>
        
        <div className="d-flex flex-column gap-2 mb-auto">
          <Link 
            to="/home" 
            className={`text-decoration-none rounded px-3 py-2 fs-5 fw-medium ${location.pathname === '/home' ? 'bg-primary text-white' : 'text-white-50'}`}
          >
            🏠 Home
          </Link>
          
          <Link 
            to="/patient" 
            className={`text-decoration-none rounded px-3 py-2 fs-5 fw-medium ${location.pathname === '/patient' ? 'bg-primary text-white' : 'text-white-50'}`}
          >
            📁 Patient
          </Link>
          <Link 
            to="/render-demo" 
            className={`text-decoration-none rounded px-3 py-2 fs-5 fw-medium ${location.pathname === '/render-demo' ? 'bg-primary text-white' : 'text-white-50'}`}
          >
            ⚡ Multi-Render
          </Link>
        </div>

        <hr className="text-secondary mt-auto mb-4" />
        
        <Button variant="outline-light" className="w-100 fw-bold py-2 mb-2" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </Button>
      </div>
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 overflow-auto h-100 w-100">
        <Outlet /> 
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered size="sm">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark">Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted pt-2 pb-4">
          Are you sure you want to securely end your session and log out?
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" className="fw-medium border w-100 mb-2" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="fw-medium w-100 m-0" onClick={handleLogout}>
            Yes, Log Out
          </Button>
        </Modal.Footer>
      </Modal>

      {/* THE INACTIVITY LOCK MODAL */}
      <Modal show={isIdle} backdrop="static" keyboard={false} centered>
        <Modal.Header className="border-bottom-0 pb-0 bg-warning text-dark">
          <Modal.Title className="fw-bold fs-5">
            🔒 Session Locked
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRenewSession}>
          <Modal.Body className="pt-3 pb-4">
            <p className="text-muted mb-4">
              For your security, your session has been locked due to inactivity. Please enter your password to resume working.
            </p>
            <Form.Group>
              <Form.Label className="fw-semibold small text-muted">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter password..." 
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                required
                autoFocus
                isInvalid={!!unlockError}
              />
              <Form.Control.Feedback type="invalid">
                {unlockError}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0 d-flex justify-content-between">
            <Button variant="outline-danger" className="fw-medium" onClick={handleLogout}>
              Sign Out Completely
            </Button>
            <Button variant="primary" type="submit" className="fw-medium px-4" disabled={isUnlocking}>
              {isUnlocking ? <Spinner size="sm" animation="border" /> : 'Unlock Session'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default Layout;