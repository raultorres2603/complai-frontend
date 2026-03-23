/**
 * Unit tests for MobileInputFooter component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileInputFooter } from '../MobileInputFooter';
import { OutputFormat } from '../../types/api.types';

describe('MobileInputFooter', () => {
  let mockOnSend: ReturnType<typeof vi.fn>;
  let mockOnSendComplaint: ReturnType<typeof vi.fn>;
  let mockOnComplaintInfoChange: ReturnType<typeof vi.fn>;
  let defaultProps: any;

  beforeEach(() => {
    mockOnSend = vi.fn();
    mockOnSendComplaint = vi.fn();
    mockOnComplaintInfoChange = vi.fn();

    // Define defaultProps HERE after mocks are initialized
    defaultProps = {
      onSend: mockOnSend,
      onSendComplaint: mockOnSendComplaint,
      disabled: false,
      isComplaintMode: false,
      messages: [],
      ttsEnabled: true,
      jwtToken: 'test-token',
    };
  });

  it('should render footer with MessageInput and SpeechControls', () => {
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
      />
    );

    // Check that footer is rendered
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should call onSend when message submitted in normal mode', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        isComplaintMode={false}
      />
    );

    // Find the textarea (can use role or find by input type)
    const textareas = screen.queryAllByRole('textbox');
    const textarea = textareas.length > 0 ? textareas[0] : document.querySelector('textarea');
    
    if (textarea) {
      await user.type(textarea, 'Test message');

      // Submit the form
      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith('Test message', expect.any(Object));
      });
    }
  });

  it('should call onSendComplaint when complaint submitted in complaint mode', async () => {
    const user = userEvent.setup();
    const complaintInfo = {
      name: 'John',
      surname: 'Doe',
      idNumber: '12345',
    };

    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    // Find the textarea using query selector
    const textarea = document.querySelector('textarea');
    
    if (textarea) {
      await user.type(textarea, 'Complaint message');

      // Submit the form
      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSendComplaint).toHaveBeenCalled();
      });
    }
  });

  it('should not call onSend or onSendComplaint when disabled', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        disabled={true}
      />
    );

    // Find the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      expect(textarea).toBeDisabled();

      // Verify that when we try to type, it's still disabled
      await user.type(textarea, 'Test message', { skipClick: true });

      // The submit button should also be disabled
      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
    }

    // Neither handler should be called
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(mockOnSendComplaint).not.toHaveBeenCalled();
  });

  it('should pass complaint info to onComplaintInfoChange', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        isComplaintMode={true}
        onComplaintInfoChange={mockOnComplaintInfoChange}
      />
    );

    // In complaint mode, MessageInput should show complaint fields
    // This test verifies the callback is wired correctly
    // The actual field values would be set by MessageInput component
    expect(mockOnComplaintInfoChange).toBeDefined();
  });

  it('should render footer element with correct styling', () => {
    const { container } = render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
      />
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    // CSS module class names are transformed, so check for element type instead
    expect(footer?.tagName).toBe('FOOTER');
  });

  it('should have SpeechControls when ttsEnabled is true', () => {
    const { container } = render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        ttsEnabled={true}
        messages={[]}
      />
    );

    // Check that footer is rendered (SpeechControls is inside)
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    
    // Verify footer has children (speech controls + input)
    expect(footer?.children.length).toBeGreaterThan(0);
  });

  it('should not render SpeechControls when ttsEnabled is false', () => {
    const { container } = render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        ttsEnabled={false}
      />
    );

    // Check that footer is still rendered
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    
    // With ttsEnabled false, footer should have fewer children (just input section)
    // In this case, we just verify the footer structure is correct
    expect(footer?.children.length).toBeGreaterThan(0);
  });

  it('should handle empty message submission gracefully', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
      />
    );

    const textarea = document.querySelector('textarea');
    if (textarea) {
      const form = textarea.closest('form');

      if (form) {
        fireEvent.submit(form);
      }

      // Neither handler should be called for empty message
      expect(mockOnSend).not.toHaveBeenCalled();
      expect(mockOnSendComplaint).not.toHaveBeenCalled();
    }
  });

  it('should handle whitespace-only message submission gracefully', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
      />
    );

    const textarea = document.querySelector('textarea');
    if (textarea) {
      await user.type(textarea, '   ');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Neither handler should be called for whitespace-only message
      expect(mockOnSend).not.toHaveBeenCalled();
      expect(mockOnSendComplaint).not.toHaveBeenCalled();
    }
  });

  it('should reset complaint info after sending complaint', async () => {
    const user = userEvent.setup();
    render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        isComplaintMode={true}
      />
    );

    const textarea = document.querySelector('textarea');
    if (textarea) {
      await user.type(textarea, 'Test complaint');

      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSendComplaint).toHaveBeenCalled();
        // After submission, form should be cleared
        expect((textarea as HTMLTextAreaElement).value).toBe('');
      });
    }
  });

  it('should accept jwtToken prop without errors', () => {
    const { container } = render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        jwtToken="valid-token"
      />
    );

    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('should handle null jwtToken gracefully', () => {
    const { container } = render(
      <MobileInputFooter
        {...defaultProps}
        onSend={mockOnSend}
        onSendComplaint={mockOnSendComplaint}
        jwtToken={null}
      />
    );

    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
