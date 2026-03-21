import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AddCandidateForm } from '../components/candidates/AddCandidateForm';

export const AddCandidatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-4 py-md-5">
      <div className="mb-3">
        <Button variant="link" className="ps-0" onClick={() => navigate('/')}>
          ← Volver al panel
        </Button>
      </div>
      <h1 className="mb-4">Añadir candidato</h1>
      <AddCandidateForm />
    </Container>
  );
};
