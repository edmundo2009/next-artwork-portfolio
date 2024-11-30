// hooks/useKeyboardNavigation.ts
import { useEffect } from 'react';

export const useKeyboardNavigation = (
  onPrev: () => void,
  onNext: () => void,
  isArtworkManagerOpen: boolean // Add this parameter
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow navigation if artwork manager is not open
      if (!isArtworkManagerOpen) {
        if (e.key === 'ArrowLeft') {
          onPrev();
        } else if (e.key === 'ArrowRight') {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext, isArtworkManagerOpen]);
};