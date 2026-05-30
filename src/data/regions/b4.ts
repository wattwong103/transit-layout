import { FloorRegion } from "@/types/station";

export const regionsB4: FloorRegion[] = [
  {
    id: "b4-ticket-gate",
    type: "concourse",
    // Original: M 280 50 L 920 50 L 920 160 L 280 160 Z
    svgPath:
      "M 280 58 Q 280 50 288 50 L 912 50 Q 920 50 920 58 L 920 152 Q 920 160 912 160 L 288 160 Q 280 160 280 152 Z",
    label: "Fukutoshin / Toyoko Ticket Gates",
  },
  {
    id: "b4-concourse",
    type: "concourse",
    // Original: M 180 170 L 1020 170 L 1020 420 L 700 420 L 700 490 L 500 490 L 500 420 L 180 420 Z
    svgPath:
      "M 180 178 Q 180 170 188 170 L 1012 170 Q 1020 170 1020 178 L 1020 412 Q 1020 420 1012 420 L 708 420 Q 700 420 700 428 L 700 482 Q 700 490 692 490 L 508 490 Q 500 490 500 482 L 500 428 Q 500 420 492 420 L 188 420 Q 180 420 180 412 Z",
    label: "Main Concourse",
  },
  {
    id: "b4-shops-west",
    type: "commercial",
    // Original: M 180 430 L 400 430 L 400 560 L 180 560 Z
    svgPath:
      "M 180 438 Q 180 430 188 430 L 392 430 Q 400 430 400 438 L 400 552 Q 400 560 392 560 L 188 560 Q 180 560 180 552 Z",
    label: "West Shops",
  },
  {
    id: "b4-shops-east",
    type: "commercial",
    // Original: M 800 430 L 1020 430 L 1020 560 L 800 560 Z
    svgPath:
      "M 800 438 Q 800 430 808 430 L 1012 430 Q 1020 430 1020 438 L 1020 552 Q 1020 560 1012 560 L 808 560 Q 800 560 800 552 Z",
    label: "East Shops",
  },
  {
    id: "b4-connection-down",
    type: "concourse",
    // Original: M 470 500 L 730 500 L 730 560 L 470 560 Z
    svgPath:
      "M 470 508 Q 470 500 478 500 L 722 500 Q 730 500 730 508 L 730 552 Q 730 560 722 560 L 478 560 Q 470 560 470 552 Z",
    label: "↓B5",
  },
];
