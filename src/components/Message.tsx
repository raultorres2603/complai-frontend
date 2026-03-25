/**
 * Message Component - Single message display
 */

import React from 'react';
import DOMPurify from 'dompurify';
import type { ChatMessage, ChatFile } from '../types/domain.types';
import styles from './Message.module.css';
import { SourceLink } from './SourceLink';
import { normalizeText } from '../utils/textFormatter';

interface MessageProps {
  message: ChatMessage;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.container} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.content}>
        {typeof message.content === 'string' && /<[^>]+>/.test(message.content) && message.role !== 'user' ? (
          <div
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content) }}
          />
        ) : (
          <p className={styles.text}>{normalizeText(message.content)}</p>
        )}

        {/* Render sources if available */}
        {message.sources && message.sources.length > 0 && (
          <div className={styles.sources}>
            <p className={styles.sourcesLabel}>Sources:</p>
            <ul className={styles.sourceList}>
              {message.sources.map((source, idx) => (
                <li key={idx}>
                  <SourceLink source={source} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Render files if available */}
        {message.files && message.files.length > 0 && (
          <div className={styles.files}>
            {message.files.map((file) => (
              <FilePreview key={file.id} file={file} />
            ))}
          </div>
        )}

        {/* Render error if present */}
        {message.error && (
          <div className={styles.error}>
            <p className={styles.errorMessage}>Error: {message.error.message}</p>
          </div>
        )}
      </div>

      <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
    </div>
  );
};

/**
 * FilePreview Component - Display file attachment
 */
interface FilePreviewProps {
  file: ChatFile;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.file}>
      <div className={styles.fileIcon}>📄</div>
      <div className={styles.fileInfo}>
        <p className={styles.fileName}>{file.name}</p>
        {file.size && <p className={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</p>}
      </div>
      <button className={styles.downloadButton} onClick={handleDownload} title="Download">
        ⬇️
      </button>
    </div>
  );
};
