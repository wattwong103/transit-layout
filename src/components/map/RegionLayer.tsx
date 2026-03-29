"use client";

import { FloorRegion } from "@/types/station";
import { getLineColor } from "@/data/lines";

interface RegionLayerProps {
  regions: FloorRegion[];
}

const regionColors: Record<FloorRegion["type"], string> = {
  platform_area: "#2a4a6b",
  concourse: "#1e3a5f",
  commercial: "#3d2b5a",
  outside: "#0f1b2d",
};

export default function RegionLayer({ regions }: RegionLayerProps) {
  return (
    <g className="region-layer">
      {regions.map((region) => {
        const fillColor = region.railwayLine
          ? getLineColor(region.railwayLine)
          : regionColors[region.type];
        const fillOpacity = region.railwayLine ? 0.25 : 0.4;

        return (
          <g key={region.id}>
            <path
              d={region.svgPath}
              fill={fillColor}
              fillOpacity={fillOpacity}
              stroke={region.railwayLine ? getLineColor(region.railwayLine) : "#334155"}
              strokeWidth={region.railwayLine ? 2 : 1}
              strokeOpacity={0.6}
            />
            <text
              x={getPathCenter(region.svgPath).x}
              y={getPathCenter(region.svgPath).y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#94a3b8"
              fontSize={12}
              fontFamily="system-ui, sans-serif"
              pointerEvents="none"
            >
              {region.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Rough center of an SVG path by averaging the M and L coordinates */
function getPathCenter(svgPath: string): { x: number; y: number } {
  const coords: { x: number; y: number }[] = [];
  const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = regex.exec(svgPath)) !== null) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }
  if (coords.length === 0) return { x: 0, y: 0 };
  const sumX = coords.reduce((s, c) => s + c.x, 0);
  const sumY = coords.reduce((s, c) => s + c.y, 0);
  return { x: sumX / coords.length, y: sumY / coords.length };
}
