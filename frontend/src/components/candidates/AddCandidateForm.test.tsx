import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddCandidateForm } from './AddCandidateForm';
import {
  CandidateServiceError,
  createCandidate,
} from '../../services/candidateService';

jest.mock('../../services/candidateService', () => {
  const actual = jest.requireActual('../../services/candidateService') as Record<string, unknown>;
  return {
    ...actual,
    createCandidate: jest.fn(),
  };
});

const mockCreate = createCandidate as jest.MockedFunction<typeof createCandidate>;

const createdFixture = {
  id: 1,
  firstName: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  phone: null,
  address: null,
  educationSummary: null,
  experienceSummary: null,
  cvUploaded: false,
  cvFileName: null,
  cvMimeType: null,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

beforeEach(() => {
  mockCreate.mockReset();
});

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana');
  await userEvent.type(screen.getByLabelText(/apellidos/i), 'García');
  await userEvent.type(screen.getByLabelText(/correo/i), 'ana@example.com');
}

test('does not call API when required fields are empty', async () => {
  render(<AddCandidateForm />);
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  expect(mockCreate).not.toHaveBeenCalled();
  expect(await screen.findByText(/El nombre es obligatorio/i)).toBeInTheDocument();
});

test('does not call API when email format is invalid', async () => {
  render(<AddCandidateForm />);
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana');
  await userEvent.type(screen.getByLabelText(/apellidos/i), 'García');
  await userEvent.type(screen.getByLabelText(/correo/i), 'not-an-email');
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  expect(mockCreate).not.toHaveBeenCalled();
  expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
});

test('shows success message after create', async () => {
  mockCreate.mockResolvedValue(createdFixture);
  render(<AddCandidateForm />);
  await fillRequiredFields();
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  await waitFor(() => {
    expect(screen.getByText(/Candidato añadido correctamente/i)).toBeInTheDocument();
  });
  expect(mockCreate).toHaveBeenCalled();
});

test('shows duplicate email message on 409', async () => {
  mockCreate.mockRejectedValue(new CandidateServiceError('dup', 409, 'DUPLICATE_EMAIL'));
  render(<AddCandidateForm />);
  await fillRequiredFields();
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  await waitFor(() => {
    expect(screen.getByText(/Ya existe un candidato con este correo/i)).toBeInTheDocument();
  });
  expect((screen.getByLabelText(/correo/i) as HTMLInputElement).value).toBe('ana@example.com');
});

test('preserves field values after network error', async () => {
  mockCreate.mockRejectedValue(new CandidateServiceError('net', 0, 'NETWORK'));
  render(<AddCandidateForm />);
  await fillRequiredFields();
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  await waitFor(() => {
    expect(screen.getByText(/No se pudo conectar con el servidor/i)).toBeInTheDocument();
  });
  expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Ana');
});

test('blocks disallowed CV extension before calling API', async () => {
  render(<AddCandidateForm />);
  const cvInput = screen.getByLabelText(/cv \(opcional\)/i);
  const badFile = new File(['x'], 'notes.txt', { type: 'text/plain' });
  await userEvent.upload(cvInput, badFile);
  await fillRequiredFields();
  await userEvent.click(screen.getByTestId('add-candidate-submit'));
  expect(mockCreate).not.toHaveBeenCalled();
  expect(screen.getByText(/PDF, DOC o DOCX/i)).toBeInTheDocument();
});
