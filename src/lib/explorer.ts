import type {
  ExplorerDataset,
  ExplorerLevelId,
  ContextMode,
  ExplorerSpace,
  ExplorerBuilding,
  ExplorerExit,
  ExplorerConnector,
  ExplorerFacility,
  Point2,
} from "../types/explorer";

export const connectorStops = (connector: ExplorerConnector) =>
  connector.stops ?? [connector.from, connector.to];
export const connectorLevels = (connector: ExplorerConnector) =>
  connectorStops(connector).map((stop) => stop.levelId);
export const connectorName = (connector: ExplorerConnector) =>
  connector.name ?? (connector.kind === "lift" ? "Lift" : connector.kind === "stairs" ? "Stairs" : connector.kind === "slope" ? "Slope" : "Escalator");
export const facilitySymbol = (kind: ExplorerFacility["kind"]) => ({
  gate: "G", toilet: "WC", "baby-care": "B", aed: "+", lockers: "L", tickets: "T", information: "i", works: "×",
})[kind];

/** Tiny display-only layer offsets avoid coplanar flicker at overlapping passage joins. */
export const floorSurfaceOffset = (data: ExplorerDataset, space: ExplorerSpace) =>
  data.spaces.filter(s=>s.levelId === space.levelId).findIndex(s=>s.id === space.id) * .015;

/** Screen-size label placement; canonical building and exit positions stay untouched. */
export function placeBuildingLabels(
  buildings: ExplorerBuilding[],
  exits: ExplorerExit[],
  scale: number,
) {
  const px = Math.max(scale, 0.001);
  const boxes = exits.map((exit) => ({
    x: exit.position[0] * px,
    y: exit.position[1] * px,
    w: 30,
    h: 24,
  }));
  const result = new Map<string, Point2>();
  for (const building of buildings) {
    const width = building.shortName.length * 6.1 + 8;
    const x = building.labelPosition[0] * px;
    const z = building.polygon.map((point) => point[1] * px);
    const candidates = [
      building.labelPosition[1] * px,
      Math.max(...z) + 13,
      Math.min(...z) - 13,
      Math.max(...z) + 29,
      Math.min(...z) - 29,
    ];
    const overlaps = (y: number) =>
      boxes.filter(
        (box) =>
          Math.abs(box.x - x) < (box.w + width) / 2 &&
          Math.abs(box.y - y) < (box.h + 16) / 2,
      ).length;
    const chosen = candidates.reduce(
      (best, y) => (overlaps(y) < overlaps(best) ? y : best),
      candidates[0],
    );
    boxes.push({ x, y: chosen, w: width, h: 16 });
    result.set(building.id, [x / px, chosen / px]);
  }
  return result;
}

/** Selection links are associations, deliberately separate from the legacy routing graph. */
export function getSelection(data: ExplorerDataset, selectedId: string | null) {
  const exit = data.exits.find((item) => item.id === selectedId);
  const building = data.buildings.find((item) => item.id === selectedId);
  const space = data.spaces.find((item) => item.id === selectedId);
  const connector = data.connectors.find((item) => item.id === selectedId);
  const facility = data.facilities?.find((item) => item.id === selectedId);
  const exits = exit
    ? [exit]
    : building
      ? data.exits.filter((item) =>
          item.destinations.some(
            (destination) => destination.buildingId === building.id,
          ),
        )
      : [];
  const connections = exits.flatMap((item) =>
    item.destinations
      .filter(
        (destination) => !building || destination.buildingId === building.id,
      )
      .map((destination) => ({
        exit: item,
        building: data.buildings.find(
          (candidate) => candidate.id === destination.buildingId,
        )!,
        ...destination,
      })),
  );
  return {
    exit,
    building,
    space,
    connector,
    facility,
    exits,
    connections,
    highlightedIds: new Set([
      selectedId,
      facility?.spaceId,
      ...exits.map((item) => item.id),
      ...exits.map((item) => item.spaceId),
      ...connections.map((item) => item.buildingId),
    ]),
  };
}

export function getVisibleFeatures(
  data: ExplorerDataset,
  mode: ContextMode,
  level: ExplorerLevelId | "all",
) {
  const matches = (id: ExplorerLevelId) => level === "all" || level === id;
  return {
    spaces:
      mode === "buildings"
        ? []
        : data.spaces.filter((item) => matches(item.levelId)),
    connectors:
      mode === "buildings"
        ? []
        : data.connectors.filter(
            (item) => connectorLevels(item).some(matches),
          ),
    buildings: mode === "station" ? [] : data.buildings,
    exits: data.exits.filter((item) => matches(item.levelId)),
    facilities: mode === "buildings" ? [] : (data.facilities ?? []).filter((item) => matches(item.levelId)),
  };
}

export function pointInPolygon(point: Point2, polygon: Point2[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}

/** Openings are derived diagram details, not surveyed void boundaries. */
export function getSpaceOpenings(
  data: ExplorerDataset,
  space: ExplorerSpace,
): Point2[][] {
  if (space.openings) return space.openings;
  const order = (id: ExplorerLevelId) =>
    data.levels.find((level) => level.id === id)!.order;
  const level = order(space.levelId);
  const openings: Point2[][] = [];
  for (const connector of data.connectors) {
    const from = order(connector.from.levelId),
      to = order(connector.to.levelId);
    const top = from > to ? connector.from : connector.to;
    const bottom = from > to ? connector.to : connector.from;
    if (
      connector.kind === "lift"
        ? level <= Math.min(from, to) || level > Math.max(from, to)
        : space.levelId !== top.levelId
    )
      continue;
    const dx = top.position[0] - bottom.position[0],
      dz = top.position[1] - bottom.position[1];
    const length = Math.hypot(dx, dz);
    const direction: Point2 =
      connector.kind === "lift" || length === 0
        ? [0, 1]
        : [dx / length, dz / length];
    const halfWidth = connector.width / 2 + 0.65;
    const halfLength = connector.kind === "lift" ? halfWidth : 3.3;
    const center: Point2 = [
      top.position[0] - direction[0] * (connector.kind === "lift" ? 0 : 2.4),
      top.position[1] - direction[1] * (connector.kind === "lift" ? 0 : 2.4),
    ];
    const hole: Point2[] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([x, z]) => [
      center[0] + direction[1] * x * halfWidth + direction[0] * z * halfLength,
      center[1] - direction[0] * x * halfWidth + direction[1] * z * halfLength,
    ]);
    // Insets keep bevels clear of the exterior wall; reject a hole crossing a concave edge.
    const checks = hole.flatMap((point, index) => [
      point,
      [
        (point[0] + hole[(index + 1) % 4][0]) / 2,
        (point[1] + hole[(index + 1) % 4][1]) / 2,
      ] as Point2,
    ]);
    if (
      checks.every((point) => pointInPolygon(point, space.polygon)) &&
      !openings.some(
        (other) =>
          hole.some((point) => pointInPolygon(point, other)) ||
          other.some((point) => pointInPolygon(point, hole)),
      )
    )
      openings.push(hole);
  }
  return openings;
}
