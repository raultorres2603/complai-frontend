/**
 * App Component - Main entry point
 */

import { useEffect, useState } from 'react';
import { usePdfPolling } from './hooks/usePdfPolling';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useTabDetection } from './hooks/useTabDetection';
import { useAccessibility } from './hooks/useAccessibility';
import { useTranslation } from './hooks/useTranslation';
import { useMobileLayout } from './hooks/useMobileLayout';
import { complaiService } from './services/apiService';
import { sessionService } from './services/sessionService';
import { MainLayout } from './layouts/MainLayout';
import { ChatWindow } from './components/ChatWindow';
import { ControlPanel } from './components/ControlPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TabConflictModal } from './components/TabConflictModal';
import { ElPratDemo } from './components/ElPratDemo';
import './App.css';

function App() {
  const { apiKey, isInitialized } = useAuth();
  const { settings: _settings } = useAccessibility(); // Initialize accessibility hook
  const { t } = useTranslation();

  // Mobile layout state
  const { isMobile, isDrawerOpen, toggleDrawer, closeDrawer } = useMobileLayout();

  // Determine city from environment variable
  const cityId = import.meta.env.VITE_CITY_ID || 'elprat';

  // Chat state hook (must be initialized early)
  const chatState = useChat(undefined, cityId);
  const [isComplaintMode, setIsComplaintMode] = useState(false);
  const { pollPdfUrl, stopPolling } = usePdfPolling();
  const tabDetection = useTabDetection();
  const [tabConflictDismissed, setTabConflictDismissed] = useState(false);

  // Initialize or restore conversation
  useEffect(() => {
    if (!cityId) return;

    // Get existing conversation or create new one
    let conversation = sessionService.getLastConversation(cityId);
    if (!conversation) {
      conversation = sessionService.createConversation(cityId);
      sessionService.saveConversation(conversation);
    }

    chatState.setConversationId(conversation.id);
  }, [cityId]);

  // Update backend URL from environment
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    complaiService.setBackendUrl(backendUrl);
  }, []);

  // Set browser tab title from environment variable
  useEffect(() => {
    const appName = import.meta.env.VITE_APP_NAME || 'ComplAI';
    document.title = appName;
  }, []);

  const handleSendQuestion = (text: string, token: string) => {
    chatState.sendQuestion(text, token);
  };

  const handleSendComplaint = (
    text: string,
    format: string,
    name: string | undefined,
    surname: string | undefined,
    idNumber: string | undefined,
    token: string
  ) => {
    chatState.sendRedactComplaint(text, format, name, surname, idNumber, token);
  };

  // Wait for auth to be initialized
  // Auto-start polling when backend returns a presigned pdfUrl for redaction
  useEffect(() => {
    const pdfUrl = chatState.redactContext?.pdfUrl;
    if (!pdfUrl) return;

    pollPdfUrl(pdfUrl, {
      onSuccess: (blob: Blob) => {
        try {
          const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const fileUrl = URL.createObjectURL(blob);

          const message = {
            id: msgId,
            role: 'assistant',
            content: `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${t('complaint_pdf_ready')}</a>`,
            timestamp: Date.now(),
          } as any;

          chatState.addMessage(message);
          chatState.setRedactContext && chatState.setRedactContext({ ...chatState.redactContext, pollingInProgress: false });
        } catch (e) {
          console.error('Error handling downloaded PDF', e);
        }
      },
      onError: (errMsg?: string) => {
        chatState.setRedactContext && chatState.setRedactContext({ ...chatState.redactContext, pollingInProgress: false, pollingError: errMsg });
      },
    });

    return () => {
      stopPolling();
    };
  }, [chatState.redactContext?.pdfUrl]);

  // Wait for auth to be initialized (render guard placed after hooks to preserve hook order)
  if (!isInitialized) {
    return <div className="loading">Loading...</div>;
  }

  // Create ChatWindow component instance
  const chatWindowComponent = (
    <ChatWindow
      messages={chatState.state.messages}
      isLoading={chatState.state.isLoading}
    />
  );

  // Create ControlPanel component instance
  const controlPanelComponent = (
    <ControlPanel
      messages={chatState.state.messages}
      isLoading={chatState.state.isLoading}
      error={chatState.state.currentError}
      isComplaintMode={isComplaintMode}
      onToggleComplaint={() => {
        setIsComplaintMode((v) => !v);
        // Close drawer when toggling complaint mode
        if (isMobile && isDrawerOpen) {
          closeDrawer();
        }
      }}
      onSendQuestion={handleSendQuestion}
      onSendComplaint={handleSendComplaint}
      apiKey={apiKey}
      onClearHistory={chatState.clearMessages}
      isMobile={isMobile}
    />
  );

  // Create MainLayout for the chat widget panel
  const widgetLayout = (
    <MainLayout
      chatWindow={chatWindowComponent}
      controlPanel={controlPanelComponent}
      isMobile={isMobile}
      isDrawerOpen={isDrawerOpen}
      onToggleDrawer={toggleDrawer}
      isComplaintMode={isComplaintMode}
      onToggleComplaint={() => setIsComplaintMode((v) => !v)}
      onClearHistory={chatState.clearMessages}
      disabled={chatState.state.isLoading}
      error={chatState.state.currentError}
      messages={chatState.state.messages}
      onDismissError={chatState.clearCurrentError}
      handleSendQuestion={handleSendQuestion}
      handleSendComplaint={handleSendComplaint}
      isLoading={chatState.state.isLoading}
      apiKey={apiKey}
      cityId={cityId}
    />
  );

  return (
    <ErrorBoundary>
      <TabConflictModal
        isVisible={tabDetection.isMultipleTabsDetected && !tabConflictDismissed}
        onContinueThisTab={() => {
          tabDetection.forceTabActive().then(() => {
            setTabConflictDismissed(true);
          }).catch((err) => {
            console.error('Closure error:', err);
            setTimeout(() => setTabConflictDismissed(true), 2000);
          });
        }}
        closingTabCount={tabDetection.closingTabCount}
        closedTabCount={tabDetection.closedTabCount}
        closureFailureMessage={tabDetection.closureFailureMessage}
      />
      <ElPratDemo 
        layout={widgetLayout}
        isComplaintMode={isComplaintMode}
        onToggleComplaint={() => setIsComplaintMode((v) => !v)}
      />
    </ErrorBoundary>
  );
}

export default App;
