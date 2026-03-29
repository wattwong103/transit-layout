import { Route, RouteStep, StationNode, StationEdge, FloorId } from "@/types/station";
import { PathResult } from "./pathfinding";

const edgeVerbs: Record<StationEdge["type"], string> = {
  walkway: "Walk to",
  escalator: "Take the escalator to",
  stairs: "Take the stairs to",
  elevator: "Take the elevator to",
  passage: "Pass through",
};

/**
 * Converts a raw pathfinding result into human-readable route steps.
 */
export function formatRoute(
  path: PathResult,
  nodesById: Map<string, StationNode>
): Route {
  const steps: RouteStep[] = [];

  for (let i = 0; i < path.edges.length; i++) {
    const edge = path.edges[i];
    const fromNode = nodesById.get(path.nodeIds[i]);
    const toNode = nodesById.get(path.nodeIds[i + 1]);
    if (!fromNode || !toNode) continue;

    const floorChange =
      fromNode.floor !== toNode.floor
        ? { from: fromNode.floor, to: toNode.floor }
        : undefined;

    const instruction = buildInstruction(edge, fromNode, toNode, floorChange);

    steps.push({
      instruction,
      fromNode: fromNode.id,
      toNode: toNode.id,
      edgeType: edge.type,
      floor: fromNode.floor,
      floorChange,
      duration: edge.weight,
    });
  }

  // Merge consecutive walkway steps on the same floor
  const merged = mergeWalkways(steps, nodesById);

  return {
    totalTime: path.totalWeight,
    steps: merged,
  };
}

function buildInstruction(
  edge: StationEdge,
  from: StationNode,
  to: StationNode,
  floorChange?: { from: FloorId; to: FloorId }
): string {
  const verb = edgeVerbs[edge.type];
  const destination = to.exitName || to.label;

  if (floorChange) {
    const direction =
      floorElevation(floorChange.to) > floorElevation(floorChange.from)
        ? "up"
        : "down";
    return `${verb} ${destination} (${direction} to ${floorChange.to})`;
  }

  if (edge.type === "passage") {
    return `${verb} ${destination}`;
  }

  return `${verb} ${destination}`;
}

function floorElevation(floor: FloorId): number {
  const map: Record<FloorId, number> = {
    B5: -5,
    B4: -4,
    B3: -3,
    B2: -2,
    B1: -1,
    "1F": 1,
    "2F": 2,
    "3F": 3,
  };
  return map[floor];
}

/**
 * Merge consecutive walkway steps on the same floor into one step.
 */
function mergeWalkways(
  steps: RouteStep[],
  nodesById: Map<string, StationNode>
): RouteStep[] {
  const merged: RouteStep[] = [];

  for (const step of steps) {
    const prev = merged[merged.length - 1];

    if (
      prev &&
      prev.edgeType === "walkway" &&
      step.edgeType === "walkway" &&
      !prev.floorChange &&
      !step.floorChange &&
      prev.floor === step.floor
    ) {
      // Merge: extend the previous step
      const toNode = nodesById.get(step.toNode);
      prev.toNode = step.toNode;
      prev.duration += step.duration;
      prev.instruction = `Walk to ${toNode?.exitName || toNode?.label || step.toNode}`;
    } else {
      merged.push({ ...step });
    }
  }

  return merged;
}
