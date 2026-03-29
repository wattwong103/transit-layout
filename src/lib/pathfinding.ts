import { Graph } from "./graph";
import { StationEdge } from "@/types/station";

export interface PathResult {
  nodeIds: string[];
  edges: StationEdge[];
  totalWeight: number;
}

interface RouteOptions {
  accessibleOnly: boolean;
}

/**
 * Dijkstra's shortest path between two nodes.
 * Returns null if no path exists.
 */
export function findShortestPath(
  graph: Graph,
  startId: string,
  endId: string,
  options: RouteOptions = { accessibleOnly: false }
): PathResult | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: StationEdge } | null>();
  const visited = new Set<string>();

  // Simple priority queue using sorted array (graph is small enough)
  const queue: { nodeId: string; dist: number }[] = [];

  dist.set(startId, 0);
  prev.set(startId, null);
  queue.push({ nodeId: startId, dist: 0 });

  while (queue.length > 0) {
    // Sort by distance and take the closest
    queue.sort((a, b) => a.dist - b.dist);
    const current = queue.shift()!;

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    if (current.nodeId === endId) break;

    const neighbors = graph.adjacency.get(current.nodeId) || [];
    for (const { to, edge } of neighbors) {
      if (visited.has(to)) continue;

      // Skip inaccessible edges in accessible mode
      if (options.accessibleOnly && !edge.accessible) continue;

      const weight = edgeWeight(edge, options);
      if (weight === Infinity) continue;

      const newDist = current.dist + weight;
      const existingDist = dist.get(to) ?? Infinity;

      if (newDist < existingDist) {
        dist.set(to, newDist);
        prev.set(to, { nodeId: current.nodeId, edge });
        queue.push({ nodeId: to, dist: newDist });
      }
    }
  }

  // Reconstruct path
  if (!prev.has(endId)) return null;

  const nodeIds: string[] = [];
  const edges: StationEdge[] = [];
  let current: string | undefined = endId;

  while (current !== undefined) {
    nodeIds.unshift(current);
    const prevEntry = prev.get(current);
    if (prevEntry) {
      edges.unshift(prevEntry.edge);
      current = prevEntry.nodeId;
    } else {
      break;
    }
  }

  return {
    nodeIds,
    edges,
    totalWeight: dist.get(endId) ?? 0,
  };
}

function edgeWeight(edge: StationEdge, options: RouteOptions): number {
  let base = edge.weight;

  if (options.accessibleOnly && !edge.accessible) {
    return Infinity;
  }

  // Small penalty for floor changes (orientation cost)
  if (edge.floorsConnected) {
    base += 10;
  }

  return base;
}
