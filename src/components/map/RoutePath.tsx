"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Route, StationNode } from "@/types/station";
import {
  getFloorContinuations,
  getFloorRouteSegments,
} from "@/lib/route-display";

interface RoutePathProps {
  route: Route | null;
  nodesById: Map<string, StationNode>;
  currentFloor: string;
}

export default function RoutePath({
  route,
  nodesById,
  currentFloor,
}: RoutePathProps) {
  const floor = currentFloor as StationNode["floor"];
  const segments = useMemo(
    () => (route ? getFloorRouteSegments(route, nodesById, floor) : []),
    [route, nodesById, floor]
  );
  const continuations = useMemo(
    () => (route ? getFloorContinuations(route, nodesById, floor) : []),
    [route, nodesById, floor]
  );

  if (!segments.length && !continuations.length) return null;

  const firstPoint = segments[0]?.[0];
  const lastPoint = segments.at(-1)?.at(-1);

  return (
    <g className="route-path">
      {segments.map((segment, index) => {
        const pathData =
          `M ${segment[0].x} ${segment[0].y} ` +
          segment
            .slice(1)
            .map((point) => `L ${point.x} ${point.y}`)
            .join(" ");

        return (
          <g key={`route-segment-${index}`}>
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
          </g>
        );
      })}

      {firstPoint && (
        <motion.circle
          cx={firstPoint.x}
          cy={firstPoint.y}
          r={7}
          fill="#22c55e"
          stroke="#fff"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
      {lastPoint && (
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={7}
          fill="#ef4444"
          stroke="#fff"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}

      {continuations.map((continuation, index) => (
        <g key={`continuation-${index}`}>
          <rect
            x={continuation.position.x + 10}
            y={continuation.position.y - 10}
            width={continuation.direction === "arrival" ? 48 : 32}
            height={18}
            rx={4}
            fill="#1e3a5f"
            stroke="#3b82f6"
            strokeWidth={1}
          />
          <text
            x={
              continuation.position.x +
              (continuation.direction === "arrival" ? 34 : 26)
            }
            y={continuation.position.y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#60a5fa"
            fontSize={9}
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            {continuation.direction === "arrival" ? "from " : "→ "}
            {continuation.otherFloor}
          </text>
        </g>
      ))}
    </g>
  );
}
