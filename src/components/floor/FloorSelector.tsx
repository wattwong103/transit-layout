"use client";

import { FloorId } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";

const FLOORS: FloorId[] = ["3F", "2F", "1F", "B1", "B2", "B3", "B4", "B5"];

interface FloorSelectorProps {
  routeFloors?: Set<FloorId>;
}

export default function FloorSelector({ routeFloors }: FloorSelectorProps) {
  const { currentFloor, setCurrentFloor, resetTransform } = useMapStore();

  return (
    <div className="flex gap-1 p-2 bg-slate-800/90 backdrop-blur-sm overflow-x-auto scrollbar-hide">
      {FLOORS.map((floor) => {
        const isActive = floor === currentFloor;
        const isOnRoute = routeFloors?.has(floor);

        return (
          <button
            key={floor}
            onClick={() => {
              setCurrentFloor(floor);
              resetTransform();
            }}
            className={`
              relative flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }
            `}
          >
            {floor}
            {/* Route indicator dot */}
            {isOnRoute && !isActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
