import { Artwork} from '@/types/artwork';

export const mockArtworks: Artwork[] = [
  {
    "id": "test",
    "category": 4,
    "imageUrl": "/artwork/4/test.jpg",
    "title": "thethethethethe",
    "titleLine2": "2nd line",
    "type": 1,
    "descriptionPath": ""
  },
  {
    "id": "frame",
    "category": 1,
    "imageUrl": "/artwork/1/frame.png",
    "title": "fra",
    "type": 3,
    "descriptionPath": "/descriptions/fra.md",
    "textWidthPercentage": 50
  },
  {
    "id": "mmm-Line",
    "category": 3,
    "imageUrl": "/artwork/3/mmm-Line.jpg",
    "title": "sssss",
    "type": 2,
    "descriptionPath": "/descriptions/sssss.md"
  }
];