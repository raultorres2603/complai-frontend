/**
 * SourceLink Component - Reference link display
 */

import React from 'react';
import type { Source } from '../types/api.types';
import styles from './SourceLink.module.css';

interface SourceLinkProps {
  source: Source;
}

export const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(source.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <a
      href={source.url}
      className={styles.link}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      title={source.url}
    >
      <span className={styles.icon}>🔗</span>
      <span className={styles.title}>{source.title || source.url}</span>
    </a>
  );
};
