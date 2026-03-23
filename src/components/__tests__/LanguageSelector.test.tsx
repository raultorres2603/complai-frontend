/**
 * LanguageSelector Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { AVAILABLE_LANGUAGES } from '../types/accessibility.types';

describe('LanguageSelector', () => {
  it('renders with current language flag and label', () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('🇪🇸');
    expect(trigger).toHaveTextContent('Español');
  });

  it('opens dropdown menu when trigger is clicked', async () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    });
  });

  it('closes dropdown when escape key is pressed', async () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    // Verify dropdown is open
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /english/i })).not.toBeInTheDocument();
    });
  });

  it('calls callback when language is selected', async () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      const enOption = screen.getByRole('option', { name: /english/i });
      fireEvent.click(enOption);
    });

    expect(mockCallback).toHaveBeenCalledWith('en');
  });

  it('closes dropdown after selection', async () => {
    const mockCallback = vi.fn();
    const { rerender } = render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      const enOption = screen.getByRole('option', { name: /english/i });
      fireEvent.click(enOption);
    });

    // Rerender with new language
    rerender(
      <LanguageSelector
        currentLanguage="en"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    // Dropdown should be closed
    expect(screen.queryByRole('option', { name: /english/i })).not.toBeInTheDocument();
  });

  it('displays selected language with proper styling', () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="en"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    const enOption = screen.getByRole('option', { name: /english/i });
    expect(enOption).toHaveAttribute('aria-selected', 'true');
  });

  it('displays all available languages in dropdown', async () => {
    const mockCallback = vi.fn();
    render(
      <LanguageSelector
        currentLanguage="es"
        onSelectLanguage={mockCallback}
        availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
      />
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /español/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /català/i })).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    const mockCallback = vi.fn();
    const { container: _container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageSelector
          currentLanguage="es"
          onSelectLanguage={mockCallback}
          availableLanguages={Object.values(AVAILABLE_LANGUAGES)}
        />
      </div>
    );

    const trigger = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(trigger);

    // Verify dropdown is open
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument();
    });

    // Click outside
    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /english/i })).not.toBeInTheDocument();
    });
  });
});
