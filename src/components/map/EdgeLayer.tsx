"use client";

import { StationEdge, StationNode } from "@/types/station";

interface EdgeLayerProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

const edgeColors: Record<StationEdge["type"], string> = {
  walkway: "#94a3b8",
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
            {/* Glow line for passages */}
            {isDashed && !isInterFloor && (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={8}
                strokeOpacity={0.1}
                strokeLinecap="round"
              />
            )}
            {/* Casing for walkways */}
            {isWalkway && !isInterFloor && (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2d3748"
                strokeWidth={5}
                strokeOpacity={0.6}
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
              strokeWidth={isWalkway ? 2 : isInterFloor ? 1.5 : 2}
              strokeOpacity={isInterFloor ? 0.5 : 0.7}
              strokeDasharray={isDashed ? "8 5" : undefined}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}
