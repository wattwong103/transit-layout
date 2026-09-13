import test from "node:test";
import assert from "node:assert/strict";
import type { FloorId, Route, StationEdge, StationNode } from "../src/types/station";
import { getFloorContinuations, getFloorRouteSegments, getIsometricRoutePoints, projectElevatorEndpoints } from "../src/lib/route-display";
import { toIsometric, getElevation } from "../src/lib/isometric";
import { buildGraph } from "../src/lib/graph";
import { findShortestPath } from "../src/lib/pathfinding";
import { formatRoute } from "../src/lib/route-formatter";

function node(id: string, floor: FloorId, x: number, y: number): StationNode {
  return { id, floor, position: { x, y }, label: id, type: "junction" };
}
function route(nodeIds: string[]): Route { return { nodeIds, steps: [], totalTime: 0 }; }

test("preserves walkway bends independently of merged steps", () => {
  const nodes = [node("a", "1F", 0, 0), node("bend", "1F", 5, 8), node("b", "1F", 10, 0)];
  const edges: StationEdge[] = [
    { id: "ab", from: "a", to: "bend", type: "walkway", weight: 1, bidirectional: true, accessible: true },
    { id: "bb", from: "bend", to: "b", type: "walkway", weight: 1, bidirectional: true, accessible: true },
  ];
  const formatted = formatRoute(
    { nodeIds: nodes.map((n) => n.id), edges, totalWeight: 2 },
    new Map(nodes.map((n) => [n.id, n]))
  );
  assert.equal(formatted.steps.length, 1);
  assert.deepEqual(formatted.nodeIds, ["a", "bend", "b"]);
  assert.deepEqual(getFloorRouteSegments(formatted, new Map(nodes.map((n) => [n.id, n])), "1F")[0].map((p) => p.nodeId), ["a", "bend", "b"]);
});

test("directed edges reject reverse traversal while bidirectional paths retain reverse orientation", () => {
  const directed: StationEdge = { id: "edge", from: "a", to: "b", type: "walkway", weight: 1, bidirectional: false, accessible: true };
  const forward = findShortestPath(buildGraph([directed]), "a", "b");
  assert.deepEqual(forward?.nodeIds, ["a", "b"]);
  assert.equal(findShortestPath(buildGraph([directed]), "b", "a"), null);
  assert.deepEqual(findShortestPath(buildGraph([{ ...directed, bidirectional: true }]), "b", "a")?.nodeIds, ["b", "a"]);

  const nodes = [node("a", "B1", 0, 0), node("b", "1F", 1, 1)];
  const map = new Map(nodes.map((item) => [item.id, item]));
  const directedRoute = route(forward!.nodeIds);
  assert.equal(getFloorContinuations(directedRoute, map, "B1")[0].direction, "departure");
  assert.equal(getFloorContinuations(directedRoute, map, "1F")[0].direction, "arrival");
});

test("leaving and re-entering a floor creates separate segments without a shortcut", () => {
  const nodes = [node("a", "1F", 0, 0), node("b", "1F", 1, 0), node("c", "2F", 50, 50), node("d", "1F", 100, 0), node("e", "1F", 101, 0)];
  const segments = getFloorRouteSegments(route(nodes.map((n) => n.id)), new Map(nodes.map((n) => [n.id, n])), "1F");
  assert.deepEqual(segments.map((s) => s.map((p) => p.nodeId)), [["a", "b"], ["d", "e"]]);
});

test("continuation labels use the on-floor endpoint and traversal target", () => {
  const nodes = [node("lower", "B1", 10, 20), node("upper", "1F", 30, 40)];
  const map = new Map(nodes.map((n) => [n.id, n]));
  assert.deepEqual(getFloorContinuations(route(["lower", "upper"]), map, "B1"), [{ nodeId: "lower", position: { x: 10, y: 20 }, direction: "departure", otherFloor: "1F" }]);
  assert.deepEqual(getFloorContinuations(route(["lower", "upper"]), map, "1F"), [{ nodeId: "upper", position: { x: 30, y: 40 }, direction: "arrival", otherFloor: "B1" }]);
  assert.deepEqual(getFloorContinuations(route(["upper", "lower"]), map, "1F"), [{ nodeId: "upper", position: { x: 30, y: 40 }, direction: "departure", otherFloor: "B1" }]);
  assert.deepEqual(getFloorContinuations(route(["upper", "lower"]), map, "B1"), [{ nodeId: "lower", position: { x: 10, y: 20 }, direction: "arrival", otherFloor: "1F" }]);
});

test("reversed routes preserve point orientation", () => {
  const nodes = [node("a", "B1", 0, 0), node("b", "1F", 10, 20), node("c", "2F", 30, 40)];
  const map = new Map(nodes.map((n) => [n.id, n]));
  assert.deepEqual(getIsometricRoutePoints(route(["c", "b", "a"]), map).map((p) => p.nodeId), ["c", "b", "a"]);
});

test("elevator projection uses both endpoints and does not mutate source positions", () => {
  const from = node("from", "B1", 10, 20);
  const to = node("to", "B2", 30, 40);
  const before = JSON.stringify([from.position, to.position]);
  const projected = projectElevatorEndpoints(from, to);
  assert.equal(projected.kind, "schematic-connection");
  assert.deepEqual(
    { x: projected.from.x, y: projected.from.y },
    toIsometric(from.position.x, from.position.y, getElevation(from.floor))
  );
  assert.deepEqual(
    { x: projected.to.x, y: projected.to.y },
    toIsometric(to.position.x, to.position.y, getElevation(to.floor))
  );
  assert.equal(JSON.stringify([from.position, to.position]), before);
  assert.equal(projectElevatorEndpoints(from, node("aligned", "B2", 10, 20)).kind, "aligned-shaft");
});
