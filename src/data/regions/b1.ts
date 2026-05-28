import { FloorRegion } from "@/types/station";

export const regionsB1: FloorRegion[] = [
  {
    id: "b1-central-concourse",
    type: "concourse",
    svgPath:
      "M 280 150 L 920 150 L 920 430 L 640 430 L 640 500 L 480 500 L 480 430 L 280 430 Z",
    label: "Central Concourse",
  },
  {
    id: "b1-west-passage",
    type: "concourse",
    svgPath:
      "M 60 240 L 270 240 L 270 370 L 60 370 Z",
    label: "West Passage (Hachiko)",
  },
  {
    id: "b1-east-passage",
    type: "concourse",
    svgPath:
      "M 930 240 L 1140 240 L 1140 370 L 930 370 Z",
    label: "East Passage (Hikarie)",
  },
  {
    id: "b1-commercial",
    type: "commercial",
    svgPath:
      "M 340 40 L 860 40 L 860 140 L 340 140 Z",
    label: "Shibuya Chikamichi (Shops)",
  },
  {
    id: "b1-connection-down",
    type: "concourse",
    svgPath:
      "M 450 510 L 670 510 L 670 570 L 450 570 Z",
    label: "↓B2",
  },
];
