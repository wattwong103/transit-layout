import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 380 175 L 410 160 L 850 160 L 880 175 L 880 235 L 850 250 L 410 250 L 380 235 Z",
    label: "Ginza Line Platform",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath:
      "M 420 265 L 840 265 L 840 380 L 700 380 L 700 430 L 560 430 L 560 380 L 420 380 Z",
    label: "Ginza Line Concourse",
  },
  {
    id: "f3-central-exit",
    type: "concourse",
    svgPath:
      "M 500 60 L 730 60 L 750 80 L 750 150 L 500 150 L 480 130 Z",
    label: "Central Exit",
  },
  {
    id: "f3-escalator-west",
    type: "concourse",
    svgPath:
      "M 400 440 L 550 440 L 550 510 L 400 510 Z",
    label: "Escalators ↓2F",
  },
  {
    id: "f3-escalator-east",
    type: "concourse",
    svgPath:
      "M 710 440 L 860 440 L 860 510 L 710 510 Z",
    label: "Stairs ↓2F",
  },
];
