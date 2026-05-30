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

        const quad = getRampQuad(
          { x: from.position.x, y: from.position.y, elev: fromElev },
          { x: to.position.x, y: to.position.y, elev: toElev },
          edge.type === "escalator" ? 5 : 4
        );

        if (!quad.path) return null;

        const isEscalator = edge.type === "escalator";
        const midPt = toIsometric(
          (from.position.x + to.position.x) / 2,
          (from.position.y + to.position.y) / 2,
          (fromElev + toElev) / 2
        );

        return {
          id: edge.id,
          quad,
          isEscalator,
          midPt,
          fromPt: toIsometric(from.position.x, from.position.y, fromElev),
          toPt: toIsometric(to.position.x, to.position.y, toElev),
        };
      })
      .filter(Boolean) as {
      id: string;
      quad: ReturnType<typeof getRampQuad>;
      isEscalator: boolean;
      midPt: { x: number; y: number };
      fromPt: { x: number; y: number };
      toPt: { x: number; y: number };
    }[];
  }, [edges, nodesById]);

  return (
    <g className="escalator-ramps" pointerEvents="none">
      {ramps.map((ramp) => {
        const color = ramp.isEscalator ? "#3b82f6" : "#64748b";
        const dx = ramp.toPt.x - ramp.fromPt.x;
        const dy = ramp.toPt.y - ramp.fromPt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const stepCount = ramp.quad.steps;

        return (
          <g key={ramp.id}>
            {/* Ramp body */}
            <path
              d={ramp.quad.path}
              fill={color}
              fillOpacity={0.25}
              stroke={color}
              strokeWidth={0.8}
              strokeOpacity={0.6}
            />

            {/* Step hatch lines */}
            {Array.from({ length: stepCount }).map((_, i) => {
              const t = (i + 1) / (stepCount + 1);
              const sx = ramp.fromPt.x + dx * t;
              const sy = ramp.fromPt.y + dy * t;
              const nx = (-dy / len) * 4;
              const ny = (dx / len) * 4;
              return (
                <line
                  key={i}
                  x1={sx + nx}
                  y1={sy + ny}
                  x2={sx - nx}
                  y2={sy - ny}
                  stroke={color}
                  strokeWidth={0.5}
                  strokeOpacity={0.5}
                />
              );
            })}

            {/* Direction chevron for escalators */}
            {ramp.isEscalator && (
              <path
                d={`M ${(ramp.midPt.x - dx / len * 4).toFixed(1)} ${(ramp.midPt.y - dy / len * 4).toFixed(1)} L ${ramp.midPt.x.toFixed(1)} ${ramp.midPt.y.toFixed(1)} L ${(ramp.midPt.x + dy / len * 3).toFixed(1)} ${(ramp.midPt.y - dx / len * 3).toFixed(1)}`}
                fill="none"
                stroke="#93c5fd"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
