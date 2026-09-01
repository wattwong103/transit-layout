"use client";

import { useMemo } from "react";
import { StationNode, StationEdge } from "@/types/station";
import { getRampQuad, getElevation, toIsometric } from "@/lib/isometric";

interface IsometricEscalatorProps {
  edges: StationEdge[];
  nodesById: Map<string, StationNode>;
}

export default function IsometricEscalator({
  edges,
  nodesById,
}: IsometricEscalatorProps) {
  const ramps = useMemo(() => {
    return edges
      .filter(
        (e) =>
          e.floorsConnected &&
          (e.type === "escalator" || e.type === "stairs")
      )
      .map((edge) => {
        const from = nodesById.get(edge.from);
        const to = nodesById.get(edge.to);
        if (!from || !to) return null;

        const fromElev = getElevation(from.floor);
        const toElev = getElevation(to.floor);
        const isEscalator = edge.type === "escalator";

        const quad = getRampQuad(
          { x: from.position.x, y: from.position.y, elev: fromElev },
          { x: to.position.x, y: to.position.y, elev: toElev },
          isEscalator ? 8 : 7
        );
        if (!quad.path) return null;

        return {
          id: edge.id,
          quad,
          isEscalator,
          fromPt: toIsometric(from.position.x, from.position.y, fromElev),
          toPt: toIsometric(to.position.x, to.position.y, toElev),
        };
      })
      .filter(Boolean) as {
      id: string;
      quad: ReturnType<typeof getRampQuad>;
      isEscalator: boolean;
      fromPt: { x: number; y: number };
      toPt: { x: number; y: number };
    }[];
  }, [edges, nodesById]);

  return (
    <g className="escalator-ramps" pointerEvents="none">
      {ramps.map((ramp) => {
        // Official 立体図: stairs = terracotta, escalators = cool gray
        const fill = ramp.isEscalator ? "#8a97a6" : "#c4623a";
        const stroke = ramp.isEscalator ? "#5c6773" : "#8a3d22";
        const dx = ramp.toPt.x - ramp.fromPt.x;
        const dy = ramp.toPt.y - ramp.fromPt.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const stepCount = Math.max(3, ramp.quad.steps);

        return (
          <g key={ramp.id}>
            <path
              d={ramp.quad.path}
              fill={fill}
              fillOpacity={0.92}
              stroke={stroke}
              strokeWidth={0.8}
            />
            {Array.from({ length: stepCount }).map((_, i) => {
              const t = (i + 1) / (stepCount + 1);
              const sx = ramp.fromPt.x + dx * t;
              const sy = ramp.fromPt.y + dy * t;
              const nx = (-dy / len) * 6;
              const ny = (dx / len) * 6;
              return (
                <line
                  key={i}
                  x1={sx + nx}
                  y1={sy + ny}
                  x2={sx - nx}
                  y2={sy - ny}
                  stroke={stroke}
                  strokeWidth={0.7}
                  strokeOpacity={0.7}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
