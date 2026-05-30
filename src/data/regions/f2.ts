import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-keio-trackbed-left",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 43 148 L 297 148 Q 300 148 300 151 L 300 152 Q 300 155 297 155 L 43 155 Q 40 155 40 152 L 40 151 Q 40 148 43 148 Z",
    label: "",
  },
  {
    id: "f2-keio-inokashira",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 40 166 Q 40 158 48 158 L 292 158 Q 300 158 300 166 L 300 217 Q 300 225 292 225 L 48 225 Q 40 225 40 217 Z",
    label: "Keio Inokashira Line",
  },
  {
    id: "f2-keio-trackbed-right",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 43 225 L 297 225 Q 300 225 300 228 L 300 229 Q 300 232 297 232 L 43 232 Q 40 232 40 229 L 40 228 Q 40 225 43 225 Z",
    label: "",
  },
  {
    id: "f2-tamagawa-corridor",
    type: "concourse",
    svgPath:
      "M 308 175 L 372 175 Q 380 175 380 183 L 380 227 Q 380 235 372 235 L 308 235 Q 300 235 300 227 L 300 183 Q 300 175 308 175 Z",
    label: "Tamagawa Gate",
  },
  {
    id: "f2-yamanote-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 508 90 L 509 90 Q 512 90 512 93 L 512 507 Q 512 510 509 510 L 508 510 Q 505 510 505 507 L 505 93 Q 505 90 508 90 Z",
    label: "",
  },
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 528 90 Q 520 90 520 98 L 520 502 Q 520 510 528 510 L 592 510 Q 600 510 600 502 L 600 98 Q 600 90 592 90 Z",
    label: "JR Yamanote 1–2",
  },
  {
    id: "f2-yamanote-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 611 90 L 612 90 Q 615 90 615 93 L 615 507 Q 615 510 612 510 L 611 510 Q 608 510 608 507 L 608 93 Q 608 90 611 90 Z",
    label: "",
  },
  {
    id: "f2-jr-concourse",
    type: "concourse",
    svgPath:
      "M 468 250 L 752 250 Q 760 250 760 258 L 760 332 Q 760 340 752 340 L 468 340 Q 460 340 460 332 L 460 258 Q 460 250 468 250 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 628 90 L 629 90 Q 632 90 632 93 L 632 507 Q 632 510 629 510 L 628 510 Q 625 510 625 507 L 625 93 Q 625 90 628 90 Z",
    label: "",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 648 90 Q 640 90 640 98 L 640 502 Q 640 510 648 510 L 712 510 Q 720 510 720 502 L 720 98 Q 720 90 712 90 Z",
    label: "JR Saikyo 3–4",
  },
  {
    id: "f2-saikyo-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 731 90 L 732 90 Q 735 90 735 93 L 735 507 Q 735 510 732 510 L 731 510 Q 728 510 728 507 L 728 93 Q 728 90 731 90 Z",
    label: "",
  },
  {
    id: "f2-south-gate",
    type: "concourse",
    svgPath:
      "M 508 500 L 652 500 Q 660 500 660 508 L 660 552 Q 660 560 652 560 L 508 560 Q 500 560 500 552 L 500 508 Q 500 500 508 500 Z",
    label: "South Gate",
  },
  {
    id: "f2-new-south-exit",
    type: "concourse",
    svgPath:
      "M 248 500 L 372 500 Q 380 500 380 508 L 380 552 Q 380 560 372 560 L 248 560 Q 240 560 240 552 L 240 508 Q 240 500 248 500 Z",
    label: "New South Exit",
  },
  {
    id: "f2-hikarie-passage",
    type: "concourse",
    svgPath:
      "M 948 220 L 1142 220 Q 1150 220 1150 228 L 1150 292 Q 1150 300 1142 300 L 948 300 Q 940 300 940 292 L 940 228 Q 940 220 948 220 Z",
    label: "Hikarie Passage",
  },
  {
    id: "f2-escalator-up",
    type: "concourse",
    svgPath:
      "M 518 30 L 592 30 Q 600 30 600 38 L 600 62 Q 600 70 592 70 L 518 70 Q 510 70 510 62 L 510 38 Q 510 30 518 30 Z",
    label: "↑3F",
  },
  {
    id: "f2-escalator-down",
    type: "concourse",
    svgPath:
      "M 548 430 L 632 430 Q 640 430 640 438 L 640 482 Q 640 490 632 490 L 548 490 Q 540 490 540 482 L 540 438 Q 540 430 548 430 Z",
    label: "↓1F",
  },
];
