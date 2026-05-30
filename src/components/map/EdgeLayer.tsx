"use client";

import { StationEdge, StationNode } from "@/types/station";

interface EdgeLayerProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

const edgeColors: Record<StationEdge["type"], string> = {
  walkway: "#475569",
  escalator: "#3b82f6",
  stairs: "#60a5fa",
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

        const fromOnFloor = fromNode.floor === currentFloor;
        const toOnFloor = toNode.floor === currentFloor;
        if (!fromOnFloor && !toOnFloor) return null;

        const x1 = fromOnFloor ? fromNode.position.x : toNode.position.x;
        const y1 = fromOnFloor ? fromNode.position.y : toNode.position.y;
        const x2 = toOnFloor ? toNode.position.x : fromNode.position.x;
        const y2 = toOnFloor ? toNode.position.y : fromNode.position.y;

        const color = edgeColors[edge.type];
        const isDashed = edge.type === "passage";
        const isInterFloor = edge.floorsConnected !== undefined;
        const isWalkway = edge.type === "walkway";

        return (
          <g key={edge.id}>
            {/* Casing (wider light stroke for walkways) */}
            {isWalkway && !isInterFloor && (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1e293b"
                strokeWidth={4}
                strokeOpacity={0.5}
                strokeLinecap="round"
              />
            )}
            {/* Core line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={isWalkway ? 2 : isInterFloor ? 1 : 1.5}
              strokeOpacity={isInterFloor ? 0.3 : 0.6}
              strokeDasharray={isDashed ? "6 4" : undefined}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}
