"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Route, StationNode } from "@/types/station";

interface RoutePathProps {
  route: Route | null;
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

export default function RoutePath({ route, nodesById, currentFloor }: RoutePathProps) {
  const segments = useMemo(() => {
    if (!route) return [];
    const pts: { x: number; y: number }[] = [];

    for (const step of route.steps) {
      const fromNode = nodesById.get(step.fromNode);
      const toNode = nodesById.get(step.toNode);
      if (!fromNode || !toNode) continue;

      if (fromNode.floor === currentFloor) {
        if (pts.length === 0) pts.push(fromNode.position);
        if (toNode.floor === currentFloor) pts.push(toNode.position);
      } else if (toNode.floor === currentFloor && pts.length === 0) {
        pts.push(toNode.position);
      }
    }
    return pts;
  }, [route, nodesById, currentFloor]);

  if (segments.length < 2) return null;

  const pathData =
    `M ${segments[0].x} ${segments[0].y} ` +
    segments
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");

  // Calculate approximate total path length for animation
  let totalLength = 0;
  for (let i = 1; i < segments.length; i++) {
    const dx = segments[i].x - segments[i - 1].x;
    const dy = segments[i].y - segments[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <g className="route-path">
      {/* Glow effect */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={10}
        strokeOpacity={0.15}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Main animated path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={4}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Animated dashes overlay (marching ants after path draws) */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-28"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </motion.path>

      {/* Start marker */}
      <motion.circle
        cx={segments[0].x}
        cy={segments[0].y}
        r={7}
        fill="#22c55e"
        stroke="#fff"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      />

      {/* End marker */}
      <motion.circle
        cx={segments[segments.length - 1].x}
        cy={segments[segments.length - 1].y}
        r={7}
        fill="#ef4444"
        stroke="#fff"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
      />

      {/* Floor continuation indicator */}
      {route &&
        route.steps
          .filter(
            (step) =>
              step.floorChange &&
              (step.floor === currentFloor ||
                step.floorChange.to === currentFloor)
          )
          .map((step, i) => {
            const node =
              step.floor === currentFloor
                ? nodesById.get(step.toNode)
                : nodesById.get(step.fromNode);
            if (!node || node.floor !== currentFloor) return null;

            const targetFloor = step.floorChange!.to === currentFloor
              ? step.floorChange!.from
              : step.floorChange!.to;

            return (
              <g key={`cont-${i}`}>
                <rect
                  x={node.position.x + 10}
                  y={node.position.y - 10}
                  width={32}
                  height={18}
                  rx={4}
                  fill="#1e3a5f"
                  stroke="#3b82f6"
                  strokeWidth={1}
                />
                <text
                  x={node.position.x + 26}
                  y={node.position.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#60a5fa"
                  fontSize={9}
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  → {targetFloor}
                </text>
              </g>
            );
          })}
    </g>
  );
}
