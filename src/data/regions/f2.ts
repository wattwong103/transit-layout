import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-keio-inokashira",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 30 40 L 210 40 L 230 60 L 230 250 L 210 270 L 30 270 Z",
    label: "Keio Inokashira Line",
  },
  {
    id: "f2-tamagawa-corridor",
    type: "concourse",
    svgPath:
      "M 240 140 L 320 140 L 320 220 L 240 220 Z",
    label: "Tamagawa Gate",
  },
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 310 75 L 340 60 L 900 60 L 930 75 L 930 135 L 900 150 L 340 150 L 310 135 Z",
    label: "JR Yamanote Line Platforms 1–2",
  },
  {
    id: "f2-jr-concourse",
    type: "concourse",
    svgPath:
      "M 330 160 L 910 160 L 910 330 L 330 330 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 140 350 L 170 335 L 900 335 L 930 350 L 930 410 L 900 425 L 170 425 L 140 410 Z",
    label: "JR Saikyo / Shonan-Shinjuku Platforms 3–4",
  },
  {
    id: "f2-south-gate",
    type: "concourse",
    svgPath:
      "M 460 435 L 660 435 L 660 500 L 460 500 Z",
    label: "South Gate",
  },
  {
    id: "f2-new-south-exit",
    type: "concourse",
    svgPath:
      "M 40 430 L 150 430 L 150 520 L 50 520 L 40 510 Z",
    label: "New South Exit",
  },
  {
    id: "f2-hikarie-passage",
    type: "concourse",
    svgPath:
      "M 940 190 L 1150 190 L 1150 310 L 940 310 Z",
    label: "Hikarie Passage",
  },
  {
    id: "f2-escalator-up",
    type: "concourse",
    svgPath:
      "M 400 15 L 550 15 L 550 50 L 400 50 Z",
    label: "↑3F",
  },
  {
    id: "f2-escalator-down",
    type: "concourse",
    svgPath:
      "M 680 435 L 830 435 L 830 500 L 680 500 Z",
    label: "↓1F",
  },
];
