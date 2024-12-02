// utils/categoryMapper.ts
import { ArtworkCategoryType } from '@/types/artwork';

export const getCategoryName = (category: ArtworkCategoryType): string => {
  switch (category) {
    case ArtworkCategoryType.drawings:
      return 'drawings';
    case ArtworkCategoryType.installations:
      return 'installations';
    case ArtworkCategoryType.paintings:
      return 'paintings';
    case ArtworkCategoryType.video:
      return 'video';
    default:
      return 'unknown';
  }
};
