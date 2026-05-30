import { FloorRegion } from "@/types/station";

export const regionsB1: FloorRegion[] = [
  {
    id: "b1-central-concourse",
    type: "concourse",
    // Original: M 280 150 L 920 150 L 920 430 L 640 430 L 640 500 L 480 500 L 480 430 L 280 430 Z
    // L-shape: top-left(280,150) top-right(920,150) then down to (920,430)
    //          inner step: (640,430) (640,500) (480,500) (480,430) back to (280,430)
    svgPath:
      "M 280 158 Q 280 150 288 150 L 912 150 Q 920 150 920 158 L 920 422 Q 920 430 912 430 L 648 430 Q 640 430 640 438 L 640 492 Q 640 500 632 500 L 488 500 Q 480 500 480 492 L 480 438 Q 480 430 472 430 L 288 430 Q 280 430 280 422 Z",
    label: "Central Concourse",
  },
  {
    id: "b1-west-passage",
    type: "concourse",
    // Original: M 60 240 L 270 240 L 270 370 L 60 370 Z
    svgPath:
      "M 60 248 Q 60 240 68 240 L 262 240 Q 270 240 270 248 L 270 362 Q 270 370 262 370 L 68 370 Q 60 370 60 362 Z",
    label: "West Passage (Hachiko)",
  },
  {
    id: "b1-east-passage",
    type: "concourse",
    // Original: M 930 240 L 1140 240 L 1140 370 L 930 370 Z
    svgPath:
      "M 930 248 Q 930 240 938 240 L 1132 240 Q 1140 240 1140 248 L 1140 362 Q 1140 370 1132 370 L 938 370 Q 930 370 930 362 Z",
    label: "East Passage (Hikarie)",
  },
  {
    id: "b1-commercial",
    type: "commercial",
    // Original: M 340 40 L 860 40 L 860 140 L 340 140 Z
    svgPath:
      "M 340 48 Q 340 40 348 40 L 852 40 Q 860 40 860 48 L 860 132 Q 860 140 852 140 L 348 140 Q 340 140 340 132 Z",
    label: "Shibuya Chikamichi (Shops)",
  },
  {
    id: "b1-connection-down",
    type: "concourse",
    // Original: M 450 510 L 670 510 L 670 570 L 450 570 Z
    svgPath:
      "M 450 518 Q 450 510 458 510 L 662 510 Q 670 510 670 518 L 670 562 Q 670 570 662 570 L 458 570 Q 450 570 450 562 Z",
    label: "↓B2",
  },
];
