"use client";

import { useMemo } from "react";
import { FloorId, StationNode, StationEdge, Route } from "@/types/station";
import { floors } from "@/data/floors";
import { useMapStore } from "@/store/useMapStore";
import { computeIsometricViewBox } from "@/lib/isometric";
import MapViewport from "@/components/map/MapViewport";
import MapDefs from "@/components/svg/MapDefs";
import IsometricFloorSlab from "./IsometricFloorSlab";
import IsometricVerticalConnectors from "./IsometricVerticalConnectors";
import IsometricColumns from "./IsometricColumns";
import IsometricEscalator from "./IsometricEscalator";
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

  const nodesByFloor = useMemo(() => {
    const map = new Map<FloorId, StationNode[]>();
    for (const node of allNodes) {
      if (!map.has(node.floor)) map.set(node.floor, []);
      map.get(node.floor)!.push(node);
    }
    return map;
  }, [allNodes]);

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

  const sortedFloors = useMemo(
    () => [...floors].sort((a, b) => a.elevation - b.elevation),
    []
  );

  return (
    <MapViewport viewBox={viewBox}>
      <MapDefs />

      {/* Dark background */}
      <rect x="-1200" y="-1200" width="4000" height="4000" fill="#080d18" />

      {/* Faint long-distance passage lines (behind everything) */}
      <IsometricVerticalConnectors edges={allEdges} nodesById={nodesById} />

      {/* Floor slabs bottom-up for painter's order occlusion */}
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

      {/* Structural columns + elevator shafts (semi-transparent, span floors) */}
      <IsometricColumns edges={allEdges} nodesById={nodesById} />

      {/* Diagonal escalator/stairs ramps (on top of slabs) */}
      <IsometricEscalator edges={allEdges} nodesById={nodesById} />

      {/* Route path (always on top) */}
      <IsometricRoutePath route={route} nodesById={nodesById} />
    </MapViewport>
  );
}
