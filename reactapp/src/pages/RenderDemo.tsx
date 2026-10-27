import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, ListGroup, Spinner, Badge, InputGroup } from 'react-bootstrap';
import api from '../api';
import OptimizedOasisViewer from '../components/OptimizedOasisViewer';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  admissionDate: string;
}

const RenderDemo: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients');
        setPatients(response.data);
      } catch (err) {
        setError('Failed to fetch patient directory.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const lower = searchTerm.toLowerCase();
    return patients.filter(
      p => p.firstName.toLowerCase().includes(lower) || p.lastName.toLowerCase().includes(lower)
    );
  }, [patients, searchTerm]);

  // Helper to generate initials for the Avatar UI
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Container fluid className="py-4 bg-light" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Row className="mb-4 px-3 align-items-center">
        <Col>
          <h3 className="fw-bolder text-dark mb-1">Clinical Workspace</h3>
          <p className="text-muted small fw-medium mb-0">RDI-27 • Submitted OASIS Control Environment</p>
        </Col>
      </Row>

      <Row className="g-4 px-3">
        {/* LEFT COLUMN: Modern Search & Patient Roster */}
        <Col md={4} lg={3} className="d-flex flex-column" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
              <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                <InputGroup.Text className="bg-white border-0 text-muted px-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search roster..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 shadow-none py-2"
                  style={{ fontSize: '0.95rem' }}
                />
              </InputGroup>
            </Card.Header>

            <Card.Body className="p-3 overflow-auto mt-2">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <Spinner animation="grow" variant="primary" size="sm" />
                  <Spinner animation="grow" variant="primary" size="sm" className="mx-2" />
                  <Spinner animation="grow" variant="primary" size="sm" />
                </div>
              ) : error ? (
                <div className="alert alert-danger text-center small rounded-3">{error}</div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center text-muted mt-5">
                  <small>No matches found in active roster.</small>
                </div>
              ) : (
                <ListGroup className="gap-2">
                  {filteredPatients.map(p => {
                    const isSelected = selectedPatient?.id === p.id;
                    return (
                      <ListGroup.Item
                        key={p.id}
                        action
                        onClick={() => setSelectedPatient(p)}
                        className={`d-flex align-items-center p-3 rounded-3 border-0 transition-all ${
                          isSelected 
                            ? 'bg-white shadow-sm border-start border-4 border-primary' 
                            : 'bg-transparent text-secondary hover-bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Modern Avatar */}
                        <div 
                          className={`rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm ${
                            isSelected ? 'bg-primary text-white' : 'bg-light text-dark'
                          }`}
                          style={{ width: '42px', height: '42px', fontSize: '0.9rem', fontWeight: 'bold' }}
                        >
                          {getInitials(p.firstName, p.lastName)}
                        </div>
                        
                        {/* Patient Meta */}
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className={`mb-0 fw-bold text-truncate ${isSelected ? 'text-dark' : ''}`}>
                            {p.lastName}, {p.firstName}
                          </h6>
                          <small className="text-muted d-block text-truncate">
                            DOB: {new Date(p.dateOfBirth).toLocaleDateString()}
                          </small>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN: Premium Medical Chart Workspace */}
        <Col md={8} lg={9} className="h-100">
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white overflow-hidden d-flex flex-column">
            {selectedPatient ? (
              <>
                {/* EHR-Style Ribbon Header */}
                <div className="bg-white border-bottom p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-4 bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center me-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                      </div>
                      <div>
                        <h4 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                          <Badge bg="success" pill style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>Active</Badge>
                        </h4>
                        <span className="text-muted small fw-medium">MRN: #{selectedPatient.id.toString().padStart(6, '0')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats Row */}
                  <Row className="g-3 mt-1">
                    <Col auto>
                      <div className="bg-light rounded-3 px-3 py-2 border">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</small>
                        <span className="fw-semibold text-dark">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    </Col>
                    <Col auto>
                      <div className="bg-light rounded-3 px-3 py-2 border">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admission Date</small>
                        <span className="fw-semibold text-dark">{new Date(selectedPatient.admissionDate).toLocaleDateString()}</span>
                      </div>
                    </Col>
                    <Col auto>
                      <div className="bg-light rounded-3 px-3 py-2 border">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Assessment</small>
                        <span className="fw-semibold text-primary">Start of Care (OASIS)</span>
                      </div>
                    </Col>
                  </Row>
                </div>
                
                {/* The React.memo protected workspace */}
                <div className="flex-grow-1 p-4 overflow-auto bg-light" style={{ minHeight: 0 }}>
                  <OptimizedOasisViewer patientId={selectedPatient.id} />
                </div>
              </>
            ) : (
              /* Premium Empty State */
              <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light p-5 text-center">
                <div className="bg-white p-4 rounded-circle shadow-sm mb-4 border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#cbd5e1" viewBox="0 0 16 16">
                    <path d="M4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V1.5a.5.5 0 0 0-.5-.5h-10zM2 0h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm2.5 4.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 11z"/>
                  </svg>
                </div>
                <h4 className="fw-bolder text-dark mb-2">Select a Patient Workspace</h4>
                <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                  Choose a patient from the roster to load their clinical chart, view demographic data, and update OASIS assessment scores.
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RenderDemo;