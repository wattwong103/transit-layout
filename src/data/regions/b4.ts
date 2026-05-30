import { FloorRegion } from "@/types/station";

export const regionsB4: FloorRegion[] = [
  {
    id: "b4-ticket-gate",
    type: "concourse",
    // Simple rect (320,120)→(760,200)
    svgPath:
      "M 328 120 L 752 120 Q 760 120 760 128 L 760 192 Q 760 200 752 200 L 328 200 Q 320 200 320 192 L 320 128 Q 320 120 328 120 Z",
    label: "Fukutoshin / Toyoko Ticket Gates",
  },
  {
    id: "b4-concourse",
    type: "concourse",
    // L-shape: main rect (300,210)→(820,420), bottom notch (440,420)→(620,480)
    svgPath:
      "M 308 210 L 812 210 Q 820 210 820 218 L 820 412 Q 820 420 812 420 L 628 420 Q 620 420 620 428 L 620 472 Q 620 480 612 480 L 448 480 Q 440 480 440 472 L 440 428 Q 440 420 432 420 L 308 420 Q 300 420 300 412 L 300 218 Q 300 210 308 210 Z",
    label: "Main Concourse",
  },
  {
    id: "b4-shops-west",
    type: "commercial",
    // Simple rect (120,430)→(340,560)
    svgPath:
      "M 128 430 L 332 430 Q 340 430 340 438 L 340 552 Q 340 560 332 560 L 128 560 Q 120 560 120 552 L 120 438 Q 120 430 128 430 Z",
    label: "West Shops",
  },
  {
    id: "b4-shops-east",
    type: "commercial",
    // Simple rect (820,430)→(1040,560)
    svgPath:
      "M 828 430 L 1032 430 Q 1040 430 1040 438 L 1040 552 Q 1040 560 1032 560 L 828 560 Q 820 560 820 552 L 820 438 Q 820 430 828 430 Z",
    label: "East Shops",
  },
  {
    id: "b4-connection-down",
    type: "concourse",
    // Simple rect (440,490)→(620,560)
    svgPath:
      "M 448 490 L 612 490 Q 620 490 620 498 L 620 552 Q 620 560 612 560 L 448 560 Q 440 560 440 552 L 440 498 Q 440 490 448 490 Z",
    label: "↓B5",
  },
];
