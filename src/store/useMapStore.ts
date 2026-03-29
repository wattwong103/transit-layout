"use client";

import { create } from "zustand";
import { FloorId, StationNode, Route } from "@/types/station";

interface MapStore {
  // Current floor being viewed
  currentFloor: FloorId;
  setCurrentFloor: (floor: FloorId) => void;

  // Selected node (tapped marker)
  selectedNode: StationNode | null;
  setSelectedNode: (node: StationNode | null) => void;

  // Route planning
  routeFrom: string | null; // node id
  routeTo: string | null; // node id
  setRouteFrom: (nodeId: string | null) => void;
  setRouteTo: (nodeId: string | null) => void;

  // Computed route
  activeRoute: Route | null;
  setActiveRoute: (route: Route | null) => void;

  // Accessibility mode
  accessibleOnly: boolean;
  toggleAccessibleOnly: () => void;

  // Map viewport transform
  transform: { x: number; y: number; scale: number };
  setTransform: (t: { x: number; y: number; scale: number }) => void;
  resetTransform: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  currentFloor: "1F",
  setCurrentFloor: (floor) => set({ currentFloor: floor, selectedNode: null }),

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  routeFrom: null,
  routeTo: null,
  setRouteFrom: (nodeId) => set({ routeFrom: nodeId }),
  setRouteTo: (nodeId) => set({ routeTo: nodeId }),

  activeRoute: null,
  setActiveRoute: (route) => set({ activeRoute: route }),

  accessibleOnly: false,
  toggleAccessibleOnly: () =>
    set((state) => ({ accessibleOnly: !state.accessibleOnly })),

  transform: { x: 0, y: 0, scale: 1 },
  setTransform: (t) => set({ transform: t }),
  resetTransform: () => set({ transform: { x: 0, y: 0, scale: 1 } }),
}));
