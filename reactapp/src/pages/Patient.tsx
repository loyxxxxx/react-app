import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  Container, Table, Button, Modal, Form, Row, Col, Card, 
  Pagination, InputGroup, Toast, ToastContainer, Spinner, Badge
} from 'react-bootstrap';
import './Dashboard.css';

interface Patient {
  id: number;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  admissionDate: string;
}

const Patient: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Patient Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');

  // --- SEARCH & DEBOUNCE STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // UI States
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  const navigate = useNavigate();

  // --- DEBOUNCE EFFECT ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); 
    }, 300);

    return () => clearTimeout(timerId); 
  }, [searchTerm]);

  const fetchPatientsData = async () => {
    try {
      await api.get('/auth/session-check');
      const patientsRes = await api.get('/patients');
      setPatients(patientsRes.data);
    } catch (error) {
      navigate('/');
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, [navigate]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingId(patient.id);
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setDateOfBirth(formatDateForInput(patient.dateOfBirth));
      setAdmissionDate(formatDateForInput(patient.admissionDate));
    } else {
      setEditingId(null);
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setAdmissionDate('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    if (!/\d/.test(value)) setter(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { firstName, lastName, dateOfBirth, admissionDate };
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
        setToastMessage('Patient updated successfully!');
      } else {
        await api.post('/patients', payload);
        setToastMessage('Patient saved successfully!');
      }
      setToastVariant('success');
      setShowToast(true);
      closeModal();
      fetchPatientsData();
    } catch (error) {
      setToastMessage('Error saving patient data. Please try again.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm("Are you sure you want to securely remove this patient record?")) return;

    setDeletingId(id); // Trigger targeted loading spinner
    
    try {
      await api.delete(`/patients/${id}`); 
      
      // Artificial delay for smooth UI fade out transition
      setTimeout(() => {
        setPatients(prev => prev.filter(p => p.id !== id));
        setDeletingId(null);
        setToastMessage('Patient record successfully removed.');
        setToastVariant('success');
        setShowToast(true);
      }, 400);

    } catch (error) {
      console.error("Failed to delete patient", error);
      setDeletingId(null);
      setToastMessage('Failed to remove patient record.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  // --- OPTIMIZED FILTER LOGIC ---
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      p.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [patients, debouncedSearchTerm]);

  // --- OPTIMIZED PAGINATION LOGIC ---
  const { currentPatients, totalPages, indexOfFirstPatient, indexOfLastPatient } = useMemo(() => {
    const lastIdx = currentPage * patientsPerPage;
    const firstIdx = lastIdx - patientsPerPage;
    
    return {
      currentPatients: filteredPatients.slice(firstIdx, lastIdx),
      totalPages: Math.ceil(filteredPatients.length / patientsPerPage),
      indexOfFirstPatient: firstIdx,
      indexOfLastPatient: lastIdx
    };
  }, [filteredPatients, currentPage, patientsPerPage]);

  return (
    <div className="premium-dashboard py-4 bg-light position-relative" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Container fluid className="px-4">
        
        {/* Header & Search Bar Row */}
        <Row className="mb-4 align-items-center">
          <Col md={5} className="mb-3 mb-md-0">
            <h3 className="fw-bolder text-dark mb-1">Patient Directory</h3>
            <p className="text-muted small fw-medium mb-0">RDI-27 • Manage Agency Patient Records</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <InputGroup className="shadow-sm rounded-pill overflow-hidden border bg-white">
              <InputGroup.Text className="bg-white border-0 text-muted px-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="Search by first or last name..." 
                className="border-0 shadow-none py-2"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ fontSize: '0.95rem' }}
              />
              {searchTerm && (
                <InputGroup.Text className="bg-white border-0 text-muted pe-3" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                  </svg>
                </InputGroup.Text>
              )}
            </InputGroup>
          </Col>
          <Col md={3} className="text-md-end">
            <Button variant="primary" className="w-100 fw-bold shadow-sm rounded-pill py-2" onClick={() => openModal()}>
              + Add New Patient
            </Button>
          </Col>
        </Row>

        <Card className="glass-card mb-4 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light border-bottom">
              <tr>
                <th className="py-3 px-4 text-muted fw-semibold small text-uppercase">Patient</th>
                <th className="py-3 px-4 text-muted fw-semibold small text-uppercase">MRN / ID</th>
                <th className="py-3 px-4 text-muted fw-semibold small text-uppercase">Date of Birth</th>
                <th className="py-3 px-4 text-muted fw-semibold small text-uppercase">Admission Date</th>
                <th className="py-3 px-4 text-end text-muted fw-semibold small text-uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((p) => {
                const isDeleting = deletingId === p.id;
                return (
                  <tr key={p.id} style={{ opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.3s ease' }}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm bg-primary bg-opacity-10 text-primary" style={{ width: '40px', height: '40px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {getInitials(p.firstName, p.lastName)}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold text-dark">{p.lastName}, {p.firstName}</h6>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <Badge bg="light" text="secondary" pill className="border fw-medium">
                        #{p.id.toString().padStart(5, '0')}
                      </Badge>
                    </td>
                    <td className="px-4 text-muted fw-medium">{new Date(p.dateOfBirth).toLocaleDateString()}</td>
                    <td className="px-4 text-muted fw-medium">{new Date(p.admissionDate).toLocaleDateString()}</td>
                    <td className="px-4 text-end">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="me-2 shadow-sm border fw-medium rounded-3" 
                        onClick={() => openModal(p)}
                        disabled={isDeleting}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="shadow-sm fw-medium rounded-3" 
                        onClick={() => handleDeletePatient(p.id)}
                        disabled={isDeleting}
                        style={{ width: '70px' }}
                      >
                        {isDeleting ? <Spinner size="sm" animation="border" /> : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="text-muted fs-5 mb-2 fw-semibold">No patients found</div>
                    <p className="text-muted mb-0 small">Try adjusting your search criteria in the roster.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          
          {/* Pagination Footer */}
          {filteredPatients.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="text-muted small fw-medium">
                Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} entries
              </span>
              <Pagination className="mb-0 shadow-sm" size="sm">
                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card>

        {/* Add / Edit Modal */}
        <Modal show={isModalOpen} onHide={closeModal} centered backdrop="static">
          <Modal.Header closeButton className="border-bottom pb-3 bg-light">
            <Modal.Title className="fw-bolder fs-5 text-dark">
              {editingId ? 'Edit Patient Record' : 'Register New Patient'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body className="pt-4 pb-4 px-4">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">First Name</Form.Label>
                    <Form.Control type="text" className="shadow-none border" placeholder="e.g. Jane" value={firstName} onChange={(e: any) => handleNameChange(e, setFirstName)} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Last Name</Form.Label>
                    <Form.Control type="text" className="shadow-none border" placeholder="e.g. Doe" value={lastName} onChange={(e: any) => handleNameChange(e, setLastName)} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Date of Birth</Form.Label>
                    <Form.Control type="date" className="shadow-none border" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Admission Date</Form.Label>
                    <Form.Control type="date" className="shadow-none border" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-top pt-3 pb-3 px-4 bg-light">
              <Button variant="white" className="fw-medium border shadow-sm rounded-3 px-4" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" type="submit" className="fw-medium shadow-sm rounded-3 px-4">
                {editingId ? 'Save Changes' : 'Register Patient'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Notifications */}
        <ToastContainer position="bottom-end" className="p-4" style={{ zIndex: 1055, position: 'fixed' }}>
          <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide className={`bg-${toastVariant} text-white border-0 shadow`}>
            <Toast.Body className="fw-medium d-flex align-items-center">
              {toastVariant === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>
              )}
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>

      </Container>
    </div>
  );
};

export default Patient;