/**
 * MainLayout Component - Responsive layout supporting both desktop (2-column) and mobile (single-column with drawer) views
 * 
 * Responsibility: Renders layout based on viewport width
 * - Desktop (>= 1024px): Two-column grid layout (chat on left, controls on right)
 * - Tablet (768px - 1023px): Hybrid layout or single column with drawer
 * - Mobile (< 768px): Single column with fixed header, chat, input footer, and slide-up drawer
 * 
 * Props:
 * - chatWindow: React node containing ChatWindow component
 * - controlPanel: React node containing ControlPanel component
 * - isMobile: Whether to render mobile layout (< 768px)
 * - isDrawerOpen: Whether drawer is currently open (mobile only)
 * - onToggleDrawer: Callback to toggle drawer open/closed (mobile only)
 */

import type { ReactNode } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileInputFooter } from '../components/MobileInputFooter';
import { ControlDrawer } from '../components/ControlDrawer';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from '../hooks/useTranslation';
import type { MainLayoutHandlers } from '../types/layout.types';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  chatWindow: ReactNode;
  controlPanel: ReactNode;
  isMobile?: boolean;
  isDrawerOpen?: boolean;
  onToggleDrawer?: () => void;
  isComplaintMode?: boolean;
  onToggleComplaint?: () => void;
  onClearHistory?: () => void;
  onSendMessage?: (text: string) => void;
  disabled?: boolean;
  error?: any | null;
  messages?: any[];
  apiKey?: string | null;
  onDismissError?: () => void;
  // New props for mobile message sending
  handleSendQuestion?: (text: string, apiKey: string) => void;
  handleSendComplaint?: (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined,
    apiKey: string
  ) => void;
  isLoading?: boolean;
  cityId?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  chatWindow,
  controlPanel,
  isMobile = false,
  isDrawerOpen = false,
  onToggleDrawer,
  isComplaintMode = false,
  onToggleComplaint,
  onClearHistory,
  error,
  messages = [],
  onDismissError,
  handleSendQuestion,
  handleSendComplaint,
  isLoading = false,
  apiKey,
}) => {
  const { currentLanguage, availableLanguages, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const appName = import.meta.env.VITE_APP_NAME || 'ComplAI';

  // Mobile layout
  if (isMobile) {
    return (
      <div className={styles.mobileLayout} data-testid="mobile-layout">
        {/* Fixed header */}
        <MobileHeader
          appName={appName}
          onOpenDrawer={onToggleDrawer || (() => {})}
          drawerOpen={isDrawerOpen}
        />

        {/* Chat area - fills space between header and footer */}
        <main 
          className={styles.mobileMain} 
          data-testid="mobile-main"
          style={{ marginBottom: isComplaintMode ? 'max(160px, calc(160px + env(safe-area-inset-bottom)))' : undefined }}
        >{chatWindow}</main>

        {/* Fixed input footer - pass handlers and state */}
        <MobileInputFooter
          onSend={(text, format) => {
            if (handleSendQuestion && apiKey) {
              handleSendQuestion(text, apiKey);
            }
          }}
          onSendComplaint={(text, format, name, surname, idNumber) => {
            if (handleSendComplaint && apiKey) {
              handleSendComplaint(text, format, name, surname, idNumber, apiKey);
            }
          }}
          disabled={isLoading}
          isComplaintMode={isComplaintMode}
          messages={messages}
          ttsEnabled={true}
          apiKey={apiKey || null}
        />

        {/* Drawer with secondary controls */}
        {typeof controlPanel === 'object' && controlPanel && (
          <ControlDrawer
            isOpen={isDrawerOpen || false}
            onClose={onToggleDrawer || (() => {})}
            isComplaintMode={isComplaintMode}
            onToggleComplaint={onToggleComplaint}
            onClearHistory={onClearHistory}
            currentLanguage={currentLanguage}
            onSelectLanguage={setLanguage}
            availableLanguages={availableLanguages}
            error={error}
            onDismissError={onDismissError}
            messages={messages}
          />
        )}
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className={styles.layout} data-testid="layout">
      {/* Left column: Chat area with message list */}
      <main className={styles.main} data-testid="main">{chatWindow}</main>

      {/* Right column: Control panel with header, input, and controls */}
      <aside className={styles.sidebar} data-testid="sidebar">{controlPanel}</aside>
    </div>
  );
};
