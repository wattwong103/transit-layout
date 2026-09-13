/** Shared schematic world: X east/right, Z south/down. Drawing units, not metres. */
export type Point2 = readonly [number, number];
export type ExplorerLevelId =
  | "B5"
  | "B4"
  | "B3"
  | "B2"
  | "B1"
  | "1F"
  | "2F"
  | "3F";
export type ContextMode = "station" | "buildings" | "both";
export interface ExplorerLevel {
  id: ExplorerLevelId;
  label: string;
  order: number;
  description: string;
}
export interface ExplorerSpace {
  id: string;
  name: string;
  levelId: ExplorerLevelId;
  kind: "platform" | "concourse" | "passage" | "plaza";
  polygon: Point2[];
  color: string;
  line?: string;
  labelPosition: Point2;
  /** A thin colored rail parallel to a platform; these are illustrative. */
  tracks?: { points: Point2[]; color: string }[];
}
export interface ExplorerConnector {
  id: string;
  kind: "stairs" | "escalator" | "lift";
  from: { levelId: ExplorerLevelId; position: Point2 };
  to: { levelId: ExplorerLevelId; position: Point2 };
  width: number;
}
export interface ExplorerBuilding {
  id: string;
  name: string;
  shortName: string;
  polygon: Point2[];
  labelPosition: Point2;
  /** Display-only envelope height; not the surveyed building height. */
  displayHeight: number;
  color: string;
  description: string;
  sourceUrl: string;
}
export interface ExplorerExit {
  id: string;
  code: string;
  name: string;
  levelId: ExplorerLevelId;
  position: Point2;
  /** Which schematic passage provides context; not a validated route. */
  spaceId: string;
  destinations: {
    buildingId: string;
    relationship: "direct" | "toward";
    note: string;
  }[];
  sourceUrl: string;
  sourceDate: string;
}
export interface ExplorerDataset {
  levels: ExplorerLevel[];
  spaces: ExplorerSpace[];
  connectors: ExplorerConnector[];
  buildings: ExplorerBuilding[];
  exits: ExplorerExit[];
}
export interface ExplorerViewProps {
  data: ExplorerDataset;
  contextMode: ContextMode;
  activeLevel: ExplorerLevelId | "all";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  separation: number;
  showLabels: boolean;
  resetKey: number;
}
