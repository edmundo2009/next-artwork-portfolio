// hooks/useKeyboardNavigation.ts
import { useEffect } from 'react';

export const useKeyboardNavigation = (onPrev: () => void, onNext: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrev();
      } else if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPrev, onNext]);
};