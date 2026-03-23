/**
 * useDrawerEscape Hook - Close drawer when Escape key is pressed
 * 
 * Responsibility: Listen for Escape key and call onClose callback
 * 
 * Implementation:
 * - Listens to window keydown events
 * - Calls onClose only when key === 'Escape' and isOpen is true
 * - Prevents default behavior
 * - Cleans up event listener on unmount
 * 
 * @param onClose - Callback function to execute when Escape is pressed
 * @param isOpen - Whether drawer is currently open (optional, defaults to true)
 * 
 * @example
 * ```tsx
 * const handleClose = () => setIsOpen(false);
 * useDrawerEscape(handleClose, isOpen);
 * ```
 */

import { useEffect } from 'react';

/**
 * Closes drawer when Escape key is pressed for accessibility
 * 
 * @param onClose - Callback to execute when Escape key is pressed
 * @param isOpen - Whether drawer is currently open (if false, listener is not applied)
 */
export function useDrawerEscape(onClose: () => void, isOpen: boolean = true): void {
  useEffect(() => {
    if (!isOpen) return;

    /**
     * Handle keydown event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}
