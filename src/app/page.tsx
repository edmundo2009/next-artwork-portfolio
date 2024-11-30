'use client';
// app/page.tsx
import React, { useState } from 'react';
import { mockArtworks } from '@/data/artwork-description';
import { getUniqueYears } from '@/utils/years';
import { useArtworks } from '@/hooks/useArtworks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import ArtworkDisplay from '@/components/ArtworkDisplay';
import NavigationArrows from '@/components/NavigationArrows';
import FloatingMenu from '@/components/FloatingMenu';
import ArtworkManager from '@/components/ArtworkManager';
import AdminAccessModal from '@/components/AdminAccessModal';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
// const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is not set in environment variables');
}


const ArtworkGallery: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isArtworkManagerOpen, setIsArtworkManagerOpen] = useState(false);
  const [isAdminAccessModalOpen, setIsAdminAccessModalOpen] = useState(false);
  const [isAdminAccessGranted, setIsAdminAccessGranted] = useState(false);

  const {
    currentArtwork,
    handlePrev,
    handleNext,
    hasPrev,
    hasNext
  } = useArtworks(selectedYear);

  useKeyboardNavigation(handlePrev, handleNext, isArtworkManagerOpen);

  const years = getUniqueYears(mockArtworks);

  // Handle admin access verification
  const handleAdminAccess = () => {
    setIsAdminAccessModalOpen(true);
  };

  // Verify admin password
  const verifyAdminPassword = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAccessGranted(true);
      return true;
    }
    return false;
  };

  // Close admin access modal
  const handleCloseAdminAccessModal = () => {
    setIsAdminAccessModalOpen(false);
  };

  if (!currentArtwork) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Artwork Manager Button - Only visible when admin access is granted */}
      {isAdminAccessGranted && (
        <button
          onClick={() => setIsArtworkManagerOpen(true)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          Artwork Manager
        </button>
      )}

      {/* Artwork Manager Modal */}
      {isArtworkManagerOpen && (
        <ArtworkManager onClose={() => setIsArtworkManagerOpen(false)} />
      )}

      {/* Admin Access Modal */}
      <AdminAccessModal
        isOpen={isAdminAccessModalOpen}
        onClose={handleCloseAdminAccessModal}
        onAdminLogin={verifyAdminPassword}
      />

      {/* Floating Menu for Year Selection */}
      <FloatingMenu
        years={years}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
        onAdminAccess={handleAdminAccess}
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