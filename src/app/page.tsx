'use client';
// App.tsx
import React, { useState } from 'react';
import { mockArtworks, getUniqueYears } from '@/data/artwork-description';
import { useArtworks } from '@/hooks/useArtworks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import ArtworkDisplay from '@/components/ArtworkDisplay';
import NavigationArrows from '@/components/NavigationArrows';
import FloatingMenu from '@/components/FloatingMenu';
import ArtworkManager from '@/components/ArtworkManager';

const ArtworkGallery: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isArtworkManagerOpen, setIsArtworkManagerOpen] = useState(false);
  const {
    currentArtwork,
    handlePrev,
    handleNext,
    hasPrev,
    hasNext
  } = useArtworks(selectedYear);
  useKeyboardNavigation(handlePrev, handleNext);

  const years = getUniqueYears(mockArtworks);

  if (!currentArtwork) return null;

  // Only show Artwork Manager button in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Artwork Manager Button for Development */}
      {isDevelopment && (
        <button
          onClick={() => setIsArtworkManagerOpen(true)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          Artwork Manager
        </button>
      )}

      {/* Artwork Manager Modal */}
      {isDevelopment && isArtworkManagerOpen && (
        <ArtworkManager onClose={() => setIsArtworkManagerOpen(false)} />
      )}

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
    </div>
  );
};

export default ArtworkGallery;