"use client";

import { useMemo } from "react";
import { StationEdge, StationNode } from "@/types/station";
import { getColumnBox, getElevation, shadeFace } from "@/lib/isometric";

interface IsometricColumnsProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

const ELEVATOR_BLUE = "#4f8fd0";

export default function IsometricColumns({
  edges,
  nodesById,
}: IsometricColumnsProps) {
  const elevatorBoxes = useMemo(() => {
    return edges
      .filter((e) => e.type === "elevator" && e.floorsConnected)
      .map((edge) => {
        const from = nodesById.get(edge.from);
        const to = nodesById.get(edge.to);
        if (!from || !to) return null;

        const fromElev = getElevation(from.floor);
        const toElev = getElevation(to.floor);
        const node = fromElev > toElev ? from : to;

        return {
          id: edge.id,
          box: getColumnBox(
            node.position.x,
            node.position.y,
            Math.max(fromElev, toElev),
            Math.min(fromElev, toElev),
            7
          ),
        };
      })
      .filter(Boolean) as { id: string; box: ReturnType<typeof getColumnBox> }[];
  }, [edges, nodesById]);

  return (
    <g className="elevator-shafts" pointerEvents="none">
      {elevatorBoxes.map((col) => (
        <g key={col.id}>
          <path
            d={col.box.frontPath}
            fill={shadeFace(ELEVATOR_BLUE, "front")}
            stroke="#2d6aa3"
            strokeWidth={0.6}
          />
          <path
            d={col.box.sidePath}
            fill={shadeFace(ELEVATOR_BLUE, "side")}
            stroke="#2d6aa3"
            strokeWidth={0.6}
          />
        </g>
      ))}
    </g>
  );
}
