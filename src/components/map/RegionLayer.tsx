"use client";

import { FloorRegion } from "@/types/station";
import { getLineColor } from "@/data/lines";
import {
  FILTER_INNER_SHADOW,
  PATTERN_PLATFORM_HATCH,
} from "@/components/svg/MapDefs";

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
        const isRailway = !!region.railwayLine;
        const lineColor = isRailway ? getLineColor(region.railwayLine!) : undefined;
        const fillColor = lineColor ?? regionColors[region.type];
        const fillOpacity = isRailway ? 0.2 : 0.35;
        const center = getPathCenter(region.svgPath);
        const bounds = getPathBounds(region.svgPath);

        return (
          <g key={region.id}>
            {/* Region fill with inner shadow */}
            <path
              d={region.svgPath}
              fill={isRailway ? `url(#lineGrad_${region.railwayLine})` : fillColor}
              fillOpacity={fillOpacity}
              stroke={lineColor ?? "#334155"}
              strokeWidth={isRailway ? 2 : 1}
              strokeOpacity={0.6}
              filter={`url(#${FILTER_INNER_SHADOW})`}
            />

            {/* Hatch overlay for platforms */}
            {isRailway && (
              <path
                d={region.svgPath}
                fill={`url(#${PATTERN_PLATFORM_HATCH})`}
                fillOpacity={0.6}
                stroke="none"
                pointerEvents="none"
              />
            )}

            {/* Colored platform bar */}
            {isRailway && lineColor && (
              <PlatformBar bounds={bounds} color={lineColor} />
            )}

            {/* Region label */}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isRailway ? lineColor : "#94a3b8"}
              fontSize={isRailway ? 11 : 12}
              fontWeight={isRailway ? "bold" : "normal"}
              fontFamily="system-ui, sans-serif"
              pointerEvents="none"
              opacity={0.85}
            >
              {region.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PlatformBar({
  bounds,
  color,
}: {
  bounds: { minX: number; maxX: number; minY: number; maxY: number; cx: number; cy: number };
  color: string;
}) {
  const isHorizontal = bounds.maxX - bounds.minX > bounds.maxY - bounds.minY;
  if (isHorizontal) {
    return (
      <line
        x1={bounds.minX + 15}
        y1={bounds.cy}
        x2={bounds.maxX - 15}
        y2={bounds.cy}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.5}
        pointerEvents="none"
      />
    );
  }
  return (
    <line
      x1={bounds.cx}
      y1={bounds.minY + 15}
      x2={bounds.cx}
      y2={bounds.maxY - 15}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.5}
      pointerEvents="none"
    />
  );
}

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

function getPathBounds(svgPath: string) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = regex.exec(svgPath)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
