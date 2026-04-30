import { FloorRegion } from "@/types/station";

export const regionsB2: FloorRegion[] = [
  {
    id: "b2-ticket-gate",
    type: "concourse",
    svgPath:
      "M 320 80 L 880 80 L 880 190 L 320 190 Z",
    label: "Hanzomon / Den-en-toshi Ticket Gates",
  },
  {
    id: "b2-concourse",
    type: "concourse",
    svgPath:
      "M 220 200 L 980 200 L 980 400 L 620 400 L 620 470 L 480 470 L 480 400 L 220 400 Z",
    label: "Hanzomon / Den-en-toshi Concourse",
  },
  {
    id: "b2-west-corridor",
    type: "concourse",
    svgPath:
      "M 80 250 L 210 250 L 210 370 L 80 370 Z",
    label: "West",
  },
  {
    id: "b2-east-corridor",
    type: "concourse",
    svgPath:
      "M 990 250 L 1120 250 L 1120 370 L 990 370 Z",
    label: "East",
  },
  {
    id: "b2-connection-down",
    type: "concourse",
    svgPath:
      "M 440 480 L 660 480 L 660 550 L 440 550 Z",
    label: "↓B3",
  },
];
