"use client";

import { Route, StationNode } from "@/types/station";

interface RoutePathProps {
  route: Route | null;
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

export default function RoutePath({ route, nodesById, currentFloor }: RoutePathProps) {
  if (!route) return null;

  // Build path segments that are on the current floor
  const segments: { x: number; y: number }[] = [];

  for (const step of route.steps) {
    const fromNode = nodesById.get(step.fromNode);
    const toNode = nodesById.get(step.toNode);
    if (!fromNode || !toNode) continue;

    if (fromNode.floor === currentFloor) {
      if (segments.length === 0) {
        segments.push(fromNode.position);
      }
      if (toNode.floor === currentFloor) {
        segments.push(toNode.position);
      }
    } else if (toNode.floor === currentFloor && segments.length === 0) {
      segments.push(toNode.position);
    }
  }

  if (segments.length < 2) return null;

  const pathData =
    `M ${segments[0].x} ${segments[0].y} ` +
    segments
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");

  return (
    <g className="route-path">
      {/* Glow effect */}
      <path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={8}
        strokeOpacity={0.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main path */}
      <path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={4}
        strokeOpacity={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-24"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      {/* Start marker */}
      <circle
        cx={segments[0].x}
        cy={segments[0].y}
        r={6}
        fill="#22c55e"
        stroke="#fff"
        strokeWidth={2}
      />
      {/* End marker */}
      <circle
        cx={segments[segments.length - 1].x}
        cy={segments[segments.length - 1].y}
        r={6}
        fill="#ef4444"
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}
