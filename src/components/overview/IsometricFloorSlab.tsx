"use client";

import { useMemo } from "react";
import { FloorPlan, StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";
import {
  getSlabBox,
  getElevation,
  transformSvgPath,
  toIsometric,
  shadeFace,
  getPathBounds,
  SLAB_THICKNESS,
  FLOOR_SPACING,
} from "@/lib/isometric";
import { PATTERN_PLATFORM_HATCH } from "@/components/svg/MapDefs";

interface IsometricFloorSlabProps {
  floorPlan: FloorPlan;
  nodes: StationNode[];
  isHighlighted: boolean;
  isOnRoute: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

const SLAB_BASE = "#141e30";

export default function IsometricFloorSlab({
  floorPlan,
  nodes,
  isHighlighted,
  isOnRoute,
  onClick,
  onHover,
}: IsometricFloorSlabProps) {
  const elevation = getElevation(floorPlan.floor);

  const slab = useMemo(() => getSlabBox(elevation), [elevation]);

  const isoRegions = useMemo(
    () =>
      floorPlan.regions.map((region) => ({
        ...region,
        isoPath: transformSvgPath(region.svgPath, elevation),
        bounds: getPathBounds(region.svgPath),
      })),
    [floorPlan.regions, elevation]
  );

  const labelPos = useMemo(
    () => toIsometric(-80, 300, elevation),
    [elevation]
  );

  const visibleNodes = useMemo(
    () =>
      nodes.filter(
        (n) =>
          n.type === "platform" ||
          n.type === "exit" ||
          n.type === "ticket_gate"
      ),
    [nodes]
  );

  const strokeColor = isOnRoute
    ? "#3b82f6"
    : isHighlighted
    ? "#60a5fa"
    : "#2a3a55";
  const strokeW = isHighlighted || isOnRoute ? 1.8 : 0.8;

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Side faces (front and right of the extruded slab) */}
      <path
        d={slab.frontPath}
        fill={shadeFace(SLAB_BASE, "front")}
        fillOpacity={isHighlighted ? 0.95 : 0.85}
        stroke={strokeColor}
        strokeWidth={strokeW * 0.6}
        strokeOpacity={0.5}
      />
      <path
        d={slab.rightPath}
        fill={shadeFace(SLAB_BASE, "side")}
        fillOpacity={isHighlighted ? 0.95 : 0.85}
        stroke={strokeColor}
        strokeWidth={strokeW * 0.6}
        strokeOpacity={0.5}
      />

      {/* Top face */}
      <path
        d={slab.topPath}
        fill={isHighlighted ? "#1a2744" : "#0d1117"}
        fillOpacity={isHighlighted ? 0.95 : 0.85}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeOpacity={0.8}
      />

      {/* Regions on top face */}
      {isoRegions.map((region) => {
        const isRailway = !!region.railwayLine;
        const lineColor = isRailway
          ? getLineColor(region.railwayLine!)
          : undefined;
        const isTrackBed = region.type === "track_bed";
        const fillColor = isTrackBed ? "#111827" : lineColor ?? "#21262d";
        const fillOp = isTrackBed
          ? 0.6
          : isRailway
          ? isHighlighted
            ? 0.5
            : 0.35
          : isHighlighted
          ? 0.65
          : 0.5;

        return (
          <g key={region.id} pointerEvents="none">
            <path
              d={region.isoPath}
              fill={fillColor}
              fillOpacity={fillOp}
              stroke={lineColor ?? "#334155"}
              strokeWidth={isTrackBed ? 0.3 : isRailway ? 1.5 : 0.6}
              strokeOpacity={0.6}
            />
            {/* Hatch overlay for platforms */}
            {isRailway && !isTrackBed && (
              <path
                d={region.isoPath}
                fill={`url(#${PATTERN_PLATFORM_HATCH})`}
                fillOpacity={0.5}
                stroke="none"
              />
            )}
          </g>
        );
      })}

      {/* Colored line bars along platform regions */}
      {isoRegions
        .filter((r) => r.railwayLine && r.type !== "track_bed")
        .map((region) => {
          const color = getLineColor(region.railwayLine!);
          const { minX, maxX, minY, maxY, cy } = region.bounds;
          const isHorizontal = maxX - minX > maxY - minY;

          let barStart: { x: number; y: number };
          let barEnd: { x: number; y: number };

          if (isHorizontal) {
            barStart = toIsometric(minX + 20, cy, elevation);
            barEnd = toIsometric(maxX - 20, cy, elevation);
          } else {
            barStart = toIsometric((minX + maxX) / 2, minY + 20, elevation);
            barEnd = toIsometric((minX + maxX) / 2, maxY - 20, elevation);
          }

          return (
            <line
              key={`bar_${region.id}`}
              x1={barStart.x}
              y1={barStart.y}
              x2={barEnd.x}
              y2={barEnd.y}
              stroke={color}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={isHighlighted ? 0.9 : 0.75}
              pointerEvents="none"
            />
          );
        })}

      {/* Node markers */}
      {visibleNodes.map((node) => {
        const pos = toIsometric(node.position.x, node.position.y, elevation);
        const color = node.railwayLine
          ? getLineColor(node.railwayLine)
          : node.type === "exit"
          ? "#22c55e"
          : "#eab308";

        if (node.type === "exit") {
          return (
            <g key={node.id} pointerEvents="none">
              {/* Yellow exit badge */}
              <rect
                x={pos.x - 20}
                y={pos.y - 9}
                width={40}
                height={18}
                rx={9}
                fill="#FFD700"
                stroke="#0d1117"
                strokeWidth={1}
                opacity={0.95}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                fontSize={10}
                fontWeight="bold"
                fill="#0f172a"
                fontFamily="system-ui, sans-serif"
                textAnchor="middle"
                pointerEvents="none"
              >
                {node.exitCode || node.exitName || node.label}
              </text>
            </g>
          );
        }

        if (node.type === "ticket_gate") {
          return (
            <g key={node.id} pointerEvents="none">
              <rect
                x={pos.x - 3}
                y={pos.y - 3}
                width={6}
                height={6}
                rx={1}
                fill="#eab308"
                stroke="#0f172a"
                strokeWidth={0.6}
                opacity={0.8}
              />
            </g>
          );
        }

        return (
          <g key={node.id} pointerEvents="none">
            <circle
              cx={pos.x}
              cy={pos.y}
              r={3.5}
              fill={color}
              stroke="#0f172a"
              strokeWidth={0.8}
              opacity={0.9}
            />
            <text
              x={pos.x + 6}
              y={pos.y + 3}
              fontSize={7}
              fill={color}
              fontFamily="system-ui, sans-serif"
              fontWeight="bold"
              pointerEvents="none"
              opacity={0.85}
            >
              {getShortLineName(node.label)}
            </text>
          </g>
        );
      })}

      {/* Big floor tag in left margin */}
      <g pointerEvents="none">
        <rect
          x={labelPos.x - 30}
          y={labelPos.y - 12}
          width={56}
          height={24}
          rx={6}
          fill={isOnRoute ? "#1e40af" : isHighlighted ? "#1e3a5f" : "#0f172a"}
          fillOpacity={0.9}
          stroke={isOnRoute ? "#3b82f6" : isHighlighted ? "#60a5fa" : "#334155"}
          strokeWidth={isOnRoute || isHighlighted ? 1.2 : 0.6}
        />
        <text
          x={labelPos.x - 3}
          y={labelPos.y + 4.5}
          fontSize={16}
          fontWeight="bold"
          fill={isOnRoute ? "#93c5fd" : isHighlighted ? "#fff" : "#94a3b8"}
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          pointerEvents="none"
        >
          {floorPlan.floor}
        </text>
      </g>
    </g>
  );
}

function getShortLineName(label: string): string {
  if (label.includes("Yamanote")) return "Yamanote";
  if (label.includes("Saikyo")) return "Saikyo";
  if (label.includes("Ginza")) return "Ginza";
  if (label.includes("Hanzomon")) return "Hanzomon";
  if (label.includes("Den-en")) return "Den-en-toshi";
  if (label.includes("Fukutoshin")) return "Fukutoshin";
  if (label.includes("Toyoko")) return "Toyoko";
  if (label.includes("Inokashira")) return "Inokashira";
  return label;
}
