"use client";

import { FloorRegion } from "@/types/station";
import { getLineColor } from "@/data/lines";
import {
  FILTER_REGION_SHADOW,
  PATTERN_PLATFORM_HATCH,
  PATTERN_TRACK_TIES,
  PATTERN_FLOOR_TILE,
} from "@/components/svg/MapDefs";

interface RegionLayerProps {
  regions: FloorRegion[];
}

const regionColors: Record<FloorRegion["type"], string> = {
  platform_area: "#2a4a6b",
  concourse: "#21262d",
  commercial: "#2d1f3d",
  outside: "#0d1117",
  track_bed: "#111827",
};

export default function RegionLayer({ regions }: RegionLayerProps) {
  return (
    <g className="region-layer">
      {regions.map((region) => {
        const isRailway = !!region.railwayLine;
        const isTrackBed = region.type === "track_bed";
        const lineColor = isRailway ? getLineColor(region.railwayLine!) : undefined;
        const fillColor = lineColor ?? regionColors[region.type];
        const fillOpacity = isTrackBed ? 0.7 : isRailway ? 0.35 : 0.55;
        const center = getPathCenter(region.svgPath);
        const bounds = getPathBounds(region.svgPath);

        const useGradientFill =
          !isRailway && !isTrackBed && region.type === "concourse"
            ? "url(#concourseFill)"
            : !isRailway && region.type === "commercial"
            ? "url(#commercialFill)"
            : undefined;

        const useShadow = !isTrackBed && region.type !== "outside";

        return (
          <g key={region.id}>
            {/* Main region fill */}
            <path
              d={region.svgPath}
              fill={
                isRailway
                  ? `url(#lineGrad_${region.railwayLine})`
                  : useGradientFill ?? fillColor
              }
              fillOpacity={fillOpacity}
              stroke={
                isTrackBed
                  ? "#1e293b"
                  : lineColor ?? "#4a5568"
              }
              strokeWidth={
                isTrackBed
                  ? 0.5
                  : isRailway
                  ? 2
                  : region.type === "concourse"
                  ? 2.5
                  : 1
              }
              strokeOpacity={isTrackBed ? 0.3 : 0.7}
              strokeLinejoin="round"
              filter={useShadow ? `url(#${FILTER_REGION_SHADOW})` : undefined}
            />

            {/* Concourse floor tile texture */}
            {region.type === "concourse" && !isTrackBed && (
              <path
                d={region.svgPath}
                fill={`url(#${PATTERN_FLOOR_TILE})`}
                fillOpacity={0.5}
                stroke="none"
                pointerEvents="none"
              />
            )}

            {/* Hatch overlay for platforms */}
            {isRailway && !isTrackBed && (
              <path
                d={region.svgPath}
                fill={`url(#${PATTERN_PLATFORM_HATCH})`}
                fillOpacity={0.6}
                stroke="none"
                pointerEvents="none"
              />
            )}

            {/* Track tie pattern for track beds */}
            {isTrackBed && (
              <path
                d={region.svgPath}
                fill={`url(#${PATTERN_TRACK_TIES})`}
                fillOpacity={0.8}
                stroke="none"
                pointerEvents="none"
              />
            )}

            {/* Platform edge safety lines (yellow) */}
            {isRailway && !isTrackBed && (
              <PlatformEdgeLines bounds={bounds} />
            )}

            {/* Colored platform bar */}
            {isRailway && !isTrackBed && lineColor && (
              <PlatformBar bounds={bounds} color={lineColor} />
            )}

            {/* Region label with badge background */}
            {region.label && (
              <RegionLabel
                label={region.label}
                x={center.x}
                y={center.y}
                color={isRailway ? lineColor! : "#cbd5e1"}
                isBold={isRailway}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

function PlatformEdgeLines({
  bounds,
}: {
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}) {
  const isHorizontal = bounds.maxX - bounds.minX > bounds.maxY - bounds.minY;
  if (isHorizontal) {
    return (
      <g pointerEvents="none">
        <line
          x1={bounds.minX + 10}
          y1={bounds.minY + 2}
          x2={bounds.maxX - 10}
          y2={bounds.minY + 2}
          stroke="#FFD700"
          strokeWidth={2}
          strokeOpacity={0.7}
          strokeLinecap="round"
        />
        <line
          x1={bounds.minX + 10}
          y1={bounds.maxY - 2}
          x2={bounds.maxX - 10}
          y2={bounds.maxY - 2}
          stroke="#FFD700"
          strokeWidth={2}
          strokeOpacity={0.7}
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <g pointerEvents="none">
      <line
        x1={bounds.minX + 2}
        y1={bounds.minY + 10}
        x2={bounds.minX + 2}
        y2={bounds.maxY - 10}
        stroke="#FFD700"
        strokeWidth={2}
        strokeOpacity={0.7}
        strokeLinecap="round"
      />
      <line
        x1={bounds.maxX - 2}
        y1={bounds.minY + 10}
        x2={bounds.maxX - 2}
        y2={bounds.maxY - 10}
        stroke="#FFD700"
        strokeWidth={2}
        strokeOpacity={0.7}
        strokeLinecap="round"
      />
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
      <g pointerEvents="none">
        <line
          x1={bounds.minX + 20}
          y1={bounds.cy}
          x2={bounds.maxX - 20}
          y2={bounds.cy}
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.15}
        />
        <line
          x1={bounds.minX + 20}
          y1={bounds.cy}
          x2={bounds.maxX - 20}
          y2={bounds.cy}
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.7}
        />
      </g>
    );
  }
  return (
    <g pointerEvents="none">
      <line
        x1={bounds.cx}
        y1={bounds.minY + 20}
        x2={bounds.cx}
        y2={bounds.maxY - 20}
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.15}
      />
      <line
        x1={bounds.cx}
        y1={bounds.minY + 20}
        x2={bounds.cx}
        y2={bounds.maxY - 20}
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={0.7}
      />
    </g>
  );
}

function RegionLabel({
  label,
  x,
  y,
  color,
  isBold,
}: {
  label: string;
  x: number;
  y: number;
  color: string;
  isBold: boolean;
}) {
  const fontSize = isBold ? 11 : 10;
  const estWidth = label.length * 5.5 + 12;
  return (
    <g pointerEvents="none">
      <rect
        x={x - estWidth / 2}
        y={y - 9}
        width={estWidth}
        height={18}
        rx={9}
        fill="#0d1117"
        fillOpacity={0.75}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontWeight={isBold ? "700" : "600"}
        fontFamily="system-ui, sans-serif"
        opacity={0.9}
      >
        {label}
      </text>
    </g>
  );
}

function getPathCenter(svgPath: string): { x: number; y: number } {
  const coords: { x: number; y: number }[] = [];
  const mlRegex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = mlRegex.exec(svgPath)) !== null) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }
  const qRegex = /Q\s*[\d.]+[,\s]+[\d.]+[,\s]+([\d.]+)[,\s]+([\d.]+)/gi;
  while ((match = qRegex.exec(svgPath)) !== null) {
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
  const mlRegex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = mlRegex.exec(svgPath)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const qRegex = /Q\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/gi;
  while ((match = qRegex.exec(svgPath)) !== null) {
    for (let i = 1; i <= 3; i += 2) {
      const x = parseFloat(match[i]);
      const y = parseFloat(match[i + 1]);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
