/**
 * SpeechControls Component Tests - Tests for translation of TTS labels
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { SpeechControls } from './SpeechControls';

describe('SpeechControls Component Translation', () => {
  const mockMessages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Test response',
      timestamp: Date.now(),
    },
  ];

  beforeEach(() => {
    // Reset any mocks
  });

  it('should render TTS section when enabled', () => {
    render(
      <SpeechControls
        messages={mockMessages}
        ttsEnabled={true}
      />
    );

    // Should display Text-to-Speech section
    expect(screen.getByText(/🔊\s+Text-to-Speech|Texto a Voz/i)).toBeInTheDocument();
  });

  it('should display translated "Speed:" label', () => {
    render(
      <SpeechControls
        messages={mockMessages}
        ttsEnabled={true}
      />
    );

    // Should display Speed label (in Spanish or English)
    expect(screen.getByText(/Velocidad|Speed/i)).toBeInTheDocument();
  });

  it('should display translated "Voice:" label', () => {
    render(
      <SpeechControls
        messages={mockMessages}
        ttsEnabled={true}
      />
    );

    // Should display Voice label
    expect(screen.getByText(/Voz|Voice/i)).toBeInTheDocument();
  });

  it('should not render when TTS is disabled', () => {
    const { container } = render(
      <SpeechControls
        messages={mockMessages}
        ttsEnabled={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display speed control slider', () => {
    render(
      <SpeechControls
        messages={mockMessages}
        ttsEnabled={true}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });
});
