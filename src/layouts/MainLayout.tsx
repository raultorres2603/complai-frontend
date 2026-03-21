/**
 * MainLayout Component - Header + Chat Window layout
 */

import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, isComplaintMode, onToggleComplaint }) => {
  return (
    <div className={styles.layout}>
      <Header isComplaintMode={isComplaintMode} onToggleComplaint={onToggleComplaint} />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
