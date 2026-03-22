/**
 * Test utilities for React Testing Library + Vitest
 * Provides custom render and renderHook functions with proper setup
 */

import React, { ReactElement } from 'react';
import {
  render as rtlRender,
  RenderOptions,
  renderHook as rtlRenderHook,
  RenderHookOptions,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that ensures DOM container is available
 * Use this instead of render() from React Testing Library
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Ensure root container exists
  let container = document.getElementById('root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  const renderResult = rtlRender(ui, { ...options });
  const user = userEvent.setup({ delay: null });

  return {
    ...renderResult,
    user,
  };
}

/**
 * Custom render function with explicit DOM naming (alias for render)
 * Use this instead of render() from React Testing Library
 */
export function renderWithDOM(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Custom renderHook that ensures DOM container is available
 * Use this instead of renderHook() from React Testing Library
 */
export function renderHook<TProps, TResult>(
  hook: (initialProps?: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) {
  // Ensure root container exists
  let container = document.getElementById('root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  return rtlRenderHook(hook, options);
}

// Re-export common testing utilities
export { screen, waitFor, act } from '@testing-library/react';
export { userEvent };
export type { RenderResult } from '@testing-library/react';
