/**
 * AccessibilityPanel Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@/__tests__/test-utils';
import { renderWithDOM as render } from '@/__tests__/test-utils';
import { AccessibilityPanel } from '../AccessibilityPanel';

describe('AccessibilityPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('should render when isVisible is true', () => {
    render(<AccessibilityPanel isVisible={true} />);
    expect(screen.getByText('Configuración de Accesibilidad')).toBeInTheDocument();
  });

  it('should not render when isVisible is false', () => {
    const { container } = render(<AccessibilityPanel isVisible={false} />);
    expect(container.querySelector('.overlay')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AccessibilityPanel isVisible={true} onClose={handleClose} />);
    const closeButton = screen.getByLabelText('Cerrar');
    closeButton.click();
    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    render(<AccessibilityPanel isVisible={true} onClose={handleClose} />);
    const overlay = screen.getByLabelText('Close accessibility settings');
    overlay.click();
    expect(handleClose).toHaveBeenCalled();
  });

  it('should not call onClose when panel content is clicked', () => {
    const handleClose = vi.fn();
    render(<AccessibilityPanel isVisible={true} onClose={handleClose} />);
    const title = screen.getByText('Configuración de Accesibilidad');
    title.click();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should display color blindness filter dropdown', () => {
    render(<AccessibilityPanel isVisible={true} />);
    expect(screen.getByLabelText('Color blindness filter type')).toBeInTheDocument();
  });

  it('should display all color blindness options', () => {
    render(<AccessibilityPanel isVisible={true} />);
    expect(screen.getByText('Normal Vision')).toBeInTheDocument();
    expect(screen.getByText('Deuteranopia (Red-Green Blindness)')).toBeInTheDocument();
    expect(screen.getByText('Protanopia (Red Blindness)')).toBeInTheDocument();
    expect(screen.getByText('Tritanopia (Blue-Yellow Blindness)')).toBeInTheDocument();
  });

  it('should display section headers for all features', () => {
    render(<AccessibilityPanel isVisible={true} />);
    expect(screen.getByText('Filtro de Daltonismo')).toBeInTheDocument();
    expect(screen.getByText('Texto a Voz')).toBeInTheDocument();
  });

  it('should have color blindness section expanded by default', () => {
    render(<AccessibilityPanel isVisible={true} />);
    const buttons = screen.getAllByRole('button');
    const daltonismButton = buttons.find((btn: HTMLElement) => btn.textContent.includes('Filtro de Daltonismo'));
    expect(daltonismButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should change color blindness filter when dropdown option is selected', () => {
    render(<AccessibilityPanel isVisible={true} />);
    const select = screen.getByLabelText('Color blindness filter type') as HTMLSelectElement;
    expect(select.value).toBe('normal');

    select.value = 'deuteranopia';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(document.body.classList.contains('filter-deuteranopia')).toBe(true);
  });

  it('should show preview of selected color blindness filter', () => {
    render(<AccessibilityPanel isVisible={true} />);
    // Check for preview element by looking for the preview label text
    const previewElements = screen.queryAllByText((content) => content.includes('Vista Previa') || content.includes('Preview'));
    expect(previewElements.length).toBeGreaterThan(0);
  });

  it('should display accessibility settings note', () => {
    render(<AccessibilityPanel isVisible={true} />);
    expect(
      screen.getByText(/Settings are automatically saved and will persist across sessions/i)
    ).toBeInTheDocument();
  });

  it('should persist color blindness filter setting to localStorage', () => {
    render(<AccessibilityPanel isVisible={true} />);
    const select = screen.getByLabelText('Color blindness filter type') as HTMLSelectElement;
    select.value = 'protanopia';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    const stored = localStorage.getItem('complai_accessibility');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.colorBlindnessType).toBe('protanopia');
  });

  it('should show 4 color blindness options in dropdown', () => {
    const { container } = render(<AccessibilityPanel isVisible={true} />);
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBe(4);
  });

  it('should apply different color filters to body', () => {
    render(<AccessibilityPanel isVisible={true} />);
    const select = screen.getByLabelText('Color blindness filter type') as HTMLSelectElement;

    select.value = 'normal';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.body.classList.contains('filter-normal')).toBe(true);

    select.value = 'deuteranopia';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.body.classList.contains('filter-deuteranopia')).toBe(true);

    select.value = 'protanopia';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.body.classList.contains('filter-protanopia')).toBe(true);

    select.value = 'tritanopia';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.body.classList.contains('filter-tritanopia')).toBe(true);
  });
});
