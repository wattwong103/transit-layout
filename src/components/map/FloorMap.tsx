"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloorPlan, StationNode, StationEdge, Route } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";
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
  const setSelectedNode = useMapStore((s) => s.setSelectedNode);
  const nodesById = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes]
  );
  const [minX, minY, vw, vh] = floorPlan.svgViewBox.split(/[,\s]+/).map(Number);

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
          <rect
            x={minX}
            y={minY}
            width={vw}
            height={vh}
            fill="#0d1117"
            onClick={() => setSelectedNode(null)}
          />

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
