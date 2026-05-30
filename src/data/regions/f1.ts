import { FloorRegion } from "@/types/station";

export const regionsF1: FloorRegion[] = [
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    svgPath:
      "M 370 178 Q 370 170 378 170 L 822 170 Q 830 170 830 178 L 830 392 Q 830 400 822 400 L 688 400 Q 680 400 680 408 L 680 442 Q 680 450 672 450 L 518 450 Q 510 450 510 442 L 510 408 Q 510 400 502 400 L 378 400 Q 370 400 370 392 Z",
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-hachiko-corridor",
    type: "concourse",
    svgPath:
      "M 60 238 Q 60 230 68 230 L 352 230 Q 360 230 360 238 L 360 372 Q 360 380 352 380 L 68 380 Q 60 380 60 372 Z",
    label: "Hachiko Exit (West)",
  },
  {
    id: "f1-miyamasuzaka-corridor",
    type: "concourse",
    svgPath:
      "M 840 218 Q 840 210 848 210 L 1062 210 Q 1070 210 1070 218 L 1070 372 Q 1070 380 1062 380 L 848 380 Q 840 380 840 372 Z",
    label: "Miyamasuzaka Exit (East)",
  },
  {
    id: "f1-scramble-sq",
    type: "commercial",
    svgPath:
      "M 1080 208 Q 1080 200 1088 200 L 1162 200 Q 1170 200 1170 208 L 1170 382 Q 1170 390 1162 390 L 1088 390 Q 1080 390 1080 382 Z",
    label: "Scramble Square",
  },
  {
    id: "f1-north-passage",
    type: "concourse",
    svgPath:
      "M 430 88 Q 430 80 438 80 L 712 80 Q 720 80 720 88 L 720 152 Q 720 160 712 160 L 438 160 Q 430 160 430 152 Z",
    label: "North Passage ↑2F",
  },
  {
    id: "f1-south-passage",
    type: "concourse",
    svgPath:
      "M 460 468 Q 460 460 468 460 L 712 460 Q 720 460 720 468 L 720 532 Q 720 540 712 540 L 468 540 Q 460 540 460 532 Z",
    label: "South Passage ↓B1",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    svgPath:
      "M 60 408 Q 60 400 68 400 L 282 400 Q 290 400 290 408 L 290 542 Q 290 550 282 550 L 68 550 Q 60 550 60 542 Z",
    label: "Bus Terminal (West)",
  },
  {
    id: "f1-street-north",
    type: "outside",
    svgPath:
      "M 300 23 Q 300 15 308 15 L 1162 15 Q 1170 15 1170 23 L 1170 62 Q 1170 70 1162 70 L 308 70 Q 300 70 300 62 Z",
    label: "Street (Meiji-dori)",
  },
  {
    id: "f1-street-south",
    type: "outside",
    svgPath:
      "M 500 563 Q 500 555 508 555 L 1162 555 Q 1170 555 1170 563 L 1170 582 Q 1170 590 1162 590 L 508 590 Q 500 590 500 582 Z",
    label: "Street (Sakuragaokacho)",
  },
];
