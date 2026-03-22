/**
 * MainLayout Component - Two-column layout with ChatWindow on left, ControlPanel on right
 * 
 * Responsibility: Renders two-column grid layout
 * 
 * Props:
 * - chatWindow: React node containing ChatWindow component
 * - controlPanel: React node containing ControlPanel component
 */

import type { ReactNode } from 'react';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  chatWindow: ReactNode;
  controlPanel: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ chatWindow, controlPanel }) => {
  return (
    <div className={styles.layout}>
      {/* Left column: Chat area with message list */}
      <main className={styles.main}>{chatWindow}</main>

      {/* Right column: Control panel with header, input, and controls */}
      <aside className={styles.sidebar}>{controlPanel}</aside>
    </div>
  );
};
