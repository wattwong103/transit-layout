import { FloorRegion } from "@/types/station";

export const regionsF1: FloorRegion[] = [
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    svgPath:
      "M 370 170 L 830 170 L 830 400 L 680 400 L 680 450 L 510 450 L 510 400 L 370 400 Z",
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-hachiko-corridor",
    type: "concourse",
    svgPath:
      "M 60 230 L 360 230 L 360 380 L 60 380 Z",
    label: "Hachiko Exit (West)",
  },
  {
    id: "f1-miyamasuzaka-corridor",
    type: "concourse",
    svgPath:
      "M 840 210 L 1070 210 L 1070 380 L 840 380 Z",
    label: "Miyamasuzaka Exit (East)",
  },
  {
    id: "f1-scramble-sq",
    type: "commercial",
    svgPath:
      "M 1080 200 L 1170 200 L 1170 390 L 1080 390 Z",
    label: "Scramble Square",
  },
  {
    id: "f1-north-passage",
    type: "concourse",
    svgPath:
      "M 430 80 L 720 80 L 720 160 L 430 160 Z",
    label: "North Passage ↑2F",
  },
  {
    id: "f1-south-passage",
    type: "concourse",
    svgPath:
      "M 460 460 L 720 460 L 720 540 L 460 540 Z",
    label: "South Passage ↓B1",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    svgPath:
      "M 60 400 L 290 400 L 290 550 L 60 550 Z",
    label: "Bus Terminal (West)",
  },
  {
    id: "f1-street-north",
    type: "outside",
    svgPath:
      "M 300 15 L 1170 15 L 1170 70 L 300 70 Z",
    label: "Street (Meiji-dori)",
  },
  {
    id: "f1-street-south",
    type: "outside",
    svgPath:
      "M 500 555 L 1170 555 L 1170 590 L 500 590 Z",
    label: "Street (Sakuragaokacho)",
  },
];
