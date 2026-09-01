import { Route, RouteStep, StationNode, StationEdge, FloorId } from "@/types/station";
import { PathResult } from "./pathfinding";

const LANDMARK_TYPES = new Set<StationNode["type"]>([
  "exit",
  "platform",
  "ticket_gate",
  "escalator",
  "stairs",
  "elevator",
]);

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

    steps.push({
      instruction: buildInstruction(edge, toNode, floorChange),
      fromNode: fromNode.id,
      toNode: toNode.id,
      edgeType: edge.type,
      floor: fromNode.floor,
      floorChange,
      duration: edge.weight,
    });
  }

  const merged = rewriteWalkways(mergeWalkways(steps), nodesById);

  return {
    totalTime: path.totalWeight,
    steps: merged,
  };
}

function landmarkName(node: StationNode): string {
  if (node.type === "exit") return node.exitName || node.label;
  if (node.type === "platform") return node.label;
  if (node.type === "ticket_gate") return node.label;
  if (node.type === "escalator") return "the escalator";
  if (node.type === "stairs") return "the stairs";
  if (node.type === "elevator") return "the elevator";
  return "";
}

function buildInstruction(
  edge: StationEdge,
  to: StationNode,
  floorChange?: { from: FloorId; to: FloorId }
): string {
  if (floorChange) {
    const direction =
      floorElevation(floorChange.to) > floorElevation(floorChange.from)
        ? "up"
        : "down";
    if (
      edge.type === "escalator" ||
      edge.type === "stairs" ||
      edge.type === "elevator"
    ) {
      return `Take the ${edge.type} ${direction} to ${floorChange.to}`;
    }
    return `Go ${direction} to ${floorChange.to}`;
  }

  const dest = landmarkName(to);
  if (edge.type === "passage") {
    return dest ? `Pass through ${dest}` : "Pass through the gate";
  }
  if (edge.type === "walkway") {
    return dest ? `Walk to ${dest}` : "Walk ahead";
  }
  return dest ? `Continue to ${dest}` : "Continue ahead";
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

function mergeWalkways(steps: RouteStep[]): RouteStep[] {
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
      prev.toNode = step.toNode;
      prev.duration += step.duration;
    } else {
      merged.push({ ...step });
    }
  }

  return merged;
}

function rewriteWalkways(
  steps: RouteStep[],
  nodesById: Map<string, StationNode>
): RouteStep[] {
  return steps.map((step, i) => {
    if (step.edgeType !== "walkway" || step.floorChange) return step;

    const to = nodesById.get(step.toNode);
    if (to && LANDMARK_TYPES.has(to.type)) {
      const dest = landmarkName(to);
      return { ...step, instruction: dest ? `Walk to ${dest}` : step.instruction };
    }

    const next = steps[i + 1];
    if (next) {
      const nextFrom = nodesById.get(next.fromNode);
      const hintNode =
        nextFrom && LANDMARK_TYPES.has(nextFrom.type)
          ? nextFrom
          : nodesById.get(next.toNode);
      const hint = hintNode ? landmarkName(hintNode) : "";
      if (hint) {
        return { ...step, instruction: `Walk to ${hint}` };
      }
    }

    return { ...step, instruction: `Walk on ${step.floor}` };
  });
}
