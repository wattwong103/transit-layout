import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-yamanote-platform-1",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 120 100 L 1080 100 L 1080 170 L 120 170 Z",
    label: "JR Yamanote Line Platform 1 (Inner Loop)",
  },
  {
    id: "f3-yamanote-platform-2",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 120 180 L 1080 180 L 1080 250 L 120 250 Z",
    label: "JR Yamanote Line Platform 2 (Outer Loop)",
  },
  {
    id: "f3-platform-concourse-mid",
    type: "concourse",
    svgPath:
      "M 200 260 L 1000 260 L 1000 320 L 200 320 Z",
    label: "Platform Concourse (Between Yamanote / Saikyo)",
  },
  {
    id: "f3-saikyo-platform-3",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 120 330 L 1080 330 L 1080 400 L 120 400 Z",
    label: "JR Saikyo Line Platform 3",
  },
  {
    id: "f3-shonan-shinjuku-platform-4",
    type: "platform_area",
    railwayLine: "jr_shonan_shinjuku",
    svgPath:
      "M 120 410 L 1080 410 L 1080 480 L 120 480 Z",
    label: "JR Shonan-Shinjuku Line Platform 4",
  },
  {
    id: "f3-covered-walkway-north",
    type: "concourse",
    svgPath:
      "M 120 40 L 1080 40 L 1080 90 L 120 90 Z",
    label: "Covered Walkway (North)",
  },
  {
    id: "f3-covered-walkway-south",
    type: "concourse",
    svgPath:
      "M 120 490 L 1080 490 L 1080 540 L 120 540 Z",
    label: "Covered Walkway (South)",
  },
  {
    id: "f3-stairs-west",
    type: "concourse",
    svgPath:
      "M 40 120 L 110 120 L 110 460 L 40 460 Z",
    label: "Stairs / Escalators (West End)",
  },
  {
    id: "f3-stairs-east",
    type: "concourse",
    svgPath:
      "M 1090 120 L 1160 120 L 1160 460 L 1090 460 Z",
    label: "Stairs / Escalators (East End)",
  },
];
