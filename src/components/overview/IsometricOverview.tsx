"use client";

import { useMemo } from "react";
import { FloorId, StationNode, StationEdge, Route } from "@/types/station";
import { floors } from "@/data/floors";
import { useMapStore } from "@/store/useMapStore";
import { computeIsometricViewBox } from "@/lib/isometric";
import MapViewport from "@/components/map/MapViewport";
import IsometricFloorSlab from "./IsometricFloorSlab";
import IsometricVerticalConnectors from "./IsometricVerticalConnectors";
import IsometricRoutePath from "./IsometricRoutePath";

interface IsometricOverviewProps {
  allNodes: StationNode[];
  allEdges: StationEdge[];
  route: Route | null;
}

export default function IsometricOverview({
  allNodes,
  allEdges,
  route,
}: IsometricOverviewProps) {
  const {
    highlightedFloor,
    setHighlightedFloor,
    setCurrentFloor,
    setViewMode,
    resetTransform,
  } = useMapStore();

  const viewBox = useMemo(() => computeIsometricViewBox(), []);
  const nodesById = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes]
  );

  // Nodes grouped by floor
  const nodesByFloor = useMemo(() => {
    const map = new Map<FloorId, StationNode[]>();
    for (const node of allNodes) {
      if (!map.has(node.floor)) map.set(node.floor, []);
      map.get(node.floor)!.push(node);
    }
    return map;
  }, [allNodes]);

  // Floors that are part of the active route
  const routeFloors = useMemo(() => {
    if (!route) return new Set<FloorId>();
    const set = new Set<FloorId>();
    for (const step of route.steps) {
      set.add(step.floor);
      if (step.floorChange) {
        set.add(step.floorChange.from);
        set.add(step.floorChange.to);
      }
    }
    return set;
  }, [route]);

  const handleFloorClick = (floor: FloorId) => {
    setCurrentFloor(floor);
    setViewMode("floor");
    resetTransform();
  };

  // Render floors bottom-up (B5 first) for correct painter's order
  const sortedFloors = useMemo(
    () => [...floors].sort((a, b) => a.elevation - b.elevation),
    []
  );

  return (
    <MapViewport viewBox={viewBox}>
      {/* Dark background */}
      <rect x="-1000" y="-1000" width="4000" height="4000" fill="#0a0f1a" />

      {/* Vertical connectors (behind floor slabs) */}
      <IsometricVerticalConnectors edges={allEdges} nodesById={nodesById} />

      {/* Floor slabs */}
      {sortedFloors.map((floorPlan) => (
        <IsometricFloorSlab
          key={floorPlan.floor}
          floorPlan={floorPlan}
          nodes={nodesByFloor.get(floorPlan.floor) ?? []}
          isHighlighted={highlightedFloor === floorPlan.floor}
          isOnRoute={routeFloors.has(floorPlan.floor)}
          onClick={() => handleFloorClick(floorPlan.floor)}
          onHover={(hovering) =>
            setHighlightedFloor(hovering ? floorPlan.floor : null)
          }
        />
      ))}

      {/* Route path (on top of everything) */}
      <IsometricRoutePath route={route} nodesById={nodesById} />
    </MapViewport>
  );
}
