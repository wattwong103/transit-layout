"use client";

import { useMemo } from "react";
import { FloorId } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";
import { stationNodes } from "@/data/nodes";
import { stationEdges } from "@/data/edges";
import { getFloorPlan } from "@/data/floors";
import FloorMap from "@/components/map/FloorMap";
import FloorSelector from "@/components/floor/FloorSelector";
import NodeTooltip from "@/components/map/NodeTooltip";
import RoutePlanner from "@/components/route/RoutePlanner";
import RoutePanel from "@/components/route/RoutePanel";

export default function Home() {
  const { currentFloor, selectedNode, activeRoute } = useMapStore();

  const floorPlan = getFloorPlan(currentFloor);

  // Nodes on the current floor
  const floorNodes = useMemo(
    () => stationNodes.filter((n) => n.floor === currentFloor),
    [currentFloor]
  );

  // Edges relevant to current floor (at least one endpoint on this floor)
  const floorEdges = useMemo(() => {
    const nodeIds = new Set(floorNodes.map((n) => n.id));
    return stationEdges.filter(
      (e) => nodeIds.has(e.from) || nodeIds.has(e.to)
    );
  }, [floorNodes]);

  // Floors that are part of the active route
  const routeFloors = useMemo(() => {
    if (!activeRoute) return undefined;
    const floors = new Set<FloorId>();
    for (const step of activeRoute.steps) {
      floors.add(step.floor);
      if (step.floorChange) {
        floors.add(step.floorChange.from);
        floors.add(step.floorChange.to);
      }
    }
    return floors;
  }, [activeRoute]);

  if (!floorPlan) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Shibuya Station
            </h1>
            <p className="text-xs text-slate-400">{floorPlan.label}</p>
          </div>
        </div>
      </header>

      {/* Route planner */}
      <RoutePlanner />

      {/* Floor selector */}
      <div className="flex-shrink-0 border-b border-slate-700">
        <FloorSelector routeFloors={routeFloors} />
      </div>

      {/* Map viewport */}
      <div className="flex-1 relative min-h-0">
        <FloorMap
          floorPlan={floorPlan}
          nodes={floorNodes}
          edges={floorEdges}
          allNodes={stationNodes}
          route={activeRoute}
        />

        {/* Node tooltip overlay */}
        <NodeTooltip node={selectedNode} />

        {/* Route panel (bottom sheet) */}
        <RoutePanel route={activeRoute} />

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Exit
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            Ticket Gate
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            Escalator / Stairs
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            Elevator
          </div>
        </div>
      </div>
    </div>
  );
}
