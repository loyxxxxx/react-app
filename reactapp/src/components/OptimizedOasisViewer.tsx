import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner, Row, Col, Alert } from 'react-bootstrap';
import api from '../api';

interface OasisViewerProps {
  patientId: number;
}

interface OasisRecord {
 id?: number; 
  oasisId?: number;
  OasisId?: number;
  m0020_PAT_ID: number;
  m1400_SHRT_BREATH: string;
  m1830_BATHING: string;
}

const OptimizedOasisViewer: React.FC<OasisViewerProps> = React.memo(({ patientId }) => {
  const [oasis, setOasis] = useState<OasisRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State matching your C# Model properties exactly
  const [formData, setFormData] = useState({
    m1400_SHRT_BREATH: '',
    m1830_BATHING: ''
  });

  useEffect(() => {
    const fetchOasis = async () => {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      try {
        // MATCHES C#: [HttpGet("patient/{patientId}")]
        const response = await api.get(`/oasis/patient/${patientId}`);
        setOasis(response.data);
        
        setFormData({
          m1400_SHRT_BREATH: response.data.m1400_SHRT_BREATH || '00',
          m1830_BATHING: response.data.m1830_BATHING || '00'
        });
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('No clinical OASIS record found for this patient.');
        } else {
          setError('Failed to load clinical data.');
        }
        setOasis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOasis();
  }, [patientId]);

  const handleSave = async () => {
    if (!oasis) return;
    setIsSaving(true);
    try {
      // Safely grab the ID no matter how C# formatted the JSON property name
      const recordId = oasis.id || oasis.oasisId || oasis.OasisId;
      
      if (!recordId) {
        alert("Cannot save: Missing OASIS record ID.");
        setIsSaving(false);
        return;
      }

      // MATCHES C#: [HttpPut("{oasisId}")] 
      await api.put(`/oasis/${recordId}`, formData);
      
      setOasis({ ...oasis, ...formData });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save OASIS data. Check backend connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error && !oasis) {
    return <Alert variant="warning" className="m-3">{error}</Alert>;
  }

  return (
    <div className="oasis-form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark mb-0">Comprehensive Assessment</h5>
        {!isEditing ? (
          <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil me-2" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.293l.5-.5h.5l.5.5v.5h.5l.5-.5h.5l.5.5v.5h.5l.5-.5h.5l.5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
            Edit OASIS
          </Button>
        ) : (
          <div>
            <Button variant="light" size="sm" className="me-2" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <Card className="border shadow-sm mb-4">
        <Card.Header className="bg-light fw-semibold text-secondary">
          Respiratory Status
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <strong className="text-dark">(M1400) Shortness of Breath:</strong>
            </Col>
            <Col md={8}>
              {isEditing ? (
                <Form.Select 
                value={formData.m1400_SHRT_BREATH} 
                onChange={(e) => setFormData({...formData, m1400_SHRT_BREATH: e.target.value})}
                >
                <option value="">-- Not Assessed --</option>
                <option value="00">00 - Patient is not short of breath</option>
                <option value="01">01 - When walking more than 20 feet, climbing stairs</option>
                <option value="02">02 - With moderate exertion (e.g., dressing, using commode)</option>
                <option value="03">03 - With minimal exertion (e.g., while eating, talking)</option>
                <option value="04">04 - At rest (during day or night)</option>
                </Form.Select>
              ) : (
                <span className="text-muted">
                  {formData.m1400_SHRT_BREATH === '00' ? '00 - Patient is not short of breath' :
                   formData.m1400_SHRT_BREATH === '01' ? '01 - When walking more than 20 feet, climbing stairs' :
                   formData.m1400_SHRT_BREATH === '02' ? '02 - With moderate exertion' :
                   formData.m1400_SHRT_BREATH === '03' ? '03 - With minimal exertion' :
                   formData.m1400_SHRT_BREATH === '04' ? '04 - At rest' : 'Not Assessed'}
                </span>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border shadow-sm">
        <Card.Header className="bg-light fw-semibold text-secondary">
          ADLs / IADLs
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <strong className="text-dark">(M1830) Bathing:</strong>
            </Col>
            <Col md={8}>
              {isEditing ? (
                <Form.Select 
  value={formData.m1830_BATHING} 
  onChange={(e) => setFormData({...formData, m1830_BATHING: e.target.value})}
>
  <option value="">-- Not Assessed --</option>
  <option value="00">00 - Able to bathe self entirely independently</option>
  <option value="01">01 - Requires use of devices (e.g., grab bars, shower chair)</option>
  <option value="02">02 - Requires assistance to safely bathe</option>
  <option value="03">03 - Participates, but requires another person to bathe</option>
  <option value="04">04 - Unable to participate effectively</option>
</Form.Select>
              ) : (
                <span className="text-muted">
                  {formData.m1830_BATHING === '00' ? '00 - Able to bathe self entirely independently' :
                   formData.m1830_BATHING === '01' ? '01 - Requires use of devices' :
                   formData.m1830_BATHING === '02' ? '02 - Requires assistance to safely bathe' :
                   formData.m1830_BATHING === '03' ? '03 - Participates, but requires another person' :
                   formData.m1830_BATHING === '04' ? '04 - Unable to participate effectively' : 'Not Assessed'}
                </span>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
});

export default OptimizedOasisViewer;