import { Artwork} from '@/types/artwork';

export const mockArtworks: Artwork[] = [
  {
    "id": "1",
    "category": 3,
    "imageUrl": "/artwork/3/1.png",
    "title": "1",
    "titleLine2": "2",
    "type": 3,
    "descriptionPath": "/descriptions/1.md",
    "textWidthPercentage": 50,
    "style": {
      "textPlacement": "bottom-left",
      "bgOpacity": 0.6,
      "typography": {
        "title": {
          "weight": "medium",
          "size": "lg"
        }
      },
      "textColor": "red",
      "descriptionPlacement": "top-left"
    }
  },
  {
    "id": "mmm-Line",
    "category": 3,
    "imageUrl": "/artwork/3/mmm-Line.jpg",
    "title": "ttt",
    "titleLine2": "ttt",
    "type": 1,
    "descriptionPath": "",
    "style": {
      "typography": {
        "title": {
          "size": "sm",
          "weight": "normal"
        }
      },
      "textColor": "black"
    }
  }
];