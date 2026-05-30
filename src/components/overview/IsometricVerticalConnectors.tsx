"use client";

import { useMemo } from "react";
import { StationNode, StationEdge } from "@/types/station";
import { toIsometric, getElevation } from "@/lib/isometric";

interface IsometricVerticalConnectorsProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

export default function IsometricVerticalConnectors({
  edges,
  nodesById,
}: IsometricVerticalConnectorsProps) {
  const longPassages = useMemo(
    () =>
      edges.filter(
        (e) =>
          e.floorsConnected !== undefined && e.type === "passage"
      ),
    [edges]
  );

  return (
    <g className="vertical-connectors" pointerEvents="none">
      {longPassages.map((edge) => {
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

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#eab308"
            strokeWidth={1}
            strokeOpacity={0.25}
            strokeDasharray="4 3"
          />
        );
      })}
    </g>
  );
}
