import { FloorRegion } from "@/types/station";

export const regionsB1: FloorRegion[] = [
  {
    id: "b1-central-concourse",
    type: "concourse",
    svgPath:
      "M 280 160 L 920 160 L 920 440 L 620 440 L 620 500 L 480 500 L 480 440 L 280 440 Z",
    label: "Central Concourse",
  },
  {
    id: "b1-west-passage",
    type: "concourse",
    svgPath:
      "M 50 240 L 270 240 L 270 370 L 50 370 Z",
    label: "West Passage (Hachiko)",
  },
  {
    id: "b1-east-passage",
    type: "concourse",
    svgPath:
      "M 930 240 L 1150 240 L 1150 370 L 930 370 Z",
    label: "East Passage (Hikarie)",
  },
  {
    id: "b1-commercial",
    type: "commercial",
    svgPath:
      "M 330 50 L 870 50 L 870 150 L 330 150 Z",
    label: "Shibuya Chikamichi (Shops)",
  },
  {
    id: "b1-connection-down",
    type: "concourse",
    svgPath:
      "M 450 510 L 650 510 L 650 570 L 450 570 Z",
    label: "↓B2",
  },
];
