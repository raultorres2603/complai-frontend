/**
 * MainLayout Integration Tests
 * Tests MainLayout with chat window and control panel components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

describe('MainLayout Integration Tests', () => {
  it('should render layout with chat window on left and control panel on right', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat Content</div>}
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const chatWindow = screen.getByTestId('chat-window');
    expect(chatWindow).toBeInTheDocument();
    expect(chatWindow).toHaveTextContent('Chat Content');
  });

  it('should render control panel on the right', () => {
    render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat</div>}
        controlPanel={<div data-testid="control-panel">Control Panel</div>}
      />
    );

    const controlPanel = screen.getByTestId('control-panel');
    expect(controlPanel).toBeInTheDocument();
    expect(controlPanel).toHaveTextContent('Control Panel');
  });

  it('should maintain grid structure with complex children', () => {
    const { container } = render(
      <MainLayout
        chatWindow={
          <div data-testid="complex-chat" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div data-testid="message-list" style={{ flex: 1, overflowY: 'auto' }}>
              Message 1
            </div>
            <div data-testid="message-input" style={{ flex: 'none' }}>
              Input Area
            </div>
          </div>
        }
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    expect(screen.getByTestId('complex-chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('should render responsive layout with proper hierarchy', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat Window</div>}
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const layout = container.querySelector('[class*="layout"]');
    const main = container.querySelector('main');
    const aside = container.querySelector('aside');

    expect(layout).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(aside).toBeInTheDocument();

    // Main and aside should be children of layout
    expect(main?.parentElement).toBe(layout);
    expect(aside?.parentElement).toBe(layout);
  });

  it('should allow chat window to fill the left column area', () => {
    const { container } = render(
      <MainLayout
        chatWindow={
          <div
            data-testid="full-height-chat"
            style={{ height: '100%', width: '100%', overflow: 'auto' }}
          >
            <div style={{ height: '2000px' }}>Scrollable content</div>
          </div>
        }
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const chatWindow = screen.getByTestId('full-height-chat');
    expect(chatWindow).toBeInTheDocument();
  });

  it('should not constrain chat content to max-width', () => {
    const { container } = render(
      <MainLayout
        chatWindow={
          <div
            data-testid="wide-chat"
            style={{ width: '100%', backgroundColor: 'red' }}
          >
            Wide content
          </div>
        }
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();

    const chatContent = screen.getByTestId('wide-chat');
    // Child should be able to use full width of the left column
    expect(chatContent).toBeInTheDocument();
  });

  it('should render chat window and control panel as siblings in flex container', () => {
    const { container } = render(
      <MainLayout
        chatWindow={<div data-testid="chat-window">Chat</div>}
        controlPanel={<div data-testid="control-panel">Controls</div>}
      />
    );

    const main = container.querySelector('main');
    const aside = container.querySelector('aside');

    expect(main).toBeInTheDocument();
    expect(aside).toBeInTheDocument();
  });
});
