/**
 * Header Component Tests - Tests for complaint mode button with translations
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Header } from '../Header';

describe('Header Component', () => {
  it('should render the Header component', () => {
    render(<Header isComplaintMode={false} onToggleComplaint={() => {}} />);
    
    expect(screen.getByText('ComplAI')).toBeInTheDocument();
    expect(screen.getByText('Citizen Support Chatbot')).toBeInTheDocument();
  });

  it('should display "Ask a question" button text when not in complaint mode', () => {
    render(<Header isComplaintMode={false} onToggleComplaint={() => {}} />);
    
    // Should display the Spanish translation by default
    expect(screen.getByText(/Hacer una pregunta|Ask a question/i)).toBeInTheDocument();
  });

  it('should display "Complaint mode" button text when in complaint mode', () => {
    render(<Header isComplaintMode={true} onToggleComplaint={() => {}} />);
    
    // Should display the Spanish translation by default
    expect(screen.getByText(/Modo de Reclamación|Complaint mode/i)).toBeInTheDocument();
  });

  it('should call onToggleComplaint when mode button is clicked', async () => {
    const mockToggle = vi.fn();
    const { container } = render(<Header isComplaintMode={false} onToggleComplaint={mockToggle} />);
    
    // Find the mode button (it should be the button with the aria-pressed attribute, not the accessibility button)
    const buttons = container.querySelectorAll('button');
    // The mode button should be the third button (after accessibility and language buttons)
    const modeButton = Array.from(buttons).find(btn => btn.hasAttribute('aria-pressed'));
    
    if (modeButton) {
      modeButton.click();
      expect(mockToggle).toHaveBeenCalled();
    }
  });

  it('should have accessibility settings button', () => {
    render(<Header isComplaintMode={false} onToggleComplaint={() => {}} />);
    
    const a11yButton = screen.getByRole('button', { name: /Configuración de Accesibilidad|Accessibility Settings/i });
    expect(a11yButton).toBeInTheDocument();
  });

  it('should render mode button with correct aria-pressed attribute', () => {
    const { rerender, container } = render(<Header isComplaintMode={false} onToggleComplaint={() => {}} />);
    
    let modeButton = Array.from(container.querySelectorAll('button')).find(btn => btn.hasAttribute('aria-pressed'));
    expect(modeButton).toHaveAttribute('aria-pressed', 'false');
    
    rerender(<Header isComplaintMode={true} onToggleComplaint={() => {}} />);
    modeButton = Array.from(container.querySelectorAll('button')).find(btn => btn.hasAttribute('aria-pressed'));
    expect(modeButton).toHaveAttribute('aria-pressed', 'true');
  });
});
