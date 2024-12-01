// hooks/useArtworkManagerTrigger.ts
'use client';

import { useState, useEffect } from 'react';
import ArtworkManager from '@/components/ArtworkManager';
import { Artwork } from '@/types/artwork';

export function useArtworkManagerTrigger(currentArtwork: Artwork | null) {
// export function useArtworkManagerTrigger(currentArtwork: Artwork | null, elementRef: React.RefObject<HTMLElement>) {

  const [isArtworkManagerOpen, setIsArtworkManagerOpen] = useState(false);
  const [preSelectedArtwork, setPreSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: MouseEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.target instanceof HTMLElement) {
        setIsArtworkManagerOpen(true);
        setPreSelectedArtwork(currentArtwork);
      }
    };

    document.addEventListener('click', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleKeyDown);
    };
  }, [currentArtwork]);

  const closeArtworkManager = () => {
    setIsArtworkManagerOpen(false);
    setPreSelectedArtwork(null);
  };

  return {
    isArtworkManagerOpen,
    setIsArtworkManagerOpen,
    preSelectedArtwork,
    ArtworkManagerComponent: isArtworkManagerOpen
      ? () => <ArtworkManager
        onClose={closeArtworkManager}
        preSelectedArtwork={preSelectedArtwork}
      />
      : null
  };
}