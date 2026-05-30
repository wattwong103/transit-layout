import { FloorRegion } from "@/types/station";

export const regionsF1: FloorRegion[] = [
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    // L-shape: main rect (480,230)→(760,360), bottom notch (500,360)→(660,400)
    svgPath:
      "M 488 230 L 752 230 Q 760 230 760 238 L 760 352 Q 760 360 752 360 L 668 360 Q 660 360 660 368 L 660 392 Q 660 400 652 400 L 508 400 Q 500 400 500 392 L 500 368 Q 500 360 492 360 L 488 360 Q 480 360 480 352 L 480 238 Q 480 230 488 230 Z",
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-hachiko-corridor",
    type: "concourse",
    // Simple rect (60,200)→(300,300)
    svgPath:
      "M 68 200 L 292 200 Q 300 200 300 208 L 300 292 Q 300 300 292 300 L 68 300 Q 60 300 60 292 L 60 208 Q 60 200 68 200 Z",
    label: "Hachiko Exit (West)",
  },
  {
    id: "f1-miyamasuzaka-corridor",
    type: "concourse",
    // Simple rect (840,250)→(1050,360)
    svgPath:
      "M 848 250 L 1042 250 Q 1050 250 1050 258 L 1050 352 Q 1050 360 1042 360 L 848 360 Q 840 360 840 352 L 840 258 Q 840 250 848 250 Z",
    label: "Miyamasuzaka Exit (East)",
  },
  {
    id: "f1-scramble-sq",
    type: "commercial",
    // Simple rect (1060,220)→(1170,380)
    svgPath:
      "M 1068 220 L 1162 220 Q 1170 220 1170 228 L 1170 372 Q 1170 380 1162 380 L 1068 380 Q 1060 380 1060 372 L 1060 228 Q 1060 220 1068 220 Z",
    label: "Scramble Square",
  },
  {
    id: "f1-north-passage",
    type: "concourse",
    // Simple rect (500,120)→(660,200)
    svgPath:
      "M 508 120 L 652 120 Q 660 120 660 128 L 660 192 Q 660 200 652 200 L 508 200 Q 500 200 500 192 L 500 128 Q 500 120 508 120 Z",
    label: "North Passage ↑2F",
  },
  {
    id: "f1-south-passage",
    type: "concourse",
    // Simple rect (500,460)→(660,540)
    svgPath:
      "M 508 460 L 652 460 Q 660 460 660 468 L 660 532 Q 660 540 652 540 L 508 540 Q 500 540 500 532 L 500 468 Q 500 460 508 460 Z",
    label: "South Passage ↓B1",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    // Simple rect (60,400)→(290,550)
    svgPath:
      "M 68 400 L 282 400 Q 290 400 290 408 L 290 542 Q 290 550 282 550 L 68 550 Q 60 550 60 542 L 60 408 Q 60 400 68 400 Z",
    label: "Bus Terminal (West)",
  },
  {
    id: "f1-street-north",
    type: "outside",
    // Simple rect (300,15)→(1170,70)
    svgPath:
      "M 308 15 L 1162 15 Q 1170 15 1170 23 L 1170 62 Q 1170 70 1162 70 L 308 70 Q 300 70 300 62 L 300 23 Q 300 15 308 15 Z",
    label: "Street (Meiji-dori)",
  },
  {
    id: "f1-street-south",
    type: "outside",
    // Simple rect (500,555)→(1170,590)
    svgPath:
      "M 508 555 L 1162 555 Q 1170 555 1170 563 L 1170 582 Q 1170 590 1162 590 L 508 590 Q 500 590 500 582 L 500 563 Q 500 555 508 555 Z",
    label: "Street (Sakuragaokacho)",
  },
];
