import { FloorRegion } from "@/types/station";

export const regionsB2: FloorRegion[] = [
  {
    id: "b2-ticket-gate",
    type: "concourse",
    // Original: M 320 80 L 880 80 L 880 190 L 320 190 Z
    svgPath:
      "M 320 88 Q 320 80 328 80 L 872 80 Q 880 80 880 88 L 880 182 Q 880 190 872 190 L 328 190 Q 320 190 320 182 Z",
    label: "Hanzomon / Den-en-toshi Ticket Gates",
  },
  {
    id: "b2-concourse",
    type: "concourse",
    // Original: M 220 200 L 980 200 L 980 400 L 620 400 L 620 470 L 480 470 L 480 400 L 220 400 Z
    // L-shape with notch at bottom-center
    svgPath:
      "M 220 208 Q 220 200 228 200 L 972 200 Q 980 200 980 208 L 980 392 Q 980 400 972 400 L 628 400 Q 620 400 620 408 L 620 462 Q 620 470 612 470 L 488 470 Q 480 470 480 462 L 480 408 Q 480 400 472 400 L 228 400 Q 220 400 220 392 Z",
    label: "Hanzomon / Den-en-toshi Concourse",
  },
  {
    id: "b2-west-corridor",
    type: "concourse",
    // Original: M 80 250 L 210 250 L 210 370 L 80 370 Z
    svgPath:
      "M 80 258 Q 80 250 88 250 L 202 250 Q 210 250 210 258 L 210 362 Q 210 370 202 370 L 88 370 Q 80 370 80 362 Z",
    label: "West",
  },
  {
    id: "b2-east-corridor",
    type: "concourse",
    // Original: M 990 250 L 1120 250 L 1120 370 L 990 370 Z
    svgPath:
      "M 990 258 Q 990 250 998 250 L 1112 250 Q 1120 250 1120 258 L 1120 362 Q 1120 370 1112 370 L 998 370 Q 990 370 990 362 Z",
    label: "East",
  },
  {
    id: "b2-connection-down",
    type: "concourse",
    // Original: M 440 480 L 660 480 L 660 550 L 440 550 Z
    svgPath:
      "M 440 488 Q 440 480 448 480 L 652 480 Q 660 480 660 488 L 660 542 Q 660 550 652 550 L 448 550 Q 440 550 440 542 Z",
    label: "↓B3",
  },
];
