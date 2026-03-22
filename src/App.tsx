/**
 * App Component - Main entry point
 */

import { useEffect, useState } from 'react';
import { usePdfPolling } from './hooks/usePdfPolling';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { useTabDetection } from './hooks/useTabDetection';
import { complaiService } from './services/apiService';
import { sessionService } from './services/sessionService';
import { MainLayout } from './layouts/MainLayout';
import { ChatWindow } from './components/ChatWindow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TabConflictModal } from './components/TabConflictModal';
import './App.css';

function App() {
  const { jwtToken, isInitialized, getCityFromToken } = useAuth();

  // Determine city from JWT token
  const cityId = (jwtToken && getCityFromToken(jwtToken)) || 'elprat';

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
          const fileId = 'file-' + msgId;
          const fileUrl = URL.createObjectURL(blob);

          const message = {
            id: msgId,
            role: 'assistant',
            content: 'Complaint PDF generated',
            timestamp: Date.now(),
            files: [
              {
                id: fileId,
                name: 'complaint.pdf',
                url: fileUrl,
                type: 'pdf',
                createdAt: Date.now(),
              },
            ],
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

  return (
    <ErrorBoundary>
      <TabConflictModal
        isVisible={tabDetection.isMultipleTabsDetected && !tabConflictDismissed}
        onContinueThisTab={() => {
          tabDetection.forceTabActive();
          setTabConflictDismissed(true);
        }}
      />
      <MainLayout isComplaintMode={isComplaintMode} onToggleComplaint={() => setIsComplaintMode((v) => !v)}>
        <ChatWindow
          messages={chatState.state.messages}
          isLoading={chatState.state.isLoading}
          error={chatState.state.currentError}
          onSendQuestion={handleSendQuestion}
          onSendComplaint={handleSendComplaint}
          jwtToken={jwtToken}
          isComplaintMode={isComplaintMode}
          onClearHistory={chatState.clearMessages}
        />
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
