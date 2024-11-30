// data/artwork-description.ts
import { Artwork, ArtworkDisplayType } from '@/types/artwork';

export const mockArtworks: Artwork[] = [

  {
    id: '1',
    year: 2023,
    imageUrl: '/artwork/2023/2023-1.jpg',
    title: 'Artwork TITLE 1',
    type: 2, //1: FullScreen, 2: SplitScreenTextLeft, 3: FullScreenWithOverlay
    descriptionPath: '/descriptions/3.md', // only required for 2: SplitScreenTextLeft, 3: FullScreenWithOverlay
    // optional for everything from here onwards, 
    // if not provided defaults to @/components/ArtworkDisplay.tsx
    // style: {
    //   textPlacement: 'top-left',
    //   textColor: 'green', //'green-500',
    //   bgOpacity: 0.1,
    //   typography: {
    //     title: {
    //       size: '4xl',
    //       weight: 'bold',
    //       marginBottom: 3
    //     },
    //     description: {
    //       size: 'base',
    //       weight: 'bold',
    //       lineHeight: 'relaxed',
    //       marginBottom: 2
    //     }
    //   },
    //   spacing: {
    //     padding: {
    //       x: 4,
    //       y: 4
    //     },
    //     margin: {
    //       x: 4
    //     }
    //   }
    // },
  },
  
  {
    id: '2',
    year: 2023,
    imageUrl: '/artwork/2023/2023-2.jpg',
    title: 'Artwork 2',
    type: 2, // type: ArtworkDisplayType.SplitScreenTextLeft,
    descriptionPath: '/descriptions/2.md'
  },
  {
    id: '3',
    year: 2022,
    imageUrl: '/artwork/2022/2022-1.png',
    title: 'Artwork 3',
    type: 1, // type: ArtworkDisplayType.FullScreen,
    // no descriptionPath since 1: FullScreen doesn't require a description
    style: {
      textPlacement: 'center',
      textColor: 'green',
      bgOpacity: 0.9,
      typography: {
        title: {
          size: '4xl',
          weight: 'bold',
          marginBottom: 6
        },
      },
      spacing: {
        padding: {
          x: 2,
          y: 2
        },
        margin: {
          x: 2
        }
      }
    },
  },

  {
    id: '4',
    year: 2022,
    imageUrl: '/artwork/2022/2022-2.png',
    title: 'Artwork 4',
    type: 3, //ArtworkDisplayType.FullScreenWithRawText
    descriptionPath: '/descriptions/4.md',
    style: {
      textPlacement: 'top-right',
      textColor: '',
      bgOpacity: 0,
    },
  },
  {
    id: '5',
    year: 2022,
    imageUrl: '/artwork/2022/2022-3.jpg',
    title: 'Artwork EEE',
    type: 3,
    descriptionPath: '/descriptions/4.md'
  },
  {
    id: '6',
    year: 2021,
    imageUrl: '/artwork/2021//2021-1.png',
    title: 'Artwork AAA',
    type: ArtworkDisplayType.FullScreen,
    // descriptionPath: '/descriptions/4.md'
  },
];

export const getUniqueYears = (artworks: Artwork[]): number[] => {
  const years = artworks.map(artwork => artwork.year);
  return [...new Set(years)].sort((a, b) => b - a);
};