import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders recruiter dashboard with primary CTA', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /panel del reclutador/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /añadir candidato/i })).toBeInTheDocument();
});
