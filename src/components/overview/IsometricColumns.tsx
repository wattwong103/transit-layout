"use client";

import { useMemo } from "react";
import { StationEdge, StationNode } from "@/types/station";
import { getColumnBox, getElevation, shadeFace } from "@/lib/isometric";

interface IsometricColumnsProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

const DECORATIVE_COLUMNS: { x: number; y: number }[] = [
  { x: 300, y: 200 },
  { x: 500, y: 150 },
  { x: 700, y: 150 },
  { x: 900, y: 200 },
  { x: 400, y: 400 },
  { x: 600, y: 450 },
  { x: 800, y: 400 },
];

const COLUMN_COLOR = "#2a3a55";

export default function IsometricColumns({
  edges,
  nodesById,
}: IsometricColumnsProps) {
  const elevatorShafts = useMemo(() => {
    return edges
      .filter((e) => e.type === "elevator" && e.floorsConnected)
      .map((edge) => {
        const from = nodesById.get(edge.from);
        const to = nodesById.get(edge.to);
        if (!from || !to) return null;

        const fromElev = getElevation(from.floor);
        const toElev = getElevation(to.floor);
        const topElev = Math.max(fromElev, toElev);
        const botElev = Math.min(fromElev, toElev);
        const node = fromElev > toElev ? from : to;

        return {
          id: edge.id,
          x: node.position.x,
          y: node.position.y,
          topElev,
          botElev,
        };
      })
      .filter(Boolean) as {
      id: string;
      x: number;
      y: number;
      topElev: number;
      botElev: number;
    }[];
  }, [edges, nodesById]);

  const decorativeBoxes = useMemo(
    () =>
      DECORATIVE_COLUMNS.map((col, i) => ({
        id: `deco_${i}`,
        box: getColumnBox(col.x, col.y, 3, -5, 6),
      })),
    []
  );

  const elevatorBoxes = useMemo(
    () =>
      elevatorShafts.map((shaft) => ({
        id: shaft.id,
        box: getColumnBox(shaft.x, shaft.y, shaft.topElev, shaft.botElev, 10),
      })),
    [elevatorShafts]
  );

  return (
    <g className="columns" pointerEvents="none" opacity={0.65}>
      {/* Decorative structural columns */}
      {decorativeBoxes.map((col) => (
        <g key={col.id}>
          <path
            d={col.box.frontPath}
            fill={shadeFace(COLUMN_COLOR, "front")}
            stroke="#1a2744"
            strokeWidth={0.3}
          />
          <path
            d={col.box.sidePath}
            fill={shadeFace(COLUMN_COLOR, "side")}
            stroke="#1a2744"
            strokeWidth={0.3}
          />
        </g>
      ))}

      {/* Elevator shafts */}
      {elevatorBoxes.map((col) => (
        <g key={col.id}>
          <path
            d={col.box.frontPath}
            fill={shadeFace("#6b4fad", "front")}
            fillOpacity={0.5}
            stroke="#8b5cf6"
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
          <path
            d={col.box.sidePath}
            fill={shadeFace("#6b4fad", "side")}
            fillOpacity={0.5}
            stroke="#8b5cf6"
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
        </g>
      ))}
    </g>
  );
}
