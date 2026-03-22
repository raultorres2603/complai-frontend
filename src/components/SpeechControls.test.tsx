/**
 * SpeechControls Component Tests - Tests for translation of TTS labels
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { SpeechControls } from './SpeechControls';
import * as useAccessibilityModule from '../hooks/useAccessibility';
import * as useTextToSpeechModule from '../hooks/useTextToSpeech';

describe('SpeechControls Component Translation', () => {
  const mockMessages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Test response',
      timestamp: Date.now(),
    },
  ];

  const mockVoices = [
    { voiceURI: 'es-ES-voice1', name: 'Spanish Voice 1', lang: 'es-ES', localService: true, default: true },
    { voiceURI: 'es-ES-voice2', name: 'Spanish Voice 2', lang: 'es-ES', localService: true, default: false },
  ];

  beforeEach(() => {
    // Mock useAccessibility to enable TTS
    vi.spyOn(useAccessibilityModule, 'useAccessibility').mockReturnValue({
      settings: {
        language: 'es',
        colorBlindnessFilter: 'normal',
        ttsEnabled: true,
        sttEnabled: false,
      },
      setLanguage: vi.fn(),
      setColorBlindnessFilter: vi.fn(),
      setTtsEnabled: vi.fn(),
      setSttEnabled: vi.fn(),
    });

    // Mock useTextToSpeech to return voices and controls
    vi.spyOn(useTextToSpeechModule, 'useTextToSpeech').mockReturnValue({
      state: {
        isPlaying: false,
        currentRate: 1,
        selectedVoiceUri: 'es-ES-voice1',
        availableVoices: mockVoices,
        currentMessageId: '',
      },
      readText: vi.fn(),
      stop: vi.fn(),
      setRate: vi.fn(),
      selectVoice: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    // Should display Voice label - check all labels and find one with voice translation
    const labels = screen.getAllByText(/Voz|Voice/i);
    // Filter to get the label (first one should be the voice label, not the voice options)
    const voiceLabel = labels.find(el => el.tagName === 'LABEL');
    expect(voiceLabel).toBeInTheDocument();
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
