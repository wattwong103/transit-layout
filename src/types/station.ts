export type FloorId = "B5" | "B4" | "B3" | "B2" | "B1" | "1F" | "2F" | "3F";

export type RailwayLine =
  | "jr_yamanote"
  | "jr_saikyo"
  | "jr_shonan_shinjuku"
  | "metro_ginza"
  | "metro_hanzomon"
  | "metro_fukutoshin"
  | "tokyu_toyoko"
  | "tokyu_den_en_toshi"
  | "keio_inokashira";

export type NodeType =
  | "platform"
  | "concourse"
  | "ticket_gate"
  | "escalator"
  | "stairs"
  | "elevator"
  | "exit"
  | "junction";

export type EdgeType =
  | "walkway"
  | "escalator"
  | "stairs"
  | "elevator"
  | "passage";

export interface StationNode {
  id: string;
  type: NodeType;
  floor: FloorId;
  label: string;
  railwayLine?: RailwayLine;
  exitName?: string;
  exitCode?: string;
  escalatorDirection?: "up" | "down" | "both";
  position: { x: number; y: number };
  accessible?: boolean;
}

export interface StationEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight: number; // walking time in seconds
  bidirectional: boolean;
  accessible: boolean;
  floorsConnected?: [FloorId, FloorId];
}

export interface FloorPlan {
  floor: FloorId;
  label: string;
  elevation: number;
  svgViewBox: string;
  regions: FloorRegion[];
}

export interface FloorRegion {
  id: string;
  type: "platform_area" | "concourse" | "commercial" | "outside";
  railwayLine?: RailwayLine;
  svgPath: string;
  label: string;
}

export interface RailwayLineInfo {
  id: RailwayLine;
  name: string;
  color: string;
  operator: string;
}

export interface Route {
  totalTime: number;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  fromNode: string;
  toNode: string;
  edgeType: EdgeType;
  floor: FloorId;
  floorChange?: { from: FloorId; to: FloorId };
  duration: number;
}
