import type { FloorId, Route, StationNode } from "@/types/station";
import { getColumnBox, getElevation, toIsometric } from "./isometric";

export interface DisplayPoint {
  nodeId: string;
  x: number;
  y: number;
}

export interface FloorContinuation {
  nodeId: string;
  position: { x: number; y: number };
  direction: "departure" | "arrival";
  otherFloor: FloorId;
}

/** Return separate on-floor runs so leaving and re-entering cannot draw a shortcut. */
export function getFloorRouteSegments(
  route: Route,
  nodesById: Map<string, StationNode>,
  floor: FloorId
): DisplayPoint[][] {
  const segments: DisplayPoint[][] = [];
  let current: DisplayPoint[] | null = null;

  for (let i = 0; i < route.nodeIds.length - 1; i++) {
    const from = nodesById.get(route.nodeIds[i]);
    const to = nodesById.get(route.nodeIds[i + 1]);
    if (!from || !to || from.floor !== floor || to.floor !== floor) {
      current = null;
      continue;
    }

    if (!current) {
      current = [point(from), point(to)];
      segments.push(current);
    } else {
      current.push(point(to));
    }
  }
  return segments;
}

/** Find cross-floor labels at the endpoint that is actually visible on this floor. */
export function getFloorContinuations(
  route: Route,
  nodesById: Map<string, StationNode>,
  floor: FloorId
): FloorContinuation[] {
  const continuations: FloorContinuation[] = [];

  for (let i = 0; i < route.nodeIds.length - 1; i++) {
    const from = nodesById.get(route.nodeIds[i]);
    const to = nodesById.get(route.nodeIds[i + 1]);
    if (!from || !to || from.floor === to.floor) continue;

    if (from.floor === floor) {
      continuations.push({
        nodeId: from.id,
        position: { ...from.position },
        direction: "departure",
        otherFloor: to.floor,
      });
    } else if (to.floor === floor) {
      continuations.push({
        nodeId: to.id,
        position: { ...to.position },
        direction: "arrival",
        otherFloor: from.floor,
      });
    }
  }
  return continuations;
}

export function getIsometricRoutePoints(
  route: Route,
  nodesById: Map<string, StationNode>
): DisplayPoint[] {
  return route.nodeIds.flatMap((nodeId) => {
    const node = nodesById.get(nodeId);
    if (!node) return [];
    return [
      {
        nodeId,
        ...toIsometric(
          node.position.x,
          node.position.y,
          getElevation(node.floor)
        ),
      },
    ];
  });
}

export type ElevatorProjection =
  | {
      kind: "aligned-shaft";
      from: DisplayPoint;
      to: DisplayPoint;
      box: ReturnType<typeof getColumnBox>;
    }
  | {
      kind: "schematic-connection";
      from: DisplayPoint;
      to: DisplayPoint;
    };

/** Project both elevator endpoints without modifying source node positions. */
export function projectElevatorEndpoints(
  from: StationNode,
  to: StationNode
): ElevatorProjection {
  const fromElevation = getElevation(from.floor);
  const toElevation = getElevation(to.floor);
  const fromPoint = {
    nodeId: from.id,
    ...toIsometric(from.position.x, from.position.y, fromElevation),
  };
  const toPoint = {
    nodeId: to.id,
    ...toIsometric(to.position.x, to.position.y, toElevation),
  };

  if (from.position.x === to.position.x && from.position.y === to.position.y) {
    return {
      kind: "aligned-shaft",
      from: fromPoint,
      to: toPoint,
      box: getColumnBox(
        from.position.x,
        from.position.y,
        Math.max(fromElevation, toElevation),
        Math.min(fromElevation, toElevation),
        7
      ),
    };
  }
  return { kind: "schematic-connection", from: fromPoint, to: toPoint };
}

function point(node: StationNode): DisplayPoint {
  return { nodeId: node.id, x: node.position.x, y: node.position.y };
}
