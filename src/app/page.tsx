// app/page.tsx
'use client';
import React, { useRef, useState } from 'react';
import { mockArtworks } from '@/data/artwork-description';
import { getUniqueYears } from '@/utils/years';
import { useArtworks } from '@/hooks/useArtworks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import ArtworkDisplay from '@/components/ArtworkDisplay';
import NavigationArrows from '@/components/NavigationArrows';
import FloatingMenu from '@/components/FloatingMenu';
import { useArtworkManagerTrigger } from '@/hooks/useArtworkManagerTrigger';


const ArtworkGallery: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
    
  const {
    currentArtwork,
    handlePrev,
    handleNext,
    hasPrev,
    hasNext
  } = useArtworks(selectedYear);

  const artworkRef = useRef<HTMLDivElement>(null);
  
  const { isArtworkManagerOpen, ArtworkManagerComponent } = useArtworkManagerTrigger(currentArtwork);

  useKeyboardNavigation(handlePrev, handleNext, isArtworkManagerOpen);

  const years = getUniqueYears(mockArtworks);

  if (!currentArtwork) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* Floating Menu for Year Selection */}
      <FloatingMenu
        years={years}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
      />

      {/* Navigation Arrows */}
      <NavigationArrows
        onPrev={handlePrev}
        onNext={handleNext}
        showPrev={hasPrev}
        showNext={hasNext}
      />

      {/* Artwork Display with Dynamic Type */}
      <ArtworkDisplay artwork={currentArtwork} />

      {ArtworkManagerComponent && <ArtworkManagerComponent />}

    </div>
  );
};

export default ArtworkGallery;