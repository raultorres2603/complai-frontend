import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../__tests__/test-utils';
import TourButton from '../TourButton';

const mockStartTour = vi.fn();

vi.mock('../../hooks/useTour', () => ({
  useTour: () => ({ startTour: mockStartTour }),
}));

beforeEach(() => {
  mockStartTour.mockClear();
});

describe('TourButton', () => {
  it('renders a button with aria-label "Start guided tour"', () => {
    render(<TourButton />);
    expect(screen.getByRole('button', { name: /start guided tour/i })).toBeInTheDocument();
  });

  it('calls startTour when clicked', async () => {
    const { user } = render(<TourButton />);
    const button = screen.getByRole('button', { name: /start guided tour/i });
    await user.click(button);
    expect(mockStartTour).toHaveBeenCalledTimes(1);
  });

  it('button has data-tour="tour-button" attribute', () => {
    render(<TourButton />);
    const button = screen.getByRole('button', { name: /start guided tour/i });
    expect(button.getAttribute('data-tour')).toBe('tour-button');
  });
});
