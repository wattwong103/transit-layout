"use client";

import { FloorPlan, StationNode, StationEdge, Route } from "@/types/station";
import MapViewport from "./MapViewport";
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
}

export default function FloorMap({
  floorPlan,
  nodes,
  edges,
  allNodes,
  route,
}: FloorMapProps) {
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));

  return (
    <MapViewport viewBox={floorPlan.svgViewBox}>
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
  );
}
