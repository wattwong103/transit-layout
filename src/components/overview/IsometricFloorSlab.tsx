"use client";

import { useMemo } from "react";
import { FloorId, FloorPlan, StationNode } from "@/types/station";
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

interface IsometricFloorSlabProps {
  floorPlan: FloorPlan;
  nodes: StationNode[];
  isHighlighted: boolean;
  isCurrent: boolean;
  isOnRoute: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

const CONCOURSE = "#efe4c8";
const COMMERCIAL = "#ead8b4";
const TRACK = "#d4cbb8";
const DROP_COPIES = 5;

export default function IsometricFloorSlab({
  floorPlan,
  nodes,
  isHighlighted,
  isCurrent,
  isOnRoute,
  onClick,
  onHover,
}: IsometricFloorSlabProps) {
  const elevation = getElevation(floorPlan.floor);
  const drop = SLAB_THICKNESS * FLOOR_SPACING;

  const slab = useMemo(() => getSlabBox(elevation), [elevation]);

  const isoRegions = useMemo(
    () =>
      floorPlan.regions
        .filter((region) => region.type !== "outside")
        .map((region) => ({
          ...region,
          isoPath: transformSvgPath(region.svgPath, elevation),
          bounds: getPathBounds(region.svgPath),
        })),
    [floorPlan.regions, elevation]
  );

  const labelPos = useMemo(() => {
    const mid = toIsometric(200, 300, elevation);
    let minX = Infinity;
    for (const r of isoRegions) {
      const a = toIsometric(r.bounds.minX, r.bounds.minY, elevation);
      const b = toIsometric(r.bounds.minX, r.bounds.maxY, elevation);
      minX = Math.min(minX, a.x, b.x);
    }
    if (!Number.isFinite(minX)) return toIsometric(-160, 300, elevation);
    return { x: minX - 16, y: mid.y };
  }, [isoRegions, elevation]);

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

  const outline = isCurrent
    ? "#1d4ed8"
    : isOnRoute
    ? "#3b82f6"
    : isHighlighted
    ? "#2563eb"
    : "#b7aa90";
  const outlineW = isCurrent ? 2.4 : isHighlighted || isOnRoute ? 1.6 : 0.7;

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Invisible full plate for a generous hit target */}
      <path d={slab.topPath} fill="transparent" />

      {/* Extruded region plates — the floor *shape*, not a shared rectangle */}
      {isoRegions.map((region) => {
        const fill = regionFill(region);
        const side = shadeFace(fill, "side");
        return (
          <g key={`ex_${region.id}`} pointerEvents="none">
            {Array.from({ length: DROP_COPIES }).map((_, i) => (
              <path
                key={i}
                d={region.isoPath}
                transform={`translate(0 ${(drop * (DROP_COPIES - i)) / DROP_COPIES})`}
                fill={side}
                stroke={side}
                strokeWidth={0.4}
              />
            ))}
          </g>
        );
      })}

      {isoRegions.map((region) => {
        const isRailway = !!region.railwayLine;
        const isTrackBed = region.type === "track_bed";
        const fill = regionFill(region);
        const top = isHighlighted ? shadeFace(fill, "top") : fill;

        return (
          <path
            key={region.id}
            d={region.isoPath}
            fill={top}
            stroke={isRailway && !isTrackBed ? getLineColor(region.railwayLine!) : outline}
            strokeWidth={isRailway && !isTrackBed ? 1.4 : outlineW}
            strokeLinejoin="round"
            pointerEvents="none"
          />
        );
      })}

      {visibleNodes.map((node) => {
        const pos = toIsometric(node.position.x, node.position.y, elevation);

        if (node.type === "exit") {
          const text = node.exitCode || node.exitName || node.label;
          const w = Math.max(36, text.length * 6.4 + 12);
          return (
            <g key={node.id} pointerEvents="none">
              <rect
                x={pos.x - w / 2}
                y={pos.y - 8}
                width={w}
                height={16}
                rx={2}
                fill="#f5c518"
                stroke="#5c4a10"
                strokeWidth={0.6}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                fontSize={9}
                fontWeight="bold"
                fill="#1a1408"
                fontFamily="system-ui, sans-serif"
                textAnchor="middle"
              >
                {text}
              </text>
            </g>
          );
        }

        if (node.type === "ticket_gate") {
          return (
            <g key={node.id} pointerEvents="none">
              <rect
                x={pos.x - 5}
                y={pos.y - 3}
                width={10}
                height={6}
                rx={0.5}
                fill="#c4782a"
                stroke="#7a4a14"
                strokeWidth={0.5}
              />
            </g>
          );
        }

        const color = node.railwayLine
          ? getLineColor(node.railwayLine)
          : "#334155";
        const name = getShortLineName(node.label);
        return (
          <g key={node.id} pointerEvents="none">
            <text
              x={pos.x}
              y={pos.y + 3}
              fontSize={8}
              fontWeight="bold"
              fill={color}
              stroke="#f4f1ea"
              strokeWidth={3}
              paintOrder="stroke"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Floor tag, Metro-style: B1F / 3F sitting beside the plate */}
      <g pointerEvents="none">
        <text
          x={labelPos.x}
          y={labelPos.y}
          fontSize={20}
          fontWeight="800"
          fill={isCurrent || isOnRoute || isHighlighted ? "#1d4ed8" : "#3d4a5c"}
          fontFamily="system-ui, sans-serif"
          textAnchor="end"
          stroke="#f4f1ea"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {floorTag(floorPlan.floor)}
        </text>
      </g>
    </g>
  );
}

function regionFill(region: {
  type: string;
  railwayLine?: string;
}): string {
  if (region.railwayLine) {
    if (region.type === "track_bed") return TRACK;
    return getLineColor(region.railwayLine);
  }
  if (region.type === "commercial") return COMMERCIAL;
  return CONCOURSE;
}

function floorTag(floor: FloorId): string {
  return floor.startsWith("B") ? `${floor}F` : floor;
}

function getShortLineName(label: string): string {
  if (label.includes("Yamanote")) return "Yamanote";
  if (label.includes("Saikyo")) return "Saikyo";
  if (label.includes("Ginza")) return "Ginza Line";
  if (label.includes("Hanzomon")) return "Hanzomon Line";
  if (label.includes("Den-en")) return "Den-en-toshi";
  if (label.includes("Fukutoshin")) return "Fukutoshin Line";
  if (label.includes("Toyoko")) return "Toyoko Line";
  if (label.includes("Inokashira")) return "Inokashira";
  return label;
}
