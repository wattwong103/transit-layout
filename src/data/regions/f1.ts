import { FloorRegion } from "@/types/station";

export const regionsF1: FloorRegion[] = [
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    svgPath:
      "M 380 180 L 800 180 L 800 420 L 580 420 L 580 380 L 380 380 Z",
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-hachiko-corridor",
    type: "concourse",
    svgPath:
      "M 60 240 L 370 240 L 370 380 L 60 380 Z",
    label: "Hachiko Exit",
  },
  {
    id: "f1-miyamasuzaka-corridor",
    type: "concourse",
    svgPath:
      "M 810 220 L 1060 220 L 1060 380 L 810 380 Z",
    label: "Miyamasuzaka Exit (toward Hikarie)",
  },
  {
    id: "f1-scramble-sq",
    type: "commercial",
    svgPath:
      "M 1070 200 L 1170 200 L 1170 400 L 1070 400 Z",
    label: "Scramble Square",
  },
  {
    id: "f1-north-passage",
    type: "concourse",
    svgPath:
      "M 420 90 L 750 90 L 750 170 L 420 170 Z",
    label: "North Passage",
  },
  {
    id: "f1-south-passage",
    type: "concourse",
    svgPath:
      "M 420 430 L 700 430 L 700 520 L 420 520 Z",
    label: "South Passage ↓B1",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    svgPath:
      "M 60 400 L 300 400 L 300 550 L 60 550 Z",
    label: "Bus Terminal (West)",
  },
  {
    id: "f1-street-north",
    type: "outside",
    svgPath:
      "M 300 20 L 1170 20 L 1170 80 L 300 80 Z",
    label: "Street (Meiji-dori)",
  },
  {
    id: "f1-street-south",
    type: "outside",
    svgPath:
      "M 500 540 L 1170 540 L 1170 590 L 500 590 Z",
    label: "Street (Sakuragaokacho)",
  },
];
