"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, FloorId } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";
import RouteStepComponent from "./RouteStep";

interface RoutePanelProps {
  route: Route | null;
}

function formatTotalTime(seconds: number): string {
  const min = Math.ceil(seconds / 60);
  return `~${min} min`;
}

export default function RoutePanel({ route }: RoutePanelProps) {
  const { setCurrentFloor, resetTransform } = useMapStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStepTap = (floor: FloorId) => {
    setCurrentFloor(floor);
    resetTransform();
  };

  return (
    <AnimatePresence>
      {route && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-600 rounded-t-2xl shadow-2xl z-40 pb-safe"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Handle bar */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex flex-col items-center pt-2 pb-1 px-4"
          >
            <div className="w-10 h-1 rounded-full bg-slate-600 mb-2" />
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                Route — {formatTotalTime(route.totalTime)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {route.steps.length} steps
                </span>
                <motion.svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </motion.svg>
              </div>
            </div>
          </button>

          {/* Steps list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="overflow-y-auto max-h-[40vh] divide-y divide-slate-700/50">
                  {route.steps.map((step, i) => (
                    <RouteStepComponent
                      key={`${step.fromNode}-${step.toNode}-${i}`}
                      step={step}
                      index={i}
                      isLast={i === route.steps.length - 1}
                      onTap={() =>
                        handleStepTap(step.floorChange?.to ?? step.floor)
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
