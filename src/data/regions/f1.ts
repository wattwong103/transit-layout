import { FloorRegion } from "@/types/station";

export const regionsF1: FloorRegion[] = [
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    svgPath:
      "M 380 180 L 780 180 L 780 400 L 380 400 Z",
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-hachiko-exit",
    type: "concourse",
    svgPath:
      "M 80 200 L 370 200 L 370 360 L 80 360 Z",
    label: "Hachiko Exit",
  },
  {
    id: "f1-central-exit",
    type: "concourse",
    svgPath:
      "M 420 60 L 720 60 L 720 170 L 420 170 Z",
    label: "Central Exit",
  },
  {
    id: "f1-new-south-exit",
    type: "concourse",
    svgPath:
      "M 350 410 L 650 410 L 650 520 L 350 520 Z",
    label: "New South Exit",
  },
  {
    id: "f1-miyamasuzaka-exit",
    type: "concourse",
    svgPath:
      "M 790 160 L 1020 160 L 1020 340 L 790 340 Z",
    label: "Miyamasuzaka Exit (toward Hikarie)",
  },
  {
    id: "f1-keio-inokashira-gate",
    type: "concourse",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 50 50 L 280 50 L 280 190 L 50 190 Z",
    label: "Keio Inokashira Ticket Gate",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    svgPath:
      "M 30 370 L 290 370 L 290 530 L 30 530 Z",
    label: "Bus Terminal (West)",
  },
  {
    id: "f1-scramble-square-entrance",
    type: "commercial",
    svgPath:
      "M 1030 140 L 1170 140 L 1170 360 L 1030 360 Z",
    label: "Scramble Square Entrance",
  },
  {
    id: "f1-outside-north",
    type: "outside",
    svgPath:
      "M 290 10 L 410 10 L 410 50 L 290 50 Z",
    label: "Street (North-West)",
  },
  {
    id: "f1-outside-north-central",
    type: "outside",
    svgPath:
      "M 730 10 L 1170 10 L 1170 130 L 730 130 Z",
    label: "Street (North-East / Meiji-dori)",
  },
  {
    id: "f1-outside-south",
    type: "outside",
    svgPath:
      "M 660 530 L 1170 530 L 1170 590 L 660 590 Z",
    label: "Street (South / Sakuragaokacho)",
  },
  {
    id: "f1-outside-east",
    type: "outside",
    svgPath:
      "M 1030 370 L 1170 370 L 1170 520 L 1030 520 Z",
    label: "Street (East / Roppongi-dori)",
  },
];
