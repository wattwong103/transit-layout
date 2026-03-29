import { FloorRegion } from "@/types/station";

export const regionsB4: FloorRegion[] = [
  {
    id: "b4-concourse-main",
    type: "concourse",
    svgPath:
      "M 120 160 L 1080 160 L 1080 420 L 120 420 Z",
    label: "Main Concourse",
  },
  {
    id: "b4-ticket-gate-north",
    type: "concourse",
    svgPath:
      "M 200 40 L 1000 40 L 1000 150 L 200 150 Z",
    label: "Ticket Gate Area (North)",
  },
  {
    id: "b4-commercial-east",
    type: "commercial",
    svgPath:
      "M 820 430 L 1080 430 L 1080 560 L 820 560 Z",
    label: "East Side Shops",
  },
  {
    id: "b4-commercial-west",
    type: "commercial",
    svgPath:
      "M 120 430 L 380 430 L 380 560 L 120 560 Z",
    label: "West Side Shops",
  },
  {
    id: "b4-passage-south",
    type: "concourse",
    svgPath:
      "M 450 420 L 750 420 L 750 560 L 450 560 Z",
    label: "South Passage to B5",
  },
];
