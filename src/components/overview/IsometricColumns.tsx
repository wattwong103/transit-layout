"use client";

import { useMemo } from "react";
import { StationEdge, StationNode } from "@/types/station";
import { shadeFace } from "@/lib/isometric";
import { projectElevatorEndpoints } from "@/lib/route-display";

interface IsometricColumnsProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

const ELEVATOR_BLUE = "#4f8fd0";

export default function IsometricColumns({
  edges,
  nodesById,
}: IsometricColumnsProps) {
  const elevators = useMemo(
    () =>
      edges
        .filter((edge) => edge.type === "elevator" && edge.floorsConnected)
        .map((edge) => {
          const from = nodesById.get(edge.from);
          const to = nodesById.get(edge.to);
          if (!from || !to) return null;
          return {
            id: edge.id,
            projection: projectElevatorEndpoints(from, to),
          };
        })
        .filter(Boolean) as {
        id: string;
        projection: ReturnType<typeof projectElevatorEndpoints>;
      }[],
    [edges, nodesById]
  );

  return (
    <g className="elevator-shafts" pointerEvents="none">
      {elevators.map(({ id, projection }) => {
        if (projection.kind === "aligned-shaft") {
          return (
            <g key={id}>
              <path
                d={projection.box.frontPath}
                fill={shadeFace(ELEVATOR_BLUE, "front")}
                stroke="#2d6aa3"
                strokeWidth={0.6}
              />
              <path
                d={projection.box.sidePath}
                fill={shadeFace(ELEVATOR_BLUE, "side")}
                stroke="#2d6aa3"
                strokeWidth={0.6}
              />
            </g>
          );
        }

        return (
          <g key={id} aria-label="Schematic elevator connection">
            <line
              x1={projection.from.x}
              y1={projection.from.y}
              x2={projection.to.x}
              y2={projection.to.y}
              stroke={ELEVATOR_BLUE}
              strokeWidth={4}
              strokeDasharray="7 5"
            />
            <circle
              cx={projection.from.x}
              cy={projection.from.y}
              r={5}
              fill={ELEVATOR_BLUE}
            />
            <circle
              cx={projection.to.x}
              cy={projection.to.y}
              r={5}
              fill={ELEVATOR_BLUE}
            />
          </g>
        );
      })}
    </g>
  );
}
