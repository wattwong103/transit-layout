import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-keio-trackbed-left",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 10 45 Q 10 40 15 40 L 20 40 Q 25 40 25 45 L 25 265 Q 25 270 20 270 L 15 270 Q 10 270 10 265 Z",
    label: "",
  },
  {
    id: "f2-keio-inokashira",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 30 48 Q 30 40 38 40 L 202 40 Q 210 40 216 46 L 224 54 Q 230 60 230 68 L 230 242 Q 230 250 224 256 L 216 264 Q 210 270 202 270 L 38 270 Q 30 270 30 262 Z",
    label: "Keio Inokashira Line",
  },
  {
    id: "f2-keio-trackbed-right",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 235 45 Q 235 40 240 40 L 245 40 Q 250 40 250 45 L 250 265 Q 250 270 245 270 L 240 270 Q 235 270 235 265 Z",
    label: "",
  },
  {
    id: "f2-tamagawa-corridor",
    type: "concourse",
    svgPath:
      "M 240 148 Q 240 140 248 140 L 312 140 Q 320 140 320 148 L 320 212 Q 320 220 312 220 L 248 220 Q 240 220 240 212 Z",
    label: "Tamagawa Gate",
  },
  {
    id: "f2-yamanote-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 310 45 Q 310 40 315 40 L 925 40 Q 930 40 930 45 L 930 50 Q 930 55 925 55 L 315 55 Q 310 55 310 50 Z",
    label: "",
  },
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 310 83 Q 310 75 317 71 L 333 64 Q 340 60 348 60 L 892 60 Q 900 60 907 64 L 923 71 Q 930 75 930 83 L 930 127 Q 930 135 923 139 L 907 146 Q 900 150 892 150 L 348 150 Q 340 150 333 146 L 317 139 Q 310 135 310 127 Z",
    label: "JR Yamanote Line Platforms 1–2",
  },
  {
    id: "f2-yamanote-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 310 160 Q 310 155 315 155 L 925 155 Q 930 155 930 160 L 930 165 Q 930 170 925 170 L 315 170 Q 310 170 310 165 Z",
    label: "",
  },
  {
    id: "f2-jr-concourse",
    type: "concourse",
    svgPath:
      "M 330 168 Q 330 160 338 160 L 902 160 Q 910 160 910 168 L 910 322 Q 910 330 902 330 L 338 330 Q 330 330 330 322 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 140 320 Q 140 315 145 315 L 925 315 Q 930 315 930 320 L 930 325 Q 930 330 925 330 L 145 330 Q 140 330 140 325 Z",
    label: "",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 140 358 Q 140 350 147 346 L 163 339 Q 170 335 178 335 L 892 335 Q 900 335 907 339 L 923 346 Q 930 350 930 358 L 930 402 Q 930 410 923 414 L 907 421 Q 900 425 892 425 L 178 425 Q 170 425 163 421 L 147 414 Q 140 410 140 402 Z",
    label: "JR Saikyo / Shonan-Shinjuku Platforms 3–4",
  },
  {
    id: "f2-saikyo-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 140 435 Q 140 430 145 430 L 925 430 Q 930 430 930 435 L 930 440 Q 930 445 925 445 L 145 445 Q 140 445 140 440 Z",
    label: "",
  },
  {
    id: "f2-south-gate",
    type: "concourse",
    svgPath:
      "M 460 443 Q 460 435 468 435 L 652 435 Q 660 435 660 443 L 660 492 Q 660 500 652 500 L 468 500 Q 460 500 460 492 Z",
    label: "South Gate",
  },
  {
    id: "f2-new-south-exit",
    type: "concourse",
    svgPath:
      "M 40 438 Q 40 430 48 430 L 142 430 Q 150 430 150 438 L 150 512 Q 150 520 142 520 L 57 520 Q 50 520 45 515 L 45 515 Q 40 510 40 503 Z",
    label: "New South Exit",
  },
  {
    id: "f2-hikarie-passage",
    type: "concourse",
    svgPath:
      "M 940 198 Q 940 190 948 190 L 1142 190 Q 1150 190 1150 198 L 1150 302 Q 1150 310 1142 310 L 948 310 Q 940 310 940 302 Z",
    label: "Hikarie Passage",
  },
  {
    id: "f2-escalator-up",
    type: "concourse",
    svgPath:
      "M 400 23 Q 400 15 408 15 L 542 15 Q 550 15 550 23 L 550 42 Q 550 50 542 50 L 408 50 Q 400 50 400 42 Z",
    label: "↑3F",
  },
  {
    id: "f2-escalator-down",
    type: "concourse",
    svgPath:
      "M 680 443 Q 680 435 688 435 L 822 435 Q 830 435 830 443 L 830 492 Q 830 500 822 500 L 688 500 Q 680 500 680 492 Z",
    label: "↓1F",
  },
];
