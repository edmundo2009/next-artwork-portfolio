// utils/typeMapper.ts
import { ArtworkDisplayType } from '@/types/artwork';

export const getTypeName = (type: ArtworkDisplayType): string => {
  switch (type) {
    case ArtworkDisplayType.FullScreen:
      return 'Full + Title';
    case ArtworkDisplayType.SplitScreenTextLeft:
      return 'Split + description';
    // Add other cases as needed
    default:
      return 'Unknown';
  }
};
