/**
 * FeedbackModal Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { fireEvent } from '@testing-library/react';
import FeedbackModal from '../FeedbackModal';

const mockSubmitFeedback = vi.fn();
const mockResetState = vi.fn();

let mockHookState = {
  isLoading: false,
  error: null as string | null,
  success: false,
  submitFeedback: mockSubmitFeedback,
  resetState: mockResetState,
};

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: () => mockHookState,
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        feedback_modal_title: 'Enviar Comentario',
        feedback_message_placeholder: '¿Cómo podemos mejorar?',
        feedback_submit: 'Enviar',
        feedback_cancel: 'Cancelar',
        feedback_success: 'Tu comentario ha sido enviado correctamente. ¡Gracias!',
        close: 'Cerrar',
      };
      return map[key] ?? key;
    },
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  jwtToken: 'test-token',
};

describe('FeedbackModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookState = {
      isLoading: false,
      error: null,
      success: false,
      submitFeedback: mockSubmitFeedback,
      resetState: mockResetState,
    };
    defaultProps.onClose = vi.fn();
  });

  it('renders nothing when isOpen=false', () => {
    render(<FeedbackModal isOpen={false} onClose={vi.fn()} jwtToken={null} />);
    expect(screen.queryByText('Enviar Comentario')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen=true', () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('Enviar Comentario')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('submit button is disabled when textarea is empty', () => {
    render(<FeedbackModal {...defaultProps} />);
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).toBeDisabled();
  });

  it('submit button becomes enabled after typing', () => {
    render(<FeedbackModal {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'some feedback' } });
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls submitFeedback with trimmed message on submit', async () => {
    mockSubmitFeedback.mockResolvedValueOnce(undefined);

    render(<FeedbackModal {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: ' hello world ' } });

    const submitButton = screen.getByText('Enviar');
    fireEvent.click(submitButton);

    expect(mockSubmitFeedback).toHaveBeenCalledWith('hello world');
  });

  it('displays error message when hook returns error', () => {
    mockHookState = { ...mockHookState, error: 'some error' };
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('some error')).toBeInTheDocument();
  });

  it('displays success message and hides textarea when success=true', () => {
    mockHookState = { ...mockHookState, success: true };
    render(<FeedbackModal {...defaultProps} />);
    expect(
      screen.getByText('Tu comentario ha sido enviado correctamente. ¡Gracias!')
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls onClose and resetState when cancel clicked', () => {
    render(<FeedbackModal {...defaultProps} />);
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    expect(mockResetState).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
