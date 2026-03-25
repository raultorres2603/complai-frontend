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
        feedback_label_name: 'Nombre Completo',
        feedback_placeholder_name: 'Ingresa tu nombre completo',
        feedback_label_id: 'Número de Identificación',
        feedback_placeholder_id: 'Ingresa tu número de identificación',
        feedback_message_placeholder: '¿Cómo podemos mejorar?',
        feedback_submit: 'Enviar',
        feedback_cancel: 'Cancelar',
        feedback_success: 'Tu comentario ha sido enviado correctamente. ¡Gracias!',
        feedback_privacy_notice_title: 'Aviso de Privacidad',
        feedback_privacy_notice_description: 'Por tu seguridad, no ingreses un número de identificación real. Puedes usar un número ficticio o dejarlo en blanco.',
        feedback_id_helper_text: 'No ingreses datos reales. Puedes usar un número ficticio para propósitos de demostración.',
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

  it('renders idUser input field with correct label and placeholder', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación') as HTMLInputElement;
    expect(idUserInput).toBeInTheDocument();
    const label = screen.getByText('Número de Identificación');
    expect(label).toBeInTheDocument();
  });

  it('renders userName input field with correct label and placeholder', () => {
    render(<FeedbackModal {...defaultProps} />);
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo') as HTMLInputElement;
    expect(userNameInput).toBeInTheDocument();
    const label = screen.getByText('Nombre Completo');
    expect(label).toBeInTheDocument();
  });

  it('updates idUser state on input change', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación') as HTMLInputElement;
    fireEvent.change(idUserInput, { target: { value: '123456' } });
    expect(idUserInput.value).toBe('123456');
  });

  it('updates userName state on input change', () => {
    render(<FeedbackModal {...defaultProps} />);
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo') as HTMLInputElement;
    fireEvent.change(userNameInput, { target: { value: 'John Doe' } });
    expect(userNameInput.value).toBe('John Doe');
  });

  it('submit button is disabled when idUser is empty', () => {
    render(<FeedbackModal {...defaultProps} />);
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
    const messageInput = screen.getByPlaceholderText('¿Cómo podemos mejorar?');
    fireEvent.change(userNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(messageInput, { target: { value: 'feedback' } });
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).toBeDisabled();
  });

  it('submit button is disabled when userName is empty', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación');
    const messageInput = screen.getByPlaceholderText('¿Cómo podemos mejorar?');
    fireEvent.change(idUserInput, { target: { value: '123456' } });
    fireEvent.change(messageInput, { target: { value: 'feedback' } });
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).toBeDisabled();
  });

  it('submit button is disabled when message is empty', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación');
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
    fireEvent.change(idUserInput, { target: { value: '123456' } });
    fireEvent.change(userNameInput, { target: { value: 'John Doe' } });
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when all three fields are filled', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación');
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
    const messageInput = screen.getByPlaceholderText('¿Cómo podemos mejorar?');
    
    fireEvent.change(idUserInput, { target: { value: '123456' } });
    fireEvent.change(userNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(messageInput, { target: { value: 'feedback' } });
    
    const submitButton = screen.getByText('Enviar');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls submitFeedback with all three parameters', async () => {
    mockSubmitFeedback.mockResolvedValueOnce(undefined);

    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación');
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
    const messageInput = screen.getByPlaceholderText('¿Cómo podemos mejorar?');
    
    fireEvent.change(idUserInput, { target: { value: ' 123456 ' } });
    fireEvent.change(userNameInput, { target: { value: ' John Doe ' } });
    fireEvent.change(messageInput, { target: { value: ' hello world ' } });

    const submitButton = screen.getByText('Enviar');
    fireEvent.click(submitButton);

    expect(mockSubmitFeedback).toHaveBeenCalledWith('123456', 'John Doe', 'hello world');
  });

  it('displays error message when hook returns error', () => {
    mockHookState = { ...mockHookState, error: 'some error' };
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('some error')).toBeInTheDocument();
  });

  it('displays success message and hides form inputs when success=true', () => {
    mockHookState = { ...mockHookState, success: true };
    render(<FeedbackModal {...defaultProps} />);
    expect(
      screen.getByText('Tu comentario ha sido enviado correctamente. ¡Gracias!')
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Ingresa tu número de identificación')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Ingresa tu nombre completo')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('¿Cómo podemos mejorar?')).not.toBeInTheDocument();
  });

  it('resets all three field values on modal close', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación') as HTMLInputElement;
    const userNameInput = screen.getByPlaceholderText('Ingresa tu nombre completo') as HTMLInputElement;
    const messageInput = screen.getByPlaceholderText('¿Cómo podemos mejorar?') as HTMLInputElement;
    
    fireEvent.change(idUserInput, { target: { value: '123456' } });
    fireEvent.change(userNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(messageInput, { target: { value: 'feedback' } });
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockResetState).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose and resetState when cancel clicked', () => {
    render(<FeedbackModal {...defaultProps} />);
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    expect(mockResetState).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders privacy notice title with correct translation', () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('Aviso de Privacidad')).toBeInTheDocument();
  });

  it('renders privacy notice description with correct translation', () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('Por tu seguridad, no ingreses un número de identificación real. Puedes usar un número ficticio o dejarlo en blanco.')).toBeInTheDocument();
  });

  it('renders helper text below idUser input field', () => {
    render(<FeedbackModal {...defaultProps} />);
    expect(screen.getByText('No ingreses datos reales. Puedes usar un número ficticio para propósitos de demostración.')).toBeInTheDocument();
  });

  it('idUser input has aria-describedby attribute pointing to helper text', () => {
    render(<FeedbackModal {...defaultProps} />);
    const idUserInput = screen.getByPlaceholderText('Ingresa tu número de identificación');
    expect(idUserInput).toHaveAttribute('aria-describedby', 'feedback-iduser-helper');
  });
});
