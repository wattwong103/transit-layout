import { FloorRegion } from "@/types/station";

export const regionsB4: FloorRegion[] = [
  {
    id: "b4-ticket-gate",
    type: "concourse",
    svgPath:
      "M 280 50 L 920 50 L 920 160 L 280 160 Z",
    label: "Fukutoshin / Toyoko Ticket Gates",
  },
  {
    id: "b4-concourse",
    type: "concourse",
    svgPath:
      "M 180 170 L 1020 170 L 1020 420 L 700 420 L 700 490 L 500 490 L 500 420 L 180 420 Z",
    label: "Main Concourse",
  },
  {
    id: "b4-shops-west",
    type: "commercial",
    svgPath:
      "M 180 430 L 400 430 L 400 560 L 180 560 Z",
    label: "West Shops",
  },
  {
    id: "b4-shops-east",
    type: "commercial",
    svgPath:
      "M 800 430 L 1020 430 L 1020 560 L 800 560 Z",
    label: "East Shops",
  },
  {
    id: "b4-connection-down",
    type: "concourse",
    svgPath:
      "M 470 500 L 730 500 L 730 560 L 470 560 Z",
    label: "↓B5",
  },
];
