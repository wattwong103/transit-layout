"use client";

import { useMemo, useRef } from "react";
import { FloorId } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";
import { stationNodes } from "@/data/nodes";
import { stationEdges } from "@/data/edges";
import { getFloorPlan } from "@/data/floors";
import FloorMap from "@/components/map/FloorMap";
import FloorSelector from "@/components/floor/FloorSelector";
import NodeTooltip from "@/components/map/NodeTooltip";
import MapLegend from "@/components/map/MapLegend";
import ZoomControls from "@/components/map/ZoomControls";
import RoutePlanner from "@/components/route/RoutePlanner";
import RoutePanel from "@/components/route/RoutePanel";
import IsometricOverview from "@/components/overview/IsometricOverview";

export default function Home() {
  const { currentFloor, selectedNode, activeRoute } = useMapStore();

  const floorPlan = getFloorPlan(currentFloor);
  const prevElevationRef = useRef<number | undefined>(undefined);

  const prevElevation = prevElevationRef.current;
  if (floorPlan) {
    prevElevationRef.current = floorPlan.elevation;
  }

  const floorNodes = useMemo(
    () => stationNodes.filter((n) => n.floor === currentFloor),
    [currentFloor]
  );

  const floorEdges = useMemo(() => {
    const nodeIds = new Set(floorNodes.map((n) => n.id));
    return stationEdges.filter(
      (e) => nodeIds.has(e.from) || nodeIds.has(e.to)
    );
  }, [floorNodes]);

  const routeFloors = useMemo(() => {
    if (!activeRoute) return undefined;
    const floorsOnRoute = new Set<FloorId>();
    for (const step of activeRoute.steps) {
      floorsOnRoute.add(step.floor);
      if (step.floorChange) {
        floorsOnRoute.add(step.floorChange.from);
        floorsOnRoute.add(step.floorChange.to);
      }
    }
    return floorsOnRoute;
  }, [activeRoute]);

  if (!floorPlan) return null;

  return (
    <div className="h-dvh flex flex-col bg-[#0d1117]">
      <header className="flex-shrink-0 px-3 py-2 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 z-30">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-white tracking-tight">
            Shibuya Station
          </h1>
          <p className="text-[11px] text-slate-400 truncate">
            {floorPlan.label}
            <span className="text-slate-500"> · 2D plan + 3D stack</span>
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* 3D — building context */}
        <section className="relative flex-shrink-0 h-[34%] min-h-[200px] md:h-auto md:min-h-0 md:w-[40%] md:max-w-[520px] bg-[#f4f1ea] border-b md:border-b-0 md:border-r border-stone-300">
          <div className="absolute top-1.5 left-2 z-10 pointer-events-none">
            <span className="text-[10px] font-bold tracking-wide uppercase text-stone-500 bg-white/80 rounded px-1.5 py-0.5 border border-stone-300/80">
              3D
            </span>
          </div>
          <IsometricOverview
            allNodes={stationNodes}
            allEdges={stationEdges}
            route={activeRoute}
          />
        </section>

        {/* 2D — current floor */}
        <section className="relative flex-1 min-h-0 bg-[#0d1117]">
          <div className="absolute top-[6.75rem] left-[3.75rem] right-2 bottom-2 md:top-2 md:left-16 md:right-14 md:bottom-2">
            <FloorMap
              floorPlan={floorPlan}
              nodes={floorNodes}
              edges={floorEdges}
              allNodes={stationNodes}
              route={activeRoute}
              prevElevation={prevElevation}
            />
          </div>

          <div className="absolute z-20 top-2 left-[4.25rem] right-14 md:left-16 md:right-auto md:w-[380px]">
            <RoutePlanner />
          </div>

          <div className="absolute left-2 top-[6.75rem] bottom-3 md:top-2 md:bottom-2 z-20 flex items-center">
            <FloorSelector routeFloors={routeFloors} />
          </div>

          <div className="absolute top-2 right-2 z-20">
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400 bg-slate-800/90 rounded px-1.5 py-0.5 border border-slate-700">
              2D · {currentFloor}
            </span>
          </div>

          <div className="absolute right-2 bottom-3 md:top-10 md:bottom-auto z-20 flex flex-col items-end gap-2">
            <MapLegend />
            <ZoomControls />
          </div>

          <NodeTooltip node={selectedNode} />
          <RoutePanel route={activeRoute} />
        </section>
      </div>
    </div>
  );
}
