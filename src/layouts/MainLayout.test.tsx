/**
 * MainLayout Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

describe('MainLayout Component', () => {
  it('should render the layout with two columns', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat Window</div>}
        controlPanel={<div data-testid="control-panel">Control Panel</div>}
      />
    );

    const layoutElement = container.querySelector('[class*="layout"]');
    expect(layoutElement).toBeInTheDocument();
  });

  it('should render chatWindow in the main (left) column', () => {
    render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat Window Content</div>}
        controlPanel={<div data-testid="control-panel">Control Panel</div>}
      />
    );

    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.getByText('Chat Window Content')).toBeInTheDocument();
  });

  it('should render controlPanel in the sidebar (right) column', () => {
    render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat Window</div>}
        controlPanel={<div data-testid="control-panel">Control Panel Content</div>}
      />
    );

    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByText('Control Panel Content')).toBeInTheDocument();
  });

  it('should render with proper semantic structure', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat</div>}
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const mainElement = container.querySelector('main');
    const asideElement = container.querySelector('aside');

    expect(mainElement).toBeInTheDocument();
    expect(asideElement).toBeInTheDocument();
  });

  it('should maintain layout structure with different content sizes', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window" style={{ height: '100%' }}>Chat Window with Full Height</div>}
        controlPanel={<div data-testid="control-panel">Control Panel</div>}
      />
    );

    const layoutElement = container.querySelector('[class*="layout"]');
    const mainElement = container.querySelector('main');

    expect(layoutElement).toBeInTheDocument();
    expect(mainElement).toBeInTheDocument();
  });
});

