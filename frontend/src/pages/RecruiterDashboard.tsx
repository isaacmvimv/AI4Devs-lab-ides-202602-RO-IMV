import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <h1 className="mb-3">Panel del reclutador</h1>
      <p className="lead mb-4">
        Gestiona candidatos desde este panel. Para empezar, añade un nuevo perfil al sistema.
      </p>
      <Button variant="primary" size="lg" onClick={() => navigate('/candidates/new')}>
        Añadir candidato
      </Button>
    </Container>
  );
};
