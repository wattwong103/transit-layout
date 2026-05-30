"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloorPlan, StationNode, StationEdge, Route } from "@/types/station";
import MapViewport from "./MapViewport";
import MapDefs from "@/components/svg/MapDefs";
import RegionLayer from "./RegionLayer";
import EdgeLayer from "./EdgeLayer";
import NodeMarkers from "./NodeMarkers";
import RoutePath from "./RoutePath";

interface FloorMapProps {
  floorPlan: FloorPlan;
  nodes: StationNode[];
  edges: StationEdge[];
  allNodes: StationNode[];
  route: Route | null;
  prevElevation?: number;
}

export default function FloorMap({
  floorPlan,
  nodes,
  edges,
  allNodes,
  route,
  prevElevation,
}: FloorMapProps) {
  const nodesById = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes]
  );

  // Determine vertical slide direction
  const slideDirection =
    prevElevation !== undefined
      ? floorPlan.elevation > prevElevation
        ? -30
        : 30
      : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={floorPlan.floor}
        className="absolute inset-0"
        initial={{ opacity: 0, y: slideDirection }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -slideDirection }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <MapViewport viewBox={floorPlan.svgViewBox}>
          <MapDefs />
          {/* Background */}
          <rect width="1200" height="600" fill="#0f172a" />

          {/* Floor regions (platforms, concourses) */}
          <RegionLayer regions={floorPlan.regions} />

          {/* Connection edges */}
          <EdgeLayer
            edges={edges}
            nodesById={nodesById}
            currentFloor={floorPlan.floor}
          />

          {/* Route overlay */}
          <RoutePath
            route={route}
            nodesById={nodesById}
            currentFloor={floorPlan.floor}
          />

          {/* Interactive node markers */}
          <NodeMarkers nodes={nodes} />
        </MapViewport>
      </motion.div>
    </AnimatePresence>
  );
}
