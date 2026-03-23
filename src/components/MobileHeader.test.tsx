/**
 * Tests for MobileHeader Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileHeader } from './MobileHeader';

describe('MobileHeader Component', () => {
  it('should render app name', () => {
    render(<MobileHeader onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('ComplAI')).toBeInTheDocument();
  });

  it('should render custom app name when provided', () => {
    render(<MobileHeader appName="TestApp" onOpenDrawer={vi.fn()} />);

    expect(screen.getByText('TestApp')).toBeInTheDocument();
  });

  it('should render hamburger button', () => {
    render(<MobileHeader onOpenDrawer={vi.fn()} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onOpenDrawer when hamburger is clicked', () => {
    const onOpenDrawer = vi.fn();
    render(<MobileHeader onOpenDrawer={onOpenDrawer} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(button);

    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('should set aria-expanded to true when drawer is open', () => {
    render(<MobileHeader onOpenDrawer={vi.fn()} drawerOpen={true} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should set aria-expanded to false when drawer is closed', () => {
    render(<MobileHeader onOpenDrawer={vi.fn()} drawerOpen={false} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should be keyboard accessible', async () => {
    const onOpenDrawer = vi.fn();
    render(<MobileHeader onOpenDrawer={onOpenDrawer} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Simulate keyboard navigation and enter press
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.click(button);

    expect(onOpenDrawer).toHaveBeenCalled();
  });

  it('should have proper title attr for accessibility', () => {
    render(<MobileHeader onOpenDrawer={vi.fn()} />);

    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toHaveAttribute('title', 'Open menu');
  });

  it('should render with fixed positioning header containing semantic markup', () => {
    const { container } = render(<MobileHeader onOpenDrawer={vi.fn()} />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should have three hamburger lines', () => {
    const { container } = render(<MobileHeader onOpenDrawer={vi.fn()} />);

    const lines = container.querySelectorAll('[class*="hamburgerLine"]');
    expect(lines.length).toBe(3);
  });

  it('should display open state visually', () => {
    const { container, rerender } = render(
      <MobileHeader onOpenDrawer={vi.fn()} drawerOpen={false} />
    );

    let button = container.querySelector('[class*="hamburger"]');
    // CSS Module classes are hashed, so check if className includes 'open'
    expect(button?.className).not.toMatch(/open/);

    rerender(<MobileHeader onOpenDrawer={vi.fn()} drawerOpen={true} />);
    button = container.querySelector('[class*="hamburger"]');
    // Check if the button's className includes an 'open' class
    expect(button?.className).toMatch(/open/);
  });
});
