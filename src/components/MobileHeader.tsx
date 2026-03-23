/**
 * MobileHeader Component - Minimal header for mobile devices
 * 
 * Responsibility: Display app name and hamburger button to toggle drawer on mobile
 * 
 * Props:
 * - appName: Application name to display
 * - onOpenDrawer: Callback when hamburger button is clicked
 * - drawerOpen: Whether drawer is currently open (for visual feedback)
 * 
 * Features:
 * - Fixed at top of viewport
 * - 44px height (touch-friendly)
 * - App name on left, hamburger icon on right
 * - Safe area support for notches
 * - Minimal styling to maximize chat space
 */

import React from 'react';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
  /** Application name to display */
  appName?: string;
  /** Callback when hamburger button is clicked */
  onOpenDrawer: () => void;
  /** Whether drawer is currently open (visual feedback) */
  drawerOpen?: boolean;
}

/**
 * Minimal header for mobile devices
 * Displays app name and drawer toggle hamburger button
 * Fixed at top with 44px height and safe area support
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  appName = 'ComplAI',
  onOpenDrawer,
  drawerOpen = false,
}) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{appName}</h1>
      <button
        className={`${styles.hamburger} ${drawerOpen ? styles.open : ''}`}
        onClick={onOpenDrawer}
        aria-label="Open menu"
        aria-expanded={drawerOpen}
        title="Open menu"
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>
    </header>
  );
};

export default MobileHeader;
