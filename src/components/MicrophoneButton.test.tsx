/**
 * MicrophoneButton Component Tests - Tests for translation of listening status and tooltips
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { MicrophoneButton } from './MicrophoneButton';

describe('MicrophoneButton Component Translation', () => {
  const mockOnTranscript = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render microphone button when STT is enabled', () => {
    render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={false}
        sttEnabled={true}
      />
    );

    // Find the button with the microphone icon
    const buttons = screen.getAllByRole('button');
    const microButton = buttons.find(btn => btn.textContent?.includes('🎤'));
    expect(microButton).toBeInTheDocument();
  });

  it('should not render when STT is disabled', () => {
    const { container } = render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={false}
        sttEnabled={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should have translated tooltip for start listening', () => {
    render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={false}
        sttEnabled={true}
      />
    );

    // Find the button with the microphone icon
    const buttons = screen.getAllByRole('button');
    const microButton = buttons.find(btn => btn.textContent?.includes('🎤'));
    expect(microButton).toHaveAttribute('title', expect.stringMatching(/Comenzar escucha|Start listening/i));
  });

  it('should have translated aria-label for accessibility', () => {
    render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={false}
        sttEnabled={true}
      />
    );

    // Find the button with the microphone icon
    const buttons = screen.getAllByRole('button');
    const microButton = buttons.find(btn => btn.textContent?.includes('🎤'));
    expect(microButton).toHaveAttribute('aria-label', expect.stringMatching(/Comenzar escucha|Start listening/i));
  });

  it('should display microphone icon', () => {
    render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={false}
        sttEnabled={true}
      />
    );

    expect(screen.getByText('🎤')).toBeInTheDocument();
  });

  it('should become disabled when disabled prop is true', () => {
    render(
      <MicrophoneButton
        onTranscript={mockOnTranscript}
        disabled={true}
        sttEnabled={true}
      />
    );

    // Find the button with the microphone icon
    const buttons = screen.getAllByRole('button');
    const microButton = buttons.find(btn => btn.textContent?.includes('🎤'));
    expect(microButton).toBeDisabled();
  });
});
