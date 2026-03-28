import { FloorRegion } from "@/types/station";

export const regionsB1: FloorRegion[] = [
  {
    id: "b1-concourse-central",
    type: "concourse",
    svgPath:
      "M 250 140 L 950 140 L 950 440 L 250 440 Z",
    label: "Central Concourse",
  },
  {
    id: "b1-passage-west-hachiko",
    type: "concourse",
    svgPath:
      "M 30 220 L 250 220 L 250 360 L 30 360 Z",
    label: "Underground Passage (West / Hachiko)",
  },
  {
    id: "b1-passage-east-hikarie",
    type: "concourse",
    svgPath:
      "M 950 200 L 1170 200 L 1170 380 L 950 380 Z",
    label: "Underground Passage (East / Hikarie)",
  },
  {
    id: "b1-commercial-north",
    type: "commercial",
    svgPath:
      "M 300 30 L 900 30 L 900 130 L 300 130 Z",
    label: "Commercial Area",
  },
  {
    id: "b1-passage-to-ginza",
    type: "concourse",
    svgPath:
      "M 400 440 L 600 440 L 600 570 L 400 570 Z",
    label: "Passage to B2 / Ginza Line",
  },
  {
    id: "b1-outside-west",
    type: "outside",
    svgPath:
      "M 30 30 L 240 30 L 240 210 L 30 210 Z",
    label: "Hachiko Square (Above)",
  },
  {
    id: "b1-outside-east",
    type: "outside",
    svgPath:
      "M 960 30 L 1170 30 L 1170 190 L 960 190 Z",
    label: "Hikarie Side (Above)",
  },
];
