"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Route, StationNode } from "@/types/station";
import { toIsometric, getElevation } from "@/lib/isometric";

interface IsometricRoutePathProps {
  route: Route | null;
  nodesById: Map<string, StationNode>;
}

export default function IsometricRoutePath({
  route,
  nodesById,
}: IsometricRoutePathProps) {
  const pathData = useMemo(() => {
    if (!route) return null;

    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < route.steps.length; i++) {
      const step = route.steps[i];
      const fromNode = nodesById.get(step.fromNode);
      const toNode = nodesById.get(step.toNode);
      if (!fromNode || !toNode) continue;

      if (points.length === 0) {
        const fromElev = getElevation(fromNode.floor);
        points.push(
          toIsometric(fromNode.position.x, fromNode.position.y, fromElev)
        );
      }

      const toElev = getElevation(toNode.floor);
      points.push(
        toIsometric(toNode.position.x, toNode.position.y, toElev)
      );
    }

    if (points.length < 2) return null;

    return {
      d:
        `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" "),
      start: points[0],
      end: points[points.length - 1],
    };
  }, [route, nodesById]);

  if (!pathData) return null;

  return (
    <g className="iso-route-path" pointerEvents="none">
      {/* Glow */}
      <motion.path
        d={pathData.d}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={6}
        strokeOpacity={0.15}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Main path */}
      <motion.path
        d={pathData.d}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeOpacity={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Marching ants */}
      <motion.path
        d={pathData.d}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </motion.path>

      {/* Start marker */}
      <motion.circle
        cx={pathData.start.x}
        cy={pathData.start.y}
        r={5}
        fill="#22c55e"
        stroke="#fff"
        strokeWidth={1.5}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      />

      {/* End marker */}
      <motion.circle
        cx={pathData.end.x}
        cy={pathData.end.y}
        r={5}
        fill="#ef4444"
        stroke="#fff"
        strokeWidth={1.5}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 400 }}
      />
    </g>
  );
}
