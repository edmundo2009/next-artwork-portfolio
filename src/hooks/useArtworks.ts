// hooks/useArtworks.ts
import { useState, useEffect } from 'react';
import { Artwork } from '@/types/artwork';
import { preloadImage } from '@/utils/imagePreloader';
import { mockArtworks } from '@/data/artwork-description';

export const useArtworks = (selectedYear: number | null) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchArtworks = async () => {
      // Filter artworks by selected year if provided
      const filteredArtworks = selectedYear
        ? mockArtworks.filter(artwork => artwork.year === selectedYear)
        : mockArtworks;

      setArtworks(filteredArtworks);
      setCurrentIndex(0);

      // Preload first artwork image if available
      if (filteredArtworks.length > 0) {
        await preloadImage(filteredArtworks[0].imageUrl);
      }
    };

    fetchArtworks();
  }, [selectedYear]);

  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacentImages = async () => {
      if (artworks.length <= 1) return;

      const prevIndex = (currentIndex - 1 + artworks.length) % artworks.length;
      const nextIndex = (currentIndex + 1) % artworks.length;

      await Promise.all([
        preloadImage(artworks[prevIndex].imageUrl),
        preloadImage(artworks[nextIndex].imageUrl),
      ]);
    };

    preloadAdjacentImages();
  }, [currentIndex, artworks]);

  // Navigate to previous artwork
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + artworks.length) % artworks.length);
  };

  // Navigate to next artwork
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
  };

  return {
    artworks,
    currentIndex,
    handlePrev,
    handleNext,
    currentArtwork: artworks[currentIndex],
    hasNext: artworks.length > 1 && currentIndex < artworks.length - 1,
    hasPrev: artworks.length > 1 && currentIndex > 0,
  };
};