// app/page.tsx
'use client';
import React, { useRef, useState } from 'react';
import { mockArtworks } from '@/data/artwork-description';
import { getUniqueCategories } from '@/utils/categories';
import { useArtworks } from '@/hooks/useArtworks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import ArtworkDisplay from '@/components/ArtworkDisplay';
import NavigationArrows from '@/components/NavigationArrows';
import FloatingMenu from '@/components/FloatingMenu';
import { useArtworkManagerTrigger } from '@/hooks/useArtworkManagerTrigger';
import { ArtworkCategoryType } from '@/types/artwork';


const ArtworkGallery: React.FC = () => {
  // const [selectedCategory, setselectedCategory] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategoryType | null>(null);

  const {
    currentArtwork,
    handlePrev,
    handleNext,
    hasPrev,
    hasNext
  } = useArtworks(selectedCategory);

  const artworkRef = useRef<HTMLDivElement>(null);
  
  const { isArtworkManagerOpen, ArtworkManagerComponent } = useArtworkManagerTrigger(currentArtwork);

  useKeyboardNavigation(handlePrev, handleNext, isArtworkManagerOpen);

  const categories = getUniqueCategories(mockArtworks);

  if (!currentArtwork) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* Floating Menu for Year Selection */}
      <FloatingMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
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