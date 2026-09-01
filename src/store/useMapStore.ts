"use client";

import { create } from "zustand";
import { FloorId, StationNode, Route } from "@/types/station";

export type MapPane = "floor" | "overview";
export type MapTransform = { x: number; y: number; scale: number };

const IDENTITY: MapTransform = { x: 0, y: 0, scale: 1 };

interface MapStore {
  currentFloor: FloorId;
  setCurrentFloor: (floor: FloorId) => void;

  highlightedFloor: FloorId | null;
  setHighlightedFloor: (floor: FloorId | null) => void;

  selectedNode: StationNode | null;
  setSelectedNode: (node: StationNode | null) => void;

  routeFrom: string | null;
  routeTo: string | null;
  setRouteFrom: (nodeId: string | null) => void;
  setRouteTo: (nodeId: string | null) => void;

  activeRoute: Route | null;
  setActiveRoute: (route: Route | null) => void;

  accessibleOnly: boolean;
  toggleAccessibleOnly: () => void;

  floorTransform: MapTransform;
  overviewTransform: MapTransform;
  setTransform: (t: MapTransform, pane?: MapPane) => void;
  resetTransform: (pane?: MapPane) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  currentFloor: "1F",
  setCurrentFloor: (floor) => set({ currentFloor: floor, selectedNode: null }),

  highlightedFloor: null,
  setHighlightedFloor: (floor) => set({ highlightedFloor: floor }),

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

  floorTransform: IDENTITY,
  overviewTransform: IDENTITY,
  setTransform: (t, pane = "floor") =>
    set(pane === "overview" ? { overviewTransform: t } : { floorTransform: t }),
  resetTransform: (pane = "floor") =>
    set(
      pane === "overview"
        ? { overviewTransform: IDENTITY }
        : { floorTransform: IDENTITY }
    ),
}));
