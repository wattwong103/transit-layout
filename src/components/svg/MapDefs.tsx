"use client";

import { railwayLines } from "@/data/lines";
import { shadeFace } from "@/lib/isometric";

export const FILTER_SOFT_SHADOW = "softShadow";
export const FILTER_REGION_SHADOW = "regionShadow";
export const PATTERN_PLATFORM_HATCH = "platformHatch";
export const PATTERN_STAIRS_HATCH = "stairsHatch";
export const PATTERN_TRACK_TIES = "trackTies";
export const PATTERN_FLOOR_TILE = "floorTile";

export default function MapDefs() {
  return (
    <defs>
      {/* Visible drop shadow for regions */}
      <filter id={FILTER_REGION_SHADOW} x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.6" />
      </filter>

      {/* Soft drop shadow for badges */}
      <filter id={FILTER_SOFT_SHADOW} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity="0.65" />
      </filter>

      {/* Platform diagonal hatch */}
      <pattern
        id={PATTERN_PLATFORM_HATCH}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeWidth="1" strokeOpacity="0.15" />
      </pattern>

      {/* Stairs step hatch */}
      <pattern
        id={PATTERN_STAIRS_HATCH}
        width="8"
        height="4"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="2" x2="8" y2="2" stroke="#fff" strokeWidth="0.6" strokeOpacity="0.2" />
      </pattern>

      {/* Track cross-ties pattern */}
      <pattern
        id={PATTERN_TRACK_TIES}
        width="16"
        height="16"
        patternUnits="userSpaceOnUse"
      >
        {/* Rails */}
        <line x1="0" y1="4" x2="16" y2="4" stroke="#4a5568" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="0" y1="12" x2="16" y2="12" stroke="#4a5568" strokeWidth="1" strokeOpacity="0.6" />
        {/* Cross-ties */}
        <line x1="4" y1="2" x2="4" y2="14" stroke="#374151" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="12" y1="2" x2="12" y2="14" stroke="#374151" strokeWidth="1.5" strokeOpacity="0.4" />
      </pattern>

      {/* Concourse floor tile pattern */}
      <pattern
        id={PATTERN_FLOOR_TILE}
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <rect width="24" height="24" fill="none" stroke="#fff" strokeWidth="0.3" strokeOpacity="0.06" />
      </pattern>

      {/* Per-line gradients for platform bars */}
      {railwayLines.map((line) => {
        const top = shadeFace(line.color, "top");
        const side = shadeFace(line.color, "side");
        return (
          <linearGradient
            key={line.id}
            id={`lineGrad_${line.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={top} />
            <stop offset="100%" stopColor={side} />
          </linearGradient>
        );
      })}

      {/* Region type gradients */}
      <linearGradient id="concourseFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#243b53" />
        <stop offset="100%" stopColor="#162d4a" />
      </linearGradient>

      <linearGradient id="commercialFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3d2b5a" />
        <stop offset="100%" stopColor="#2d1e45" />
      </linearGradient>

      <linearGradient id="slabTopGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a2744" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  );
}
