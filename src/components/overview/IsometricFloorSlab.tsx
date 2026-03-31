"use client";

import { useMemo } from "react";
import { FloorPlan, FloorId, StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";
import {
  getFloorSlabPath,
  getElevation,
  transformSvgPath,
  toIsometric,
} from "@/lib/isometric";

interface IsometricFloorSlabProps {
  floorPlan: FloorPlan;
  nodes: StationNode[];
  isHighlighted: boolean;
  isOnRoute: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

const regionBaseColors: Record<string, string> = {
  platform_area: "#2a4a6b",
  concourse: "#1e3a5f",
  commercial: "#3d2b5a",
  outside: "#0f1b2d",
};

export default function IsometricFloorSlab({
  floorPlan,
  nodes,
  isHighlighted,
  isOnRoute,
  onClick,
  onHover,
}: IsometricFloorSlabProps) {
  const elevation = getElevation(floorPlan.floor);

  // Transform region paths to isometric
  const isoRegions = useMemo(
    () =>
      floorPlan.regions.map((region) => ({
        ...region,
        isoPath: transformSvgPath(region.svgPath, elevation),
      })),
    [floorPlan.regions, elevation]
  );

  // Floor slab outline
  const slabPath = useMemo(() => getFloorSlabPath(elevation), [elevation]);

  // Label position (left edge of slab)
  const labelPos = useMemo(
    () => toIsometric(-40, 300, elevation),
    [elevation]
  );

  // Key nodes to show (platforms, exits, ticket gates only)
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

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Floor slab base */}
      <path
        d={slabPath}
        fill={isHighlighted ? "#1e3a5f" : "#0f172a"}
        fillOpacity={isHighlighted ? 0.85 : 0.7}
        stroke={isOnRoute ? "#3b82f6" : isHighlighted ? "#60a5fa" : "#334155"}
        strokeWidth={isHighlighted || isOnRoute ? 2 : 1}
        strokeOpacity={0.8}
      />

      {/* Regions */}
      {isoRegions.map((region) => {
        const fillColor = region.railwayLine
          ? getLineColor(region.railwayLine)
          : regionBaseColors[region.type] ?? "#1e3a5f";
        const fillOpacity = region.railwayLine ? 0.35 : 0.5;

        return (
          <path
            key={region.id}
            d={region.isoPath}
            fill={fillColor}
            fillOpacity={isHighlighted ? fillOpacity + 0.15 : fillOpacity}
            stroke={
              region.railwayLine ? getLineColor(region.railwayLine) : "#334155"
            }
            strokeWidth={region.railwayLine ? 1.5 : 0.5}
            strokeOpacity={0.6}
            pointerEvents="none"
          />
        );
      })}

      {/* Key node markers */}
      {visibleNodes.map((node) => {
        const pos = toIsometric(node.position.x, node.position.y, elevation);
        const color = node.railwayLine
          ? getLineColor(node.railwayLine)
          : node.type === "exit"
          ? "#22c55e"
          : "#eab308";
        const r = node.type === "platform" ? 4 : 3;

        return (
          <g key={node.id} pointerEvents="none">
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill={color}
              stroke="#0f172a"
              strokeWidth={1}
              opacity={0.9}
            />
            {/* Label for exits */}
            {node.type === "exit" && (
              <text
                x={pos.x + 6}
                y={pos.y + 3}
                fontSize={7}
                fill="#e2e8f0"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
              >
                {node.exitName || node.label}
              </text>
            )}
            {/* Abbreviated label for platforms */}
            {node.type === "platform" && (
              <text
                x={pos.x + 6}
                y={pos.y + 3}
                fontSize={6}
                fill={color}
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
                opacity={0.8}
              >
                {getShortLineName(node.label)}
              </text>
            )}
          </g>
        );
      })}

      {/* Floor label */}
      <text
        x={labelPos.x}
        y={labelPos.y}
        fontSize={12}
        fontWeight="bold"
        fill={isHighlighted ? "#fff" : "#94a3b8"}
        fontFamily="system-ui, sans-serif"
        textAnchor="end"
        dominantBaseline="central"
        pointerEvents="none"
      >
        {floorPlan.floor}
      </text>
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
