import { Artwork} from '@/types/artwork';

export const mockArtworks: Artwork[] = [
  {
    "id": "1",
    "category": 3,
    "imageUrl": "/artwork/3/1.png",
    "title": "asdfasdf",
    "titleLine2": "2",
    "type": 1,
    "descriptionPath": "/descriptions/asdfasdf.md",
    "style": {
      "textPlacement": "top-left",
      "bgOpacity": 0.3,
      "typography": {
        "title": {
          "weight": "semibold",
          "size": "sm"
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