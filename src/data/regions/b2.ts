import { FloorRegion } from "@/types/station";

export const regionsB2: FloorRegion[] = [
  {
    id: "b2-ticket-gate",
    type: "concourse",
    // Simple rect (320,200)→(880,280)
    svgPath:
      "M 328 200 L 872 200 Q 880 200 880 208 L 880 272 Q 880 280 872 280 L 328 280 Q 320 280 320 272 L 320 208 Q 320 200 328 200 Z",
    label: "Hanzomon / Den-en-toshi Ticket Gates",
  },
  {
    id: "b2-concourse",
    type: "concourse",
    // L-shape: main rect (220,290)→(980,400), bottom notch (480,400)→(620,460)
    svgPath:
      "M 228 290 L 972 290 Q 980 290 980 298 L 980 392 Q 980 400 972 400 L 628 400 Q 620 400 620 408 L 620 452 Q 620 460 612 460 L 488 460 Q 480 460 480 452 L 480 408 Q 480 400 472 400 L 228 400 Q 220 400 220 392 L 220 298 Q 220 290 228 290 Z",
    label: "Hanzomon / Den-en-toshi Concourse",
  },
  {
    id: "b2-west-corridor",
    type: "concourse",
    // Simple rect (80,290)→(210,410)
    svgPath:
      "M 88 290 L 202 290 Q 210 290 210 298 L 210 402 Q 210 410 202 410 L 88 410 Q 80 410 80 402 L 80 298 Q 80 290 88 290 Z",
    label: "West",
  },
  {
    id: "b2-east-corridor",
    type: "concourse",
    // Simple rect (990,290)→(1120,410)
    svgPath:
      "M 998 290 L 1112 290 Q 1120 290 1120 298 L 1120 402 Q 1120 410 1112 410 L 998 410 Q 990 410 990 402 L 990 298 Q 990 290 998 290 Z",
    label: "East",
  },
  {
    id: "b2-connection-down",
    type: "concourse",
    // Simple rect (440,470)→(660,550)
    svgPath:
      "M 448 470 L 652 470 Q 660 470 660 478 L 660 542 Q 660 550 652 550 L 448 550 Q 440 550 440 542 L 440 478 Q 440 470 448 470 Z",
    label: "↓B3",
  },
];
