// src/utils/categories.ts
import { Artwork, ArtworkCategoryType } from '@/types/artwork';

export const getUniqueCategories = (artworks: Artwork[]): ArtworkCategoryType[] => {
  const categories = artworks.map(artwork => artwork.category);
  return [...new Set(categories)].sort((a, b) => a - b);
};
