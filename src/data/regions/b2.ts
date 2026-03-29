import { FloorRegion } from "@/types/station";

export const regionsB2: FloorRegion[] = [
  {
    id: "b2-hanzomon-concourse",
    type: "concourse",
    svgPath:
      "M 200 200 L 1000 200 L 1000 400 L 200 400 Z",
    label: "Hanzomon / Den-en-toshi Concourse",
  },
  {
    id: "b2-ticket-gate-area",
    type: "concourse",
    svgPath:
      "M 350 100 L 850 100 L 850 190 L 350 190 Z",
    label: "Hanzomon / Den-en-toshi Ticket Gate Area",
  },
  {
    id: "b2-passage-west",
    type: "concourse",
    svgPath:
      "M 80 220 L 190 220 L 190 380 L 80 380 Z",
    label: "West Corridor",
  },
  {
    id: "b2-passage-east",
    type: "concourse",
    svgPath:
      "M 1010 220 L 1120 220 L 1120 380 L 1010 380 Z",
    label: "East Corridor",
  },
  {
    id: "b2-passage-to-b3",
    type: "concourse",
    svgPath:
      "M 440 410 L 560 410 L 560 540 L 440 540 Z",
    label: "Passage to B3",
  },
];
