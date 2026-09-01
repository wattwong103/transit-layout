"use client";

import { useMemo } from "react";
import { FloorId, StationNode, StationEdge, Route } from "@/types/station";
import { floors } from "@/data/floors";
import { useMapStore } from "@/store/useMapStore";
import { computeIsometricViewBox } from "@/lib/isometric";
import MapViewport from "@/components/map/MapViewport";
import IsometricFloorSlab from "./IsometricFloorSlab";
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
    currentFloor,
    highlightedFloor,
    setHighlightedFloor,
    setCurrentFloor,
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
    resetTransform("floor");
  };

  const sortedFloors = useMemo(
    () => [...floors].sort((a, b) => a.elevation - b.elevation),
    []
  );

  return (
    <div className="relative w-full h-full">
      <MapViewport viewBox={viewBox} className="bg-[#f4f1ea]" pane="overview">
        <rect x="-2000" y="-2000" width="6000" height="6000" fill="#f4f1ea" />

        {sortedFloors.map((floorPlan) => (
          <IsometricFloorSlab
            key={floorPlan.floor}
            floorPlan={floorPlan}
            nodes={nodesByFloor.get(floorPlan.floor) ?? []}
            isCurrent={currentFloor === floorPlan.floor}
            isHighlighted={highlightedFloor === floorPlan.floor}
            isOnRoute={routeFloors.has(floorPlan.floor)}
            onClick={() => handleFloorClick(floorPlan.floor)}
            onHover={(hovering) =>
              setHighlightedFloor(hovering ? floorPlan.floor : null)
            }
          />
        ))}

        <IsometricColumns edges={allEdges} nodesById={nodesById} />
        <IsometricEscalator edges={allEdges} nodesById={nodesById} />
        <IsometricRoutePath route={route} nodesById={nodesById} />
      </MapViewport>

      <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600">
        <LegendChip color="#efe4c8" label="Concourse" />
        <LegendChip color="#c4623a" label="Stairs" />
        <LegendChip color="#4f8fd0" label="Elevator" />
        <LegendChip color="#f5c518" label="Exit" />
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-stone-300/80">
      <span
        className="w-2.5 h-2.5 rounded-sm border border-black/10"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
