import React from 'react';
import { useTour } from '../hooks/useTour';
import styles from './TourButton.module.css';

const TourButton: React.FC = () => {
  const { startTour } = useTour();
  return (
    <button
      className={styles.button}
      onClick={startTour}
      aria-label="Start guided tour"
      title="Start guided tour"
      data-tour="tour-button"
    >
      ?
    </button>
  );
};

export default TourButton;
