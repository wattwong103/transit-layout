"use client";

import { useMemo } from "react";
import { StationNode, StationEdge } from "@/types/station";
import { toIsometric, getElevation } from "@/lib/isometric";

interface IsometricVerticalConnectorsProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

const connectorColors: Record<string, string> = {
  escalator: "#3b82f6",
  stairs: "#60a5fa",
  elevator: "#a78bfa",
};

export default function IsometricVerticalConnectors({
  edges,
  nodesById,
}: IsometricVerticalConnectorsProps) {
  const interFloorEdges = useMemo(
    () => edges.filter((e) => e.floorsConnected !== undefined),
    [edges]
  );

  return (
    <g className="vertical-connectors" pointerEvents="none">
      {interFloorEdges.map((edge) => {
        const fromNode = nodesById.get(edge.from);
        const toNode = nodesById.get(edge.to);
        if (!fromNode || !toNode) return null;

        const fromElev = getElevation(fromNode.floor);
        const toElev = getElevation(toNode.floor);
        const from = toIsometric(
          fromNode.position.x,
          fromNode.position.y,
          fromElev
        );
        const to = toIsometric(
          toNode.position.x,
          toNode.position.y,
          toElev
        );

        const color = connectorColors[edge.type] ?? "#475569";
        const isDashed = edge.type === "stairs";

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.4}
            strokeDasharray={isDashed ? "3 2" : undefined}
          />
        );
      })}
    </g>
  );
}
