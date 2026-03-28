import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-jr-central-concourse",
    type: "concourse",
    svgPath:
      "M 280 150 L 850 150 L 850 420 L 280 420 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-jr-ticket-gate-north",
    type: "concourse",
    svgPath:
      "M 380 60 L 700 60 L 700 140 L 380 140 Z",
    label: "JR Ticket Gate (North)",
  },
  {
    id: "f2-jr-ticket-gate-south",
    type: "concourse",
    svgPath:
      "M 380 430 L 700 430 L 700 510 L 380 510 Z",
    label: "JR Ticket Gate (South)",
  },
  {
    id: "f2-keio-inokashira-platform",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 40 50 L 270 50 L 270 260 L 40 260 Z",
    label: "Keio Inokashira Line Platform",
  },
  {
    id: "f2-connection-hikarie",
    type: "concourse",
    svgPath:
      "M 860 180 L 1170 180 L 1170 340 L 860 340 Z",
    label: "Connection Passage (Hikarie / Scramble Square)",
  },
  {
    id: "f2-commercial-ecute-north",
    type: "commercial",
    svgPath:
      "M 710 160 L 840 160 L 840 280 L 710 280 Z",
    label: "ecute (North Wing)",
  },
  {
    id: "f2-commercial-ecute-south",
    type: "commercial",
    svgPath:
      "M 710 290 L 840 290 L 840 410 L 710 410 Z",
    label: "ecute (South Wing)",
  },
  {
    id: "f2-commercial-west",
    type: "commercial",
    svgPath:
      "M 40 280 L 270 280 L 270 420 L 40 420 Z",
    label: "Shops (West Side)",
  },
];
