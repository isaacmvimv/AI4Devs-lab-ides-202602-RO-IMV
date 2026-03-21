import React, { useCallback, useId, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import type { CandidateCreatedPublic } from '../../types/candidate';
import {
  CandidateServiceError,
  createCandidate,
  type CreateCandidatePayload,
} from '../../services/candidateService';
import { validateCandidateForm, type FieldErrors } from '../../utils/candidateFormValidation';

type AddCandidateFormProps = {
  onSuccess?: (candidate: CandidateCreatedPublic) => void;
};

const initialValues: CreateCandidatePayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  educationSummary: '',
  experienceSummary: '',
};

function spanishMessageForServerField(field?: string): string {
  switch (field) {
    case 'firstName':
      return 'El nombre no es válido.';
    case 'lastName':
      return 'El apellido no es válido.';
    case 'email':
      return 'El correo no es válido.';
    case 'phone':
      return 'El teléfono no es válido.';
    case 'address':
      return 'La dirección no es válida.';
    case 'educationSummary':
      return 'El resumen de educación no es válido.';
    case 'experienceSummary':
      return 'El resumen de experiencia no es válido.';
    case 'cv':
      return 'El CV no es válido.';
    default:
      return 'Este campo no es válido.';
  }
}

/** Jest module mocks can yield a different class identity than `instanceof` expects. */
function isCandidateServiceError(e: unknown): e is CandidateServiceError {
  if (e instanceof CandidateServiceError) return true;
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { name?: string }).name === 'CandidateServiceError' &&
    typeof (e as CandidateServiceError).status === 'number'
  );
}

function mapServiceErrorToUi(err: CandidateServiceError): {
  formError: string;
  fieldExtras: FieldErrors;
} {
  const fieldExtras: FieldErrors = {};
  const { status, code, details } = err;

  if (code === 'DUPLICATE_EMAIL' || status === 409) {
    return {
      formError: 'Ya existe un candidato con este correo electrónico.',
      fieldExtras: { email: 'Este correo ya está registrado.' },
    };
  }
  if (code === 'PAYLOAD_TOO_LARGE' || status === 413) {
    return {
      formError: 'El CV es demasiado grande. Reduce el tamaño e inténtalo de nuevo.',
      fieldExtras: {},
    };
  }
  if (code === 'INVALID_FILE_TYPE') {
    return {
      formError: '',
      fieldExtras: { cv: 'El CV debe ser PDF, DOC o DOCX.' },
    };
  }
  if (status === 401) {
    return {
      formError: 'Debes iniciar sesión para continuar.',
      fieldExtras: {},
    };
  }
  if (code === 'NETWORK' || status === 0) {
    return {
      formError:
        'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
      fieldExtras: {},
    };
  }
  if (code === 'VALIDATION_ERROR' && details?.length) {
    for (const d of details) {
      const key = d.field;
      if (key && (key in initialValues || key === 'cv')) {
        fieldExtras[key] = spanishMessageForServerField(key);
      }
    }
    return {
      formError: 'Revisa los campos marcados.',
      fieldExtras,
    };
  }
  if (code === 'VALIDATION_ERROR') {
    return { formError: 'Revisa los datos del formulario.', fieldExtras: {} };
  }
  if (status >= 500 || code === 'INTERNAL_ERROR') {
    return {
      formError: 'No se pudo guardar el candidato. Inténtalo más tarde.',
      fieldExtras: {},
    };
  }
  return {
    formError: 'No se pudo completar la acción. Inténtalo de nuevo.',
    fieldExtras: {},
  };
}

export const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ onSuccess }) => {
  const [values, setValues] = useState<CreateCandidatePayload>(initialValues);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cvHelpId = useId();
  const formErrorId = useId();

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setCvFile(null);
    setFileInputKey((k) => k + 1);
    setFieldErrors({});
    setFormError(null);
    setSuccessVisible(false);
  }, []);

  const handleChange =
    (field: keyof CreateCandidatePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccessVisible(false);

    const validation = validateCandidateForm(values, cvFile);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCandidate(values, cvFile);
      setSuccessVisible(true);
      onSuccess?.(created);
    } catch (unknownErr) {
      if (isCandidateServiceError(unknownErr)) {
        const { formError: fe, fieldExtras } = mapServiceErrorToUi(unknownErr);
        if (fe) setFormError(fe);
        if (Object.keys(fieldExtras).length) {
          setFieldErrors(fieldExtras);
        }
      } else {
        console.error('Create candidate failed: unexpected error');
        setFormError('No se pudo guardar el candidato. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate aria-describedby={formError ? formErrorId : undefined}>
      {successVisible && (
        <Alert variant="success" className="mb-3" dismissible onClose={() => setSuccessVisible(false)}>
          Candidato añadido correctamente.
        </Alert>
      )}
      {formError ? (
        <Alert id={formErrorId} variant="danger" role="alert" className="mb-3">
          {formError}
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="candidate-firstName">
            <Form.Label>
              Nombre <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={values.firstName}
              onChange={handleChange('firstName')}
              isInvalid={Boolean(fieldErrors.firstName)}
              required
              aria-required
              maxLength={100}
              autoComplete="given-name"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.firstName}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group controlId="candidate-lastName">
            <Form.Label>
              Apellidos <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={values.lastName}
              onChange={handleChange('lastName')}
              isInvalid={Boolean(fieldErrors.lastName)}
              required
              aria-required
              maxLength={100}
              autoComplete="family-name"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.lastName}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="candidate-email">
            <Form.Label>
              Correo electrónico <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange('email')}
              isInvalid={Boolean(fieldErrors.email)}
              required
              aria-required
              autoComplete="email"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group controlId="candidate-phone">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange('phone')}
              isInvalid={Boolean(fieldErrors.phone)}
              maxLength={15}
              autoComplete="tel"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group controlId="candidate-address">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={values.address}
              onChange={handleChange('address')}
              isInvalid={Boolean(fieldErrors.address)}
              maxLength={100}
              autoComplete="street-address"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.address}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="candidate-education">
            <Form.Label>Educación</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="educationSummary"
              value={values.educationSummary}
              onChange={handleChange('educationSummary')}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="candidate-experience">
            <Form.Label>Experiencia laboral</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="experienceSummary"
              value={values.experienceSummary}
              onChange={handleChange('experienceSummary')}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="candidate-cv">
            <Form.Label>CV (opcional)</Form.Label>
            <Form.Control
              key={fileInputKey}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-describedby={cvHelpId}
              isInvalid={Boolean(fieldErrors.cv)}
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                const f = ev.target.files?.[0] ?? null;
                setCvFile(f);
              }}
            />
            <Form.Text id={cvHelpId} muted>
              Formatos permitidos: PDF, DOC, DOCX. Tamaño máximo: 10 MB.
            </Form.Text>
            <Form.Control.Feedback type="invalid">{fieldErrors.cv}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <Button type="submit" variant="primary" disabled={submitting} data-testid="add-candidate-submit">
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" aria-hidden />
              Guardando…
            </>
          ) : (
            'Guardar candidato'
          )}
        </Button>
        {successVisible && (
          <Button type="button" variant="outline-secondary" onClick={resetForm}>
            Añadir otro
          </Button>
        )}
      </div>
    </Form>
  );
};
