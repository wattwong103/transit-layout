"use client";

import { FloorId } from "@/types/station";
import { floors } from "@/data/floors";
import { useMapStore } from "@/store/useMapStore";

const FLOOR_ORDER: FloorId[] = ["3F", "2F", "1F", "B1", "B2", "B3", "B4", "B5"];

const FLOOR_HINT: Record<FloorId, string> = {
  "3F": "Ginza / Central Exit",
  "2F": "JR / Keio",
  "1F": "Ground / Exits",
  B1: "Concourse",
  B2: "Hanzomon concourse",
  B3: "Hanzomon / Den-en-toshi",
  B4: "Fukutoshin concourse",
  B5: "Fukutoshin / Toyoko",
};

interface FloorSelectorProps {
  routeFloors?: Set<FloorId>;
}

export default function FloorSelector({ routeFloors }: FloorSelectorProps) {
  const { currentFloor, setCurrentFloor, resetTransform } = useMapStore();

  return (
    <div className="flex flex-col items-center gap-0.5 p-1.5 bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-lg">
      {FLOOR_ORDER.map((floor, i) => {
        const isActive = floor === currentFloor;
        const isOnRoute = routeFloors?.has(floor);
        const plan = floors.find((f) => f.floor === floor);

        return (
          <div key={floor} className="relative flex flex-col items-center">
            {i > 0 && (
              <div
                className={`w-px h-1.5 ${
                  isOnRoute && routeFloors?.has(FLOOR_ORDER[i - 1])
                    ? "bg-blue-400"
                    : "bg-slate-600/80"
                }`}
              />
            )}
            <button
              onClick={() => {
                setCurrentFloor(floor);
                resetTransform();
              }}
              title={plan?.label ?? FLOOR_HINT[floor]}
              className={`
                relative w-10 h-8 rounded-lg text-[11px] font-semibold transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"
                }
              `}
            >
              {floor}
              {isOnRoute && !isActive && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
