"use client";

import { railwayLines } from "@/data/lines";
import { shadeFace } from "@/lib/isometric";

export const FILTER_SOFT_SHADOW = "softShadow";
export const FILTER_INNER_SHADOW = "innerShadow";
export const PATTERN_PLATFORM_HATCH = "platformHatch";
export const PATTERN_STAIRS_HATCH = "stairsHatch";

export default function MapDefs() {
  return (
    <defs>
      {/* Soft drop shadow for badges/slabs */}
      <filter id={FILTER_SOFT_SHADOW} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
      </filter>

      {/* Inner shadow for regions */}
      <filter id={FILTER_INNER_SHADOW} x="-10%" y="-10%" width="120%" height="120%">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="4" />
        <feOffset dx="1" dy="2" result="offsetblur" />
        <feFlood floodColor="#000" floodOpacity="0.4" result="color" />
        <feComposite in2="offsetblur" operator="in" />
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>

      {/* Platform diagonal hatch */}
      <pattern
        id={PATTERN_PLATFORM_HATCH}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.12" />
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

      {/* Concourse gradient */}
      <linearGradient id="concourseFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0f2440" />
      </linearGradient>

      {/* Slab top gradient */}
      <linearGradient id="slabTopGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a2744" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  );
}
