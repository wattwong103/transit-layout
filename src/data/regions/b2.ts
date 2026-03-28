import { FloorRegion } from "@/types/station";

export const regionsB2: FloorRegion[] = [
  {
    id: "b2-platform-ginza",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 100 250 L 1100 250 L 1100 330 L 100 330 Z",
    label: "Ginza Line Platform",
  },
  {
    id: "b2-concourse-hanzomon-gate",
    type: "concourse",
    svgPath:
      "M 150 60 L 600 60 L 600 230 L 150 230 Z",
    label: "Hanzomon Ticket Gate / Concourse",
  },
  {
    id: "b2-passage-connecting",
    type: "concourse",
    svgPath:
      "M 620 80 L 1050 80 L 1050 240 L 620 240 Z",
    label: "Connecting Passage",
  },
  {
    id: "b2-concourse-south",
    type: "concourse",
    svgPath:
      "M 200 340 L 900 340 L 900 460 L 200 460 Z",
    label: "South Concourse",
  },
  {
    id: "b2-passage-vertical",
    type: "concourse",
    svgPath:
      "M 440 460 L 560 460 L 560 560 L 440 560 Z",
    label: "Passage to B3",
  },
];
