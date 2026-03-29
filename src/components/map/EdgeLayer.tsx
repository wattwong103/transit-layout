"use client";

import { StationEdge, StationNode } from "@/types/station";

interface EdgeLayerProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

const edgeColors: Record<StationEdge["type"], string> = {
  walkway: "#334155",
  escalator: "#3b82f6",
  stairs: "#3b82f6",
  elevator: "#8b5cf6",
  passage: "#eab308",
};

export default function EdgeLayer({ edges, nodesById, currentFloor }: EdgeLayerProps) {
  return (
    <g className="edge-layer">
      {edges.map((edge) => {
        const fromNode = nodesById.get(edge.from);
        const toNode = nodesById.get(edge.to);
        if (!fromNode || !toNode) return null;

        // Only render edges where both nodes are on the current floor
        // or at least one node is on the current floor (for inter-floor connections)
        const fromOnFloor = fromNode.floor === currentFloor;
        const toOnFloor = toNode.floor === currentFloor;
        if (!fromOnFloor && !toOnFloor) return null;

        const color = edgeColors[edge.type];
        const isDashed = edge.type === "passage";
        const isInterFloor = edge.floorsConnected !== undefined;

        return (
          <line
            key={edge.id}
            x1={fromOnFloor ? fromNode.position.x : toNode.position.x}
            y1={fromOnFloor ? fromNode.position.y : toNode.position.y}
            x2={toOnFloor ? toNode.position.x : fromNode.position.x}
            y2={toOnFloor ? toNode.position.y : fromNode.position.y}
            stroke={color}
            strokeWidth={isInterFloor ? 1 : 1.5}
            strokeOpacity={isInterFloor ? 0.3 : 0.4}
            strokeDasharray={isDashed ? "4 3" : undefined}
          />
        );
      })}
    </g>
  );
}
