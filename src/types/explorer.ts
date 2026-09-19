/** X east/right, Z south/down. Original data uses drawing units; registered views use metres. */
export type Point2 = readonly [number, number];
export type ExplorerLevelId =
  | "B5"
  | "B4"
  | "B3"
  | "B2"
  | "B1"
  | "1F"
  | "2F"
  | "3F"
  | "4F";
export interface FeatureEvidence {
  sourceId: string;
  locator: string;
  /** Describes correspondence, never survey accuracy of the drawn position. */
  certainty: "documented" | "inferred";
}
export interface FeatureAccess {
  area: "paid" | "unpaid" | "mixed" | "unknown";
  status: "shown-in-source" | "closed-in-source" | "planned" | "unconfirmed";
  hours?: string;
  direction?: "up" | "down" | "both" | "unknown";
  note?: string;
}
export interface ConnectorStop {
  levelId: ExplorerLevelId;
  position: Point2;
}
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
  /** Derived voids carried through registration, in the same frame as polygon. */
  openings?: Point2[][];
  evidence?: FeatureEvidence;
  access?: FeatureAccess;
  /** A thin colored rail parallel to a platform; these are illustrative. */
  tracks?: { points: Point2[]; color: string }[];
}
export interface ExplorerConnector {
  id: string;
  name?: string;
  kind: "stairs" | "escalator" | "lift" | "slope";
  from: { levelId: ExplorerLevelId; position: Point2 };
  to: { levelId: ExplorerLevelId; position: Point2 };
  width: number;
  /** Explicit recorded landings; passing through a floor is not a stop. */
  stops?: ConnectorStop[];
  stopsComplete?: boolean;
  equipmentId?: string;
  evidence?: FeatureEvidence;
  access?: FeatureAccess;
}
export interface ExplorerFacility {
  id: string;
  name: string;
  kind: "gate" | "toilet" | "baby-care" | "aed" | "lockers" | "tickets" | "information" | "works";
  levelId: ExplorerLevelId;
  position: Point2;
  spaceId: string;
  evidence: FeatureEvidence;
  access: FeatureAccess;
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
  evidence?: FeatureEvidence;
  access?: FeatureAccess;
}
export interface ExplorerDataset {
  levels: ExplorerLevel[];
  spaces: ExplorerSpace[];
  connectors: ExplorerConnector[];
  buildings: ExplorerBuilding[];
  exits: ExplorerExit[];
  facilities?: ExplorerFacility[];
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
