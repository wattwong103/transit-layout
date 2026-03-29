import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 200 120 L 1000 120 L 1000 250 L 200 250 Z",
    label: "Tokyo Metro Ginza Line Platform",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath:
      "M 250 260 L 950 260 L 950 380 L 250 380 Z",
    label: "Ginza Line Concourse",
  },
  {
    id: "f3-escalator-stairs-area",
    type: "concourse",
    svgPath:
      "M 350 390 L 850 390 L 850 500 L 350 500 Z",
    label: "Escalators / Stairs (to 2F)",
  },
];
