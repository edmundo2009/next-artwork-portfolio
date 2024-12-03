import { Artwork} from '@/types/artwork';

export const mockArtworks: Artwork[] = [
  {
    "id": "mmm-karaoke-small",
    "category": 1,
    "imageUrl": "/artwork/1/mmm-karaoke-small.png",
    "title": "yuyu",
    "type": 3,
    "descriptionPath": "/descriptions/yuyu.md",
    "textWidthPercentage": 50,
    "style": {
      "typography": {
        "title": {
          "size": "sm",
          "weight": "normal"
        }
      },
      "textColor": "white",
      "bgOpacity": 0.8
    }
  },
  {
    "id": "1",
    "category": 3,
    "imageUrl": "/artwork/3/1.png",
    "title": "1",
    "titleLine2": "2",
    "type": 1,
    "descriptionPath": "",
    "style": {
      "textPlacement": "top-left",
      "bgOpacity": 0.8,
      "typography": {
        "title": {
          "weight": "normal",
          "size": "xl"
        }
      },
      "textColor": "red"
    }
  }
];