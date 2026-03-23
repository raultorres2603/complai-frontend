/**
 * useMobileLayout Hook - Manages mobile layout state and viewport detection
 * 
 * Responsibility: Detect mobile viewport width and manage drawer open/closed state
 * 
 * Returns:
 * - isMobile: true if viewport width < 768px
 * - isDrawerOpen: Whether secondary controls drawer is open
 * - openDrawer: Function to open drawer
 * - closeDrawer: Function to close drawer
 * - toggleDrawer: Function to toggle drawer state
 * - viewportWidth: Current viewport width in pixels
 * - isSuperSmall: true if viewport width < 375px (extra-small phones)
 * 
 * Implementation:
 * - Listens to window resize events (debounced 100ms)
 * - Stores viewport width and breakpoint detection
 * - Manages drawer state via useState
 * - Cleans up event listeners on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Return type for useMobileLayout hook
 */
export interface UseMobileLayoutReturn {
  /** True if viewport width < 768px */
  isMobile: boolean;
  /** Whether drawer is currently open */
  isDrawerOpen: boolean;
  /** Open drawer */
  openDrawer: () => void;
  /** Close drawer */
  closeDrawer: () => void;
  /** Toggle drawer state */
  toggleDrawer: () => void;
  /** Current viewport width in pixels */
  viewportWidth: number;
  /** True if viewport width < 375px (extra-small phones) */
  isSuperSmall: boolean;
}

const MOBILE_BREAKPOINT = 768;
const SUPER_SMALL_BREAKPOINT = 375;
const RESIZE_DEBOUNCE_MS = 100;

/**
 * Manages mobile layout state and viewport detection
 * 
 * @returns {UseMobileLayoutReturn} Mobile layout state and callbacks
 * 
 * @example
 * ```tsx
 * const { isMobile, isDrawerOpen, toggleDrawer } = useMobileLayout();
 * 
 * return (
 *   <div>
 *     {isMobile ? <MobileHeader onOpenDrawer={toggleDrawer} /> : <Header />}
 *     <ControlDrawer isOpen={isDrawerOpen} onClose={() => closeDrawer()} />
 *   </div>
 * );
 * ```
 */
export function useMobileLayout(): UseMobileLayoutReturn {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate derived values BEFORE useEffect hooks that depend on them
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const isSuperSmall = viewportWidth < SUPER_SMALL_BREAKPOINT;

  /**
   * Handle window resize with debounce
   */
  const handleResize = useCallback(() => {
    // Clear previous timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Set new timeout for debounced resize
    resizeTimeoutRef.current = setTimeout(() => {
      setViewportWidth(window.innerWidth);
    }, RESIZE_DEBOUNCE_MS);
  }, []);

  /**
   * Setup and cleanup resize listener
   */
  useEffect(() => {
    // Set initial width
    setViewportWidth(window.innerWidth);

    // Add listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  /**
   * Close drawer automatically when switching to desktop
   */
  useEffect(() => {
    if (!isMobile && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isMobile, isDrawerOpen]);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  return {
    isMobile,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    viewportWidth,
    isSuperSmall,
  };
}
