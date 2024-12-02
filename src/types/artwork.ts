// types/artwork.ts

// Artwork display types
export enum ArtworkDisplayType {
  FullScreen = 1,
  FullScreenWithOverlay = 2,
  SplitScreenTextLeft = 3,
}

// Artwork category types
export enum ArtworkCategoryType {
  drawings = 1,
  installations = 2,
  paintings = 3,
  video = 4,
}

export interface Artwork {
  id: string;
  category: ArtworkCategoryType;
  imageUrl: string;
  title: string;
  type: ArtworkDisplayType;
  descriptionPath?: string; // Path to markdown description
  style?: ArtworkStyle;
  textWidthPercentage?: number; // interface extension
  description?: string;
}

export interface ArtworkStyle {
  textPlacement?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  textColor?: string; // leave empty with ''(quotes) for white, use green-500 for specific color shades
  bgOpacity?: number; //from 0 to 1 in 0.1 increments, like 0.1, 0.2, 0.3, etc
  // granular styling properties
  typography?: {
    title?: {
      size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
      weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
      marginBottom?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    };
    description?: {
      size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
      weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
      lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
      marginBottom?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    };
  };
  spacing?: {
    padding?: {
      x?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
      y?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
    };
    margin?: {
      x?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
      y?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
    };
  };
}

export interface ArtworkState {
  artworks: Artwork[];
  currentIndex: number;
  selectedYear: number | null;
}

export interface ArtworkHookReturn {
  artworks: Artwork[];
  currentIndex: number;
  handlePrev: () => void;
  handleNext: () => void;
  currentArtwork: Artwork | undefined;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FloatingMenuProps {
  categories: ArtworkCategoryType[];
  selectedCategory: ArtworkCategoryType | null;
  onCategorySelect: (category: ArtworkCategoryType | null) => void;
}

export interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  showPrev: boolean;
  showNext: boolean;
}

export interface HeroSectionProps {
  artwork: Artwork;
}