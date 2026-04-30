import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 200 155 L 230 140 L 970 140 L 1000 155 L 1000 215 L 970 230 L 230 230 L 200 215 Z",
    label: "Ginza Line Platform",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath:
      "M 300 245 L 900 245 L 900 360 L 700 360 L 700 400 L 500 400 L 500 360 L 300 360 Z",
    label: "Ginza Line Concourse",
  },
  {
    id: "f3-central-exit",
    type: "concourse",
    svgPath:
      "M 380 50 L 700 50 L 720 70 L 720 130 L 380 130 L 360 110 Z",
    label: "Central Exit",
  },
  {
    id: "f3-escalator-west",
    type: "concourse",
    svgPath:
      "M 340 410 L 490 410 L 490 490 L 340 490 Z",
    label: "Escalators ↓2F",
  },
  {
    id: "f3-escalator-east",
    type: "concourse",
    svgPath:
      "M 710 410 L 860 410 L 860 490 L 710 490 Z",
    label: "Stairs ↓2F",
  },
];
